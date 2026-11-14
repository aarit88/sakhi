import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import {
  accessAuditLogs,
  bodyMapLogs,
  clinicianNotes,
  doctorShareTokens,
  medicalReports,
  moodLogs,
  periodLogs,
  sleepLogs,
  symptomLogs,
  users,
} from '@db/schema.ts';
import { computeCycleInfo } from '@/lib/clinical/cycleUtils';
import { generateDoctorBriefSummary } from '@/lib/gemini';

export async function GET(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const shares = await db
      .select()
      .from(doctorShareTokens)
      .where(eq(doctorShareTokens.token, token))
      .limit(1);

    const share = shares[0];
    if (!share) {
      return NextResponse.json({ message: 'Invalid share token.' }, { status: 404 });
    }
    if (share.revokedAt) {
      return NextResponse.json({ message: 'This access token has been revoked by the patient.' }, { status: 403 });
    }
    if (new Date(share.expiresAt) < new Date()) {
      return NextResponse.json({ message: 'This consultation share link has expired.' }, { status: 403 });
    }

    const scopes = JSON.parse(share.scopesJson) as {
      cycle: boolean;
      symptoms: boolean;
      bodyMap: boolean;
      reports: boolean;
      aiSummary: boolean;
    };

    const patientRows = await db.select().from(users).where(eq(users.id, share.patientUserId)).limit(1);
    const patient = patientRows[0];
    if (!patient) return NextResponse.json({ message: 'Patient record unavailable' }, { status: 404 });

    const [periods, symptoms, moods, sleeps, bodyMaps, reports, notes] = await Promise.all([
      scopes.cycle ? db.select().from(periodLogs).where(eq(periodLogs.userId, patient.id)).orderBy(desc(periodLogs.startDate)).limit(12) : Promise.resolve([]),
      scopes.symptoms ? db.select().from(symptomLogs).where(eq(symptomLogs.userId, patient.id)).orderBy(desc(symptomLogs.recordedAt)).limit(30) : Promise.resolve([]),
      scopes.symptoms ? db.select().from(moodLogs).where(eq(moodLogs.userId, patient.id)).orderBy(desc(moodLogs.recordedAt)).limit(30) : Promise.resolve([]),
      scopes.symptoms ? db.select().from(sleepLogs).where(eq(sleepLogs.userId, patient.id)).orderBy(desc(sleepLogs.recordedAt)).limit(30) : Promise.resolve([]),
      scopes.bodyMap ? db.select().from(bodyMapLogs).where(eq(bodyMapLogs.userId, patient.id)).orderBy(desc(bodyMapLogs.recordedAt)).limit(25) : Promise.resolve([]),
      scopes.reports ? db.select().from(medicalReports).where(eq(medicalReports.userId, patient.id)).orderBy(desc(medicalReports.reportDate)).limit(10) : Promise.resolve([]),
      db.select().from(clinicianNotes).where(eq(clinicianNotes.shareTokenId, share.id)).orderBy(desc(clinicianNotes.createdAt)),
    ]);

    const cycleInfo = scopes.cycle
      ? computeCycleInfo(
          periods.map((p) => new Date(p.startDate)),
          patient.cycleLengthAvg || 28
        )
      : null;

    const accessedSections = Object.entries(scopes)
      .filter(([, allowed]) => allowed)
      .map(([k]) => k);

    const viewerLabel = request.nextUrl.searchParams.get('clinician') || share.doctorName || 'Authorized Clinician';
    await db.insert(accessAuditLogs).values({
      shareTokenId: share.id,
      patientUserId: patient.id,
      viewerLabel,
      action: 'VIEWED_CONSENTED_SUMMARY',
      accessedSectionsJson: JSON.stringify(accessedSections),
      ipAddress: request.headers.get('x-forwarded-for') || 'web-portal',
    });

    let aiSummaryText: string | null = null;
    if (scopes.aiSummary) {
      const rawBrief = [
        `Patient: ${patient.name || 'Patient'}, Age: ${patient.age ?? 'Not provided'}, Blood Group: ${patient.bloodGroup || 'Not provided'}`,
        cycleInfo ? `Cycle: Day ${cycleInfo.day} (${cycleInfo.phase}), Avg Length: ${cycleInfo.cycleLength}d, Next Est: ${cycleInfo.nextPeriod}` : 'Cycle scope disabled',
        `Logged Symptoms (${symptoms.length}): ${symptoms.slice(0, 8).map((s) => `${s.type} (${s.severity}/10)`).join('; ') || 'None'}`,
        `3D Body-Map Clusters (${bodyMaps.length}): ${bodyMaps.slice(0, 8).map((b) => `${b.regionLabel}: ${b.symptom} ${b.severity}/10 (${b.duration || 'unspecified'})`).join('; ') || 'None'}`,
        `Medical Reports (${reports.length}): ${reports.map((r) => r.title).join(', ') || 'None'}`,
      ].join('\n');
      aiSummaryText = await generateDoctorBriefSummary(rawBrief);
    }

    return NextResponse.json({
      success: true,
      share: {
        id: share.id,
        label: share.label,
        doctorName: share.doctorName,
        expiresAt: share.expiresAt,
        scopes,
      },
      patient: {
        name: patient.name,
        age: patient.age,
        bloodGroup: patient.bloodGroup,
        conditions: patient.conditionsJson ? JSON.parse(patient.conditionsJson) : [],
      },
      cycleInfo,
      periods,
      symptoms,
      moods,
      sleeps,
      bodyMaps,
      reports: reports.map((r) => ({
        id: r.id,
        title: r.title,
        reportDate: r.reportDate,
        verifiedByUser: r.verifiedByUser,
        extractedData: r.extractedDataJson ? JSON.parse(r.extractedDataJson) : null,
      })),
      aiSummaryText,
      clinicianNotes: notes,
    });
  } catch (error) {
    console.error('Doctor portal GET error:', error);
    return NextResponse.json({ message: 'Failed to load patient share portal' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const shares = await db
      .select()
      .from(doctorShareTokens)
      .where(eq(doctorShareTokens.token, token))
      .limit(1);

    const share = shares[0];
    if (!share || share.revokedAt || new Date(share.expiresAt) < new Date()) {
      return NextResponse.json({ message: 'Share token is invalid, revoked, or expired.' }, { status: 403 });
    }

    const body = await request.json();
    const clinicianName = typeof body.clinicianName === 'string' && body.clinicianName.trim()
      ? body.clinicianName.trim().slice(0, 120)
      : share.doctorName || 'Consulting Clinician';
    const note = typeof body.note === 'string' ? body.note.trim() : '';
    const recommendations = typeof body.recommendations === 'string' ? body.recommendations.trim().slice(0, 1000) : null;

    if (note.length < 5 || note.length > 2000) {
      return NextResponse.json({ message: 'Clinician note (5–2000 chars) is required.' }, { status: 400 });
    }

    const inserted = await db
      .insert(clinicianNotes)
      .values({
        shareTokenId: share.id,
        patientUserId: share.patientUserId,
        clinicianName,
        note,
        recommendations,
      })
      .returning();

    await db.insert(accessAuditLogs).values({
      shareTokenId: share.id,
      patientUserId: share.patientUserId,
      viewerLabel: clinicianName,
      action: 'ADDED_CLINICIAN_NOTE',
      accessedSectionsJson: JSON.stringify(['clinician_notes']),
      ipAddress: request.headers.get('x-forwarded-for') || 'web-portal',
    });

    return NextResponse.json({ success: true, note: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error('Doctor portal note POST error:', error);
    return NextResponse.json({ message: 'Failed to save clinician note' }, { status: 500 });
  }
}
