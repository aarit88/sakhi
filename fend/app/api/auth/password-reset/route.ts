import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { otpVerifications, users } from '@db/schema.ts';
import { checkRateLimit } from '@/lib/session';

function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// POST /api/auth/password-reset -> request password reset code
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail) {
      return NextResponse.json({ message: 'Valid email is required.' }, { status: 400 });
    }

    const rl = checkRateLimit(`reset:${normalizedEmail}`, 5, 10 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ message: 'Too many reset requests. Please try again shortly.' }, { status: 429 });
    }

    const found = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, normalizedEmail), isNull(users.deletedAt)))
      .limit(1);

    let previewCode: string | undefined;
    if (found[0]) {
      const code = String(crypto.randomInt(100000, 999999));
      await db.insert(otpVerifications).values({
        userId: found[0].id,
        purpose: 'password_reset',
        target: normalizedEmail,
        codeHash: hashCode(code),
        expiresAt: new Date(Date.now() + 15 * 60_000),
      });
      if (!process.env.SMTP_HOST) {
        previewCode = code;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If an account matches that email, a 6-digit reset code is active for 15 minutes.',
      previewCode,
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ message: 'Failed to process reset request.' }, { status: 500 });
  }
}

// PUT /api/auth/password-reset -> confirm reset code & update password
export async function PUT(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const resetCode = typeof code === 'string' ? code.trim() : '';

    if (!normalizedEmail || resetCode.length !== 6 || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Email, 6-digit reset code, and new password (min 6 chars) are required.' },
        { status: 400 }
      );
    }

    const records = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.purpose, 'password_reset'),
          eq(otpVerifications.target, normalizedEmail),
          isNull(otpVerifications.verifiedAt),
          gt(otpVerifications.expiresAt, new Date())
        )
      )
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);

    const record = records[0];
    if (!record || record.attempts >= 5 || record.codeHash !== hashCode(resetCode)) {
      if (record) {
        await db
          .update(otpVerifications)
          .set({ attempts: record.attempts + 1 })
          .where(eq(otpVerifications.id, record.id));
      }
      return NextResponse.json({ message: 'Invalid or expired password reset code.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.email, normalizedEmail));

    await db
      .update(otpVerifications)
      .set({ verifiedAt: new Date() })
      .where(eq(otpVerifications.id, record.id));

    return NextResponse.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
  } catch (error) {
    console.error('Password reset confirm error:', error);
    return NextResponse.json({ message: 'Failed to update password.' }, { status: 500 });
  }
}
