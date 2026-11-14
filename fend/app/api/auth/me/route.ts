import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        role: user.role,
        age: user.age,
        bloodGroup: user.bloodGroup,
        cycleLengthAvg: user.cycleLengthAvg,
        periodLengthAvg: user.periodLengthAvg,
        conditions: user.conditionsJson ? JSON.parse(user.conditionsJson) : [],
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ message: 'Failed to verify session' }, { status: 500 });
  }
}
