import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { bodyMapLogs, symptomLogs } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';
import { evaluateRedFlags, logSafetyEvent } from '@/lib/clinical/safety';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const logs = await db
      .select()
      .from(bodyMapLogs)
      .where(eq(bodyMapLogs.userId, user.id))
      .orderBy(desc(bodyMapLogs.recordedAt))
      .limit(100);

    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({
        ...l,
        associatedSymptoms: l.associatedSymptomsJson ? JSON.parse(l.associatedSymptomsJson) : [],
        coordinates: l.coordinatesJson ? JSON.parse(l.coordinatesJson) : null,
      })),
    });
  } catch (error) {
    console.error('BodyMap GET error:', error);
    return NextResponse.json({ message: 'Failed to load body map logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const body = await request.json();
    const regionId = typeof body.regionId === 'string' ? body.regionId.trim() : '';
    const regionLabel = typeof body.regionLabel === 'string' ? body.regionLabel.trim() : regionId;
    const viewSide = ['front', 'back', 'left', 'right'].includes(body.viewSide) ? body.viewSide : 'front';
    const symptom = typeof body.symptom === 'string' ? body.symptom.trim() : '';

    if (!regionId || !symptom) {
      return NextResponse.json({ message: 'regionId and symptom are required' }, { status: 400 });
    }

    const severity = Math.min(10, Math.max(1, Math.round(Number(body.severity) || 5)));
    const duration = typeof body.duration === 'string' ? body.duration.slice(0, 80) : null;
    const frequency = typeof body.frequency === 'string' ? body.frequency.slice(0, 80) : null;
    const onset = typeof body.onset === 'string' ? body.onset.slice(0, 80) : null;
    const cycleContext = typeof body.cycleContext === 'string' ? body.cycleContext.slice(0, 80) : null;
    const notes = typeof body.notes === 'string' ? body.notes.slice(0, 800) : null;
    const associatedSymptoms = Array.isArray(body.associatedSymptoms)
      ? body.associatedSymptoms.map((s: unknown) => String(s).slice(0, 60))
      : [];

    const safety = evaluateRedFlags(`${regionLabel} ${symptom} ${notes || ''}`, severity);
    if (safety.triggered) {
      await logSafetyEvent({ userId: user.id, source: 'body_map', evaluation: safety });
    }

    const inserted = await db
      .insert(bodyMapLogs)
      .values({
        userId: user.id,
        regionId,
        regionLabel,
        viewSide,
        symptom,
        severity,
        duration,
        frequency,
        onset,
        associatedSymptomsJson: JSON.stringify(associatedSymptoms),
        cycleContext,
        notes,
        coordinatesJson: body.coordinates ? JSON.stringify(body.coordinates) : null,
      })
      .returning();

    // Sync summary symptom into symptomLogs so Dashboard trends stay unified
    await db.insert(symptomLogs).values({
      userId: user.id,
      type: `${regionLabel}: ${symptom}`,
      severity,
      category: 'pain',
      notes: notes || `Captured via 3D Body Map (${viewSide} view)`,
    });

    const row = inserted[0];
    return NextResponse.json(
      {
        success: true,
        log: {
          ...row,
          associatedSymptoms,
          coordinates: row.coordinatesJson ? JSON.parse(row.coordinatesJson) : null,
        },
        safety,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('BodyMap POST error:', error);
    return NextResponse.json({ message: 'Failed to save body map symptom' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const id = Number(request.nextUrl.searchParams.get('id'));
    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: 'Valid id required' }, { status: 400 });
    }

    const deleted = await db
      .delete(bodyMapLogs)
      .where(and(eq(bodyMapLogs.id, id), eq(bodyMapLogs.userId, user.id)))
      .returning();

    if (!deleted[0]) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('BodyMap DELETE error:', error);
    return NextResponse.json({ message: 'Failed to delete entry' }, { status: 500 });
  }
}
