import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
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
} from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';
import { computeCycleInfo } from '@/lib/clinical/cycleUtils';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const [periods, moods, sleeps, hydrations, activities, symptoms, bodyMaps, reports] =
      await Promise.all([
        db.select().from(periodLogs).where(eq(periodLogs.userId, user.id)).orderBy(desc(periodLogs.startDate)).limit(12),
        db.select().from(moodLogs).where(eq(moodLogs.userId, user.id)).orderBy(desc(moodLogs.recordedAt)).limit(30),
        db.select().from(sleepLogs).where(eq(sleepLogs.userId, user.id)).orderBy(desc(sleepLogs.recordedAt)).limit(30),
        db.select().from(hydrationLogs).where(eq(hydrationLogs.userId, user.id)).orderBy(desc(hydrationLogs.recordedAt)).limit(30),
        db.select().from(activityLogs).where(eq(activityLogs.userId, user.id)).orderBy(desc(activityLogs.recordedAt)).limit(30),
        db.select().from(symptomLogs).where(eq(symptomLogs.userId, user.id)).orderBy(desc(symptomLogs.recordedAt)).limit(30),
        db.select().from(bodyMapLogs).where(eq(bodyMapLogs.userId, user.id)).orderBy(desc(bodyMapLogs.recordedAt)).limit(20),
        db.select().from(medicalReports).where(eq(medicalReports.userId, user.id)).orderBy(desc(medicalReports.reportDate)).limit(10),
      ]);

    const cycleInfo = computeCycleInfo(
      periods.map((p) => new Date(p.startDate)),
      user.cycleLengthAvg || 28
    );

    const avgMood = moods.length
      ? Number((moods.slice(0, 7).reduce((acc, m) => acc + m.score, 0) / Math.min(moods.length, 7)).toFixed(1))
      : null;
    const avgSleep = sleeps.length
      ? Number((sleeps.slice(0, 7).reduce((acc, s) => acc + s.hours, 0) / Math.min(sleeps.length, 7)).toFixed(1))
      : null;

    const latestHydration = hydrations[0] ?? null;
    const latestActivity = activities[0] ?? null;

    const insights: string[] = [];
    if (cycleInfo.day > 0) {
      insights.push(
        `Cycle Day ${cycleInfo.day} (${cycleInfo.phase}). ${cycleInfo.predictionNote}`
      );
    } else {
      insights.push('Log your recent period start date to unlock personalized cycle phase and fertile-window estimates.');
    }
    if (avgSleep !== null && avgSleep < 7) {
      insights.push(`Your recent average sleep is ${avgSleep} hrs/night. Prioritizing 7–8 hrs can ease fatigue and hormonal mood swings.`);
    }
    if (bodyMaps.length > 0) {
      const top = bodyMaps[0];
      insights.push(`Latest body-map note: ${top.regionLabel} — ${top.symptom} (${top.severity}/10).`);
    }
    if (reports.length > 0) {
      insights.push(`${reports.length} lab report${reports.length === 1 ? '' : 's'} stored and ready for side-by-side comparison or clinician sharing.`);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      cycleInfo,
      overview: {
        avgMood7d: avgMood,
        avgSleep7d: avgSleep,
        latestHydration: latestHydration ? { intake: latestHydration.intake, target: latestHydration.target } : null,
        latestActivity: latestActivity ? { steps: latestActivity.steps, calories: latestActivity.calories } : null,
        totalBodyMapLogs: bodyMaps.length,
        totalReports: reports.length,
      },
      insights,
      records: {
        periods,
        moods,
        sleeps,
        hydrations,
        activities,
        symptoms,
        bodyMaps,
        reports,
      },
    });
  } catch (error) {
    console.error('Health dashboard error:', error);
    return NextResponse.json({ message: 'Failed to load health summary' }, { status: 500 });
  }
}
