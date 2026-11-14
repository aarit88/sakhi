import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@db/index.ts';
import { doctorProfiles, users } from '@db/schema.ts';
import { ensureDefaultConsents } from '@db/users.ts';
import {
  buildSessionCookieOptions,
  checkRateLimit,
  createSessionToken,
} from '@/lib/session';

const registerSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email(),
  password: z.string().min(6).max(128),
  role: z.enum(['USER', 'DOCTOR']).optional(),
  specialty: z.string().max(120).optional(),
  clinicName: z.string().max(120).optional(),
  registrationNumber: z.string().max(80).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'local';
    const rl = checkRateLimit(`register:${ip}`, 15, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ message: 'Too many signup attempts. Please wait a minute.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Please provide a valid email and password (min 6 characters).' }, { status: 400 });
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing[0]) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const role = parsed.data.role === 'DOCTOR' ? 'DOCTOR' : 'USER';
    const displayName = parsed.data.name?.trim() || normalizedEmail.split('@')[0];

    const inserted = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
        name: displayName,
        role,
      })
      .returning();

    const user = inserted[0];
    await ensureDefaultConsents(user.id);

    if (role === 'DOCTOR') {
      await db.insert(doctorProfiles).values({
        userId: user.id,
        fullName: displayName,
        specialty: parsed.data.specialty || 'Obstetrics & Gynecology',
        registrationNumber: parsed.data.registrationNumber || `REG-${user.id}`,
        clinicName: parsed.data.clinicName || 'SAKHI Partner Clinic',
        city: 'India',
        verified: true,
      });
    }

    const token = createSessionToken({ id: user.id, role: user.role, email: user.email });
    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
    response.cookies.set({ ...buildSessionCookieOptions(), value: token });
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ message: 'Failed to create account.' }, { status: 500 });
  }
}
