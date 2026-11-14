import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getOrCreateFirebaseUser } from '@db/users.ts';
import { buildSessionCookieOptions, createSessionToken } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ message: 'Firebase ID token is required' }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded?.uid || !decoded?.email) {
      return NextResponse.json({ message: 'Invalid Firebase identity payload' }, { status: 401 });
    }

    const user = await getOrCreateFirebaseUser(decoded.uid, decoded.email, decoded.name);
    if (!user) {
      return NextResponse.json({ message: 'Failed to synchronize user account' }, { status: 500 });
    }

    const sessionToken = createSessionToken({ id: user.id, role: user.role, email: user.email });
    const response = NextResponse.json({
      success: true,
      token: sessionToken,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    response.cookies.set({ ...buildSessionCookieOptions(), value: sessionToken });
    return response;
  } catch (error) {
    console.error('Google Sign-In session error:', error);
    return NextResponse.json({ message: 'Google Sign-In verification failed' }, { status: 401 });
  }
}
