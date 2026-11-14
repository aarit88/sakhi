import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@db/index.ts';
import { users } from '@db/schema.ts';
import { ensureDefaultConsents } from '@db/users.ts';
import {
  buildSessionCookieOptions,
  checkRateLimit,
  createSessionToken,
} from '@/lib/session';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'local';
    const rl = checkRateLimit(`login:${ip}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ message: 'Too many login attempts. Please wait a minute.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Valid email and password (min 6 chars) required.' }, { status: 400 });
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const found = await db
      .select()
      .from(users)
      .where(and(eq(users.email, normalizedEmail), isNull(users.deletedAt)))
      .limit(1);

    const user = found[0];
    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
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
        role: user.role,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        age: user.age,
        cycleLengthAvg: user.cycleLengthAvg,
        onboardingComplete: user.onboardingComplete,
      },
    });
    response.cookies.set({ ...buildSessionCookieOptions(), value: token });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Authentication failed.' }, { status: 500 });
  }
}
