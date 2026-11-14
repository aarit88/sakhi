import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import {
  activityLogs,
  bodyMapLogs,
  hydrationLogs,
  medicalReports,
  moodLogs,
  periodLogs,
  sleepLogs,
  symptomLogs,
  userConsents,
  users,
} from '@db/schema.ts';
import { ensureDefaultConsents } from '@db/users.ts';
import { getAuthenticatedUser, SESSION_COOKIE_NAME } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const consents = await ensureDefaultConsents(user.id);
    const isExport = request.nextUrl.searchParams.get('export') === '1';

    if (isExport) {
      const [periods, symptoms, moods, sleeps, hydrations, activities, bodyMaps, reports] =
        await Promise.all([
          db.select().from(periodLogs).where(eq(periodLogs.userId, user.id)).orderBy(desc(periodLogs.startDate)),
          db.select().from(symptomLogs).where(eq(symptomLogs.userId, user.id)).orderBy(desc(symptomLogs.recordedAt)),
          db.select().from(moodLogs).where(eq(moodLogs.userId, user.id)).orderBy(desc(moodLogs.recordedAt)),
          db.select().from(sleepLogs).where(eq(sleepLogs.userId, user.id)).orderBy(desc(sleepLogs.recordedAt)),
          db.select().from(hydrationLogs).where(eq(hydrationLogs.userId, user.id)).orderBy(desc(hydrationLogs.recordedAt)),
          db.select().from(activityLogs).where(eq(activityLogs.userId, user.id)).orderBy(desc(activityLogs.recordedAt)),
          db.select().from(bodyMapLogs).where(eq(bodyMapLogs.userId, user.id)).orderBy(desc(bodyMapLogs.recordedAt)),
          db.select().from(medicalReports).where(eq(medicalReports.userId, user.id)).orderBy(desc(medicalReports.reportDate)),
        ]);

      return NextResponse.json({
        exportedAt: new Date().toISOString(),
        profile: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          age: user.age,
          bloodGroup: user.bloodGroup,
          cycleLengthAvg: user.cycleLengthAvg,
          periodLengthAvg: user.periodLengthAvg,
          conditions: user.conditionsJson ? JSON.parse(user.conditionsJson) : [],
        },
        consents,
        records: { periods, symptoms, moods, sleeps, hydrations, activities, bodyMaps, reports },
      });
    }

    return NextResponse.json({
      profile: {
        id: user.id,
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
      consents,
    });
  } catch (error) {
    console.error('User profile GET error:', error);
    return NextResponse.json({ message: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof body.name === 'string') updates.name = body.name.trim().slice(0, 120);
    if (typeof body.phone === 'string') updates.phone = body.phone.trim().slice(0, 20);
    if (typeof body.age === 'number' && body.age >= 10 && body.age <= 110) updates.age = Math.round(body.age);
    if (typeof body.bloodGroup === 'string') updates.bloodGroup = body.bloodGroup.trim().slice(0, 10);
    if (typeof body.cycleLengthAvg === 'number' && body.cycleLengthAvg >= 18 && body.cycleLengthAvg <= 55) {
      updates.cycleLengthAvg = Math.round(body.cycleLengthAvg);
    }
    if (typeof body.periodLengthAvg === 'number' && body.periodLengthAvg >= 2 && body.periodLengthAvg <= 12) {
      updates.periodLengthAvg = Math.round(body.periodLengthAvg);
    }
    if (Array.isArray(body.conditions)) {
      updates.conditionsJson = JSON.stringify(body.conditions.map((c: unknown) => String(c).slice(0, 60)));
    }
    if (typeof body.onboardingComplete === 'boolean') updates.onboardingComplete = body.onboardingComplete;

    const updatedRows = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, user.id))
      .returning();

    if (Array.isArray(body.consents)) {
      for (const item of body.consents) {
        if (typeof item?.consentType === 'string' && typeof item?.granted === 'boolean') {
          await db
            .update(userConsents)
            .set({ granted: item.granted, updatedAt: new Date() })
            .where(
              and(
                eq(userConsents.userId, user.id),
                eq(userConsents.consentType, item.consentType)
              )
            );
        }
      }
    }

    const consents = await db.select().from(userConsents).where(eq(userConsents.userId, user.id));
    const updated = updatedRows[0];

    return NextResponse.json({
      success: true,
      profile: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone,
        phoneVerified: updated.phoneVerified,
        role: updated.role,
        age: updated.age,
        bloodGroup: updated.bloodGroup,
        cycleLengthAvg: updated.cycleLengthAvg,
        periodLengthAvg: updated.periodLengthAvg,
        conditions: updated.conditionsJson ? JSON.parse(updated.conditionsJson) : [],
        onboardingComplete: updated.onboardingComplete,
      },
      consents,
    });
  } catch (error) {
    console.error('User profile PATCH error:', error);
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    await db.delete(users).where(eq(users.id, user.id));

    const response = NextResponse.json({
      success: true,
      message: 'Account and all associated personal health records permanently deleted.',
    });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json({ message: 'Failed to delete account' }, { status: 500 });
  }
}
