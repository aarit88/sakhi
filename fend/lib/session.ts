import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { users } from '@db/schema.ts';
import { adminAuth } from './firebase-admin';

export const SESSION_COOKIE_NAME = 'sakhi_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface SessionPayload {
  userId: number;
  role: string;
  email: string;
  exp: number;
}

function getSigningSecret(): string {
  const envSecret = process.env.JWT_SECRET;
  if (envSecret && envSecret.length >= 16 && envSecret !== 'dev_secret') {
    return envSecret;
  }
  if (process.env.NODE_ENV === 'production') {
    // Derive deterministic process-scoped key from Cloud SQL DB credential if JWT_SECRET is omitted in runtime
    const seed = `${process.env.SQL_HOST || ''}:${process.env.SQL_DB_NAME || ''}:${process.env.SQL_USER || 'sakhi'}`;
    if (seed.length > 10) {
      return crypto.createHash('sha256').update(seed).digest('hex');
    }
    throw new Error('A strong session secret is required in production.');
  }
  return 'sakhi_local_development_hmac_secret_v1';
}

export function createSessionToken(user: { id: number; role: string; email: string }): string {
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role || 'USER',
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', getSigningSecret())
      .update(encoded)
      .digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload?.userId || !payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(req?: NextRequest | Request) {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
    if (!token && 'cookies' in req && typeof req.cookies?.get === 'function') {
      token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // ignore outside request context
    }
  }

  if (!token) return null;

  // 1. Verify HMAC session cookie / token
  const session = verifySessionToken(token);
  if (session) {
    try {
      const found = await db
        .select()
        .from(users)
        .where(and(eq(users.id, session.userId), isNull(users.deletedAt)))
        .limit(1);
      return found[0] ?? null;
    } catch (error) {
      console.error('Database query failed verifying session user:', error);
      return null;
    }
  }

  // 2. Fallback: verify Firebase ID token sent as Bearer token
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded?.uid) {
      const found = await db
        .select()
        .from(users)
        .where(and(eq(users.uid, decoded.uid), isNull(users.deletedAt)))
        .limit(1);
      return found[0] ?? null;
    }
  } catch {
    // invalid Firebase token
  }

  return null;
}

export function buildSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}

// In-memory sliding-window rate limiter per endpoint/key
const rateStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit = 30, windowMs = 60_000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateStore.get(key);
  if (!entry || entry.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}
