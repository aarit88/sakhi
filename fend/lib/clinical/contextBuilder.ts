import { desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import {
  activityLogs,
  ayurvedicKnowledge,
  bodyMapLogs,
  hydrationLogs,
  medicalReports,
  moodLogs,
  periodLogs,
  sleepLogs,
  symptomLogs,
  users,
} from '@db/schema.ts';
import { computeCycleInfo } from './cycleUtils';

export async function buildAuthorizedUserContext(userId: number) {
  const [
    userRows,
    periods,
    symptoms,
    moods,
    sleeps,
    hydrations,
    activities,
    bodyMaps,
    reports,
    ayurvedaItems,
  ] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(periodLogs).where(eq(periodLogs.userId, userId)).orderBy(desc(periodLogs.startDate)).limit(6),
    db.select().from(symptomLogs).where(eq(symptomLogs.userId, userId)).orderBy(desc(symptomLogs.recordedAt)).limit(12),
    db.select().from(moodLogs).where(eq(moodLogs.userId, userId)).orderBy(desc(moodLogs.recordedAt)).limit(10),
    db.select().from(sleepLogs).where(eq(sleepLogs.userId, userId)).orderBy(desc(sleepLogs.recordedAt)).limit(10),
    db.select().from(hydrationLogs).where(eq(hydrationLogs.userId, userId)).orderBy(desc(hydrationLogs.recordedAt)).limit(10),
    db.select().from(activityLogs).where(eq(activityLogs.userId, userId)).orderBy(desc(activityLogs.recordedAt)).limit(10),
    db.select().from(bodyMapLogs).where(eq(bodyMapLogs.userId, userId)).orderBy(desc(bodyMapLogs.recordedAt)).limit(12),
    db.select().from(medicalReports).where(eq(medicalReports.userId, userId)).orderBy(desc(medicalReports.reportDate)).limit(4),
    db.select().from(ayurvedicKnowledge).limit(6),
  ]);

  const user = userRows[0];
  const cycleInfo = computeCycleInfo(
    periods.map((p) => new Date(p.startDate)),
    user?.cycleLengthAvg || 28
  );

  const avgMood = moods.length ? Number((moods.reduce((a, b) => a + b.score, 0) / moods.length).toFixed(1)) : null;
  const avgSleep = sleeps.length ? Number((sleeps.reduce((a, b) => a + b.hours, 0) / sleeps.length).toFixed(1)) : null;
  const latestHydration = hydrations[0] ?? null;
  const latestActivity = activities[0] ?? null;

  const summaryLines = [
    `Patient Profile: Name=${user?.name || 'User'}, Age=${user?.age ?? 'N/A'}, Cycle Baseline=${cycleInfo.cycleLength}d, Current Phase=${cycleInfo.phase} (Day ${cycleInfo.day || '-'})`,
    `Period Logs (${periods.length}): ${periods.map((p) => `${new Date(p.startDate).toISOString().slice(0, 10)} (${p.flowIntensity || 'unspecified'})`).join('; ') || 'None logged'}`,
    `Recent Mood Avg: ${avgMood ?? 'N/A'}/10 | Recent Sleep Avg: ${avgSleep ?? 'N/A'} hrs | Latest Hydration: ${latestHydration ? `${latestHydration.intake}/${latestHydration.target} L` : 'N/A'} | Latest Steps: ${latestActivity?.steps ?? 'N/A'}`,
    `Recent Symptoms (${symptoms.length}): ${symptoms.slice(0, 6).map((s) => `${s.type} (${s.severity}/10)`).join(', ') || 'None'}`,
    `3D Body Map Pain/Symptom Logs (${bodyMaps.length}): ${bodyMaps.slice(0, 6).map((b) => `${b.regionLabel} (${b.viewSide}): ${b.symptom} ${b.severity}/10${b.duration ? ` for ${b.duration}` : ''}`).join('; ') || 'None'}`,
    `Uploaded Clinical Reports (${reports.length}): ${reports.map((r) => `${r.title} (${new Date(r.reportDate).toISOString().slice(0, 10)})`).join('; ') || 'None'}`,
  ];

  const systemPrompt = `You are SAKHI, a compassionate, evidence-grounded women's health & Ayurvedic wellness companion.
STRICT CLINICAL SAFETY & HONESTY RULES:
1. Never claim to diagnose, prescribe medication, or replace a licensed physician or OB-GYN.
2. Always separate scientific/clinical evidence from traditional Ayurvedic guidance (Pathya/Apathya) and mention contraindications when relevant.
3. Reference the user's actual authorized data below accurately without inventing missing readings.
4. Close actionable answers with a brief reminder to consult a qualified clinician for persistent or changing symptoms.

AUTHORIZED USER CONTEXT:
${summaryLines.join('\n')}

AVAILABLE AYURVEDA KNOWLEDGE TOPICS:
${ayurvedaItems.map((a) => `- ${a.title} [${a.evidenceLevel}]: ${a.condition}`).join('\n')}`;

  return {
    user,
    cycleInfo,
    periods,
    symptoms,
    moods,
    sleeps,
    hydrations,
    activities,
    bodyMaps,
    reports,
    summaryText: summaryLines.join('\n'),
    systemPrompt,
  };
}
