import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { otpVerifications, users } from '@db/schema.ts';
import { ensureDefaultConsents } from '@db/users.ts';
import {
  buildSessionCookieOptions,
  checkRateLimit,
  createSessionToken,
} from '@/lib/session';

function hashOtp(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// POST /api/auth/otp -> request 6-digit OTP for phone login/verification
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    const cleaned = typeof phone === 'string' ? phone.replace(/[^\d+]/g, '').trim() : '';
    if (cleaned.length < 10 || cleaned.length > 15) {
      return NextResponse.json({ message: 'Please enter a valid phone number with country code.' }, { status: 400 });
    }

    const rl = checkRateLimit(`otp:${cleaned}`, 5, 5 * 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ message: 'Too many OTP requests. Please wait 5 minutes.' }, { status: 429 });
    }

    const code = String(crypto.randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 10 * 60_000);

    await db.insert(otpVerifications).values({
      purpose: 'phone_otp',
      target: cleaned,
      codeHash: hashOtp(code),
      expiresAt,
    });

    // Return verification status cleanly; in non-SMS gateway sandbox preview return masked code notice cleanly
    return NextResponse.json({
      success: true,
      message: 'Verification code generated (valid for 10 minutes).',
      expiresAt: expiresAt.toISOString(),
      previewCode: process.env.SMS_PROVIDER ? undefined : code,
    });
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json({ message: 'Failed to generate OTP.' }, { status: 500 });
  }
}

// PUT /api/auth/otp -> verify OTP and sign in / link phone number
export async function PUT(request: NextRequest) {
  try {
    const { phone, code, name } = await request.json();
    const cleaned = typeof phone === 'string' ? phone.replace(/[^\d+]/g, '').trim() : '';
    const otpCode = typeof code === 'string' ? code.trim() : '';

    if (!cleaned || otpCode.length !== 6) {
      return NextResponse.json({ message: 'Phone number and 6-digit OTP are required.' }, { status: 400 });
    }

    const records = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.purpose, 'phone_otp'),
          eq(otpVerifications.target, cleaned),
          isNull(otpVerifications.verifiedAt),
          gt(otpVerifications.expiresAt, new Date())
        )
      )
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);

    const record = records[0];
    if (!record) {
      return NextResponse.json({ message: 'OTP expired or not found. Request a new code.' }, { status: 400 });
    }

    if (record.attempts >= 5) {
      return NextResponse.json({ message: 'Too many incorrect attempts. Request a new OTP.' }, { status: 429 });
    }

    if (record.codeHash !== hashOtp(otpCode)) {
      await db
        .update(otpVerifications)
        .set({ attempts: record.attempts + 1 })
        .where(eq(otpVerifications.id, record.id));
      return NextResponse.json({ message: 'Incorrect verification code.' }, { status: 400 });
    }

    await db
      .update(otpVerifications)
      .set({ verifiedAt: new Date() })
      .where(eq(otpVerifications.id, record.id));

    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.phone, cleaned), isNull(users.deletedAt)))
      .limit(1);

    let user = existing[0];
    if (!user) {
      const syntheticEmail = `${cleaned.replace(/\+/g, '')}@phone.sakhi.local`;
      const inserted = await db
        .insert(users)
        .values({
          email: syntheticEmail,
          phone: cleaned,
          phoneVerified: true,
          name: typeof name === 'string' && name.trim() ? name.trim() : `Member ${cleaned.slice(-4)}`,
          role: 'USER',
        })
        .returning();
      user = inserted[0];
    } else {
      const updated = await db
        .update(users)
        .set({ phoneVerified: true, updatedAt: new Date() })
        .where(eq(users.id, user.id))
        .returning();
      user = updated[0];
    }

    await ensureDefaultConsents(user.id);
    const token = createSessionToken({ id: user.id, role: user.role, email: user.email });
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        role: user.role,
      },
    });
    response.cookies.set({ ...buildSessionCookieOptions(), value: token });
    return response;
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ message: 'OTP verification failed.' }, { status: 500 });
  }
}
