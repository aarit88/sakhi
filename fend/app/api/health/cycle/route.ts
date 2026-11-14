import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { periodLogs } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';
import { computeCycleInfo } from '@/lib/clinical/cycleUtils';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const logs = await db
      .select()
      .from(periodLogs)
      .where(eq(periodLogs.userId, user.id))
      .orderBy(desc(periodLogs.startDate));

    const cycleInfo = computeCycleInfo(
      logs.map((l) => new Date(l.startDate)),
      user.cycleLengthAvg || 28
    );

    return NextResponse.json({ success: true, logs, cycleInfo });
  } catch (error) {
    console.error('Cycle GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch cycle logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const body = await request.json();
    const startRaw = body.startDate || body.date;
    if (!startRaw) {
      return NextResponse.json({ message: 'startDate is required' }, { status: 400 });
    }
    const startDate = new Date(startRaw);
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json({ message: 'Invalid startDate' }, { status: 400 });
    }

    const endDate = body.endDate ? new Date(body.endDate) : null;
    const inserted = await db
      .insert(periodLogs)
      .values({
        userId: user.id,
        startDate,
        endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
        flowIntensity: body.flowIntensity || body.flow || 'medium',
        cycleDuration: typeof body.cycleDuration === 'number' ? body.cycleDuration : null,
        irregularities: typeof body.irregularities === 'string' ? body.irregularities.slice(0, 240) : null,
        crampsSeverity: typeof body.crampsSeverity === 'number' ? Math.min(10, Math.max(0, Math.round(body.crampsSeverity))) : null,
        spotting: Boolean(body.spotting),
        symptomsJson: Array.isArray(body.symptoms) ? JSON.stringify(body.symptoms) : null,
        notes: typeof body.notes === 'string' ? body.notes.slice(0, 600) : null,
      })
      .returning();

    return NextResponse.json({ success: true, log: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error('Cycle POST error:', error);
    return NextResponse.json({ message: 'Failed to log cycle entry' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const body = await request.json();
    const id = Number(body.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: 'Valid cycle log id required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (body.startDate) updates.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updates.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.flowIntensity) updates.flowIntensity = body.flowIntensity;
    if (body.irregularities !== undefined) updates.irregularities = body.irregularities;
    if (body.crampsSeverity !== undefined) updates.crampsSeverity = body.crampsSeverity;
    if (body.spotting !== undefined) updates.spotting = Boolean(body.spotting);
    if (body.notes !== undefined) updates.notes = body.notes;

    const updated = await db
      .update(periodLogs)
      .set(updates)
      .where(and(eq(periodLogs.id, id), eq(periodLogs.userId, user.id)))
      .returning();

    if (!updated[0]) return NextResponse.json({ message: 'Cycle log not found' }, { status: 404 });
    return NextResponse.json({ success: true, log: updated[0] });
  } catch (error) {
    console.error('Cycle PATCH error:', error);
    return NextResponse.json({ message: 'Failed to update cycle log' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const id = Number(request.nextUrl.searchParams.get('id'));
    if (!Number.isInteger(id)) {
      return NextResponse.json({ message: 'Valid id query parameter required' }, { status: 400 });
    }

    const deleted = await db
      .delete(periodLogs)
      .where(and(eq(periodLogs.id, id), eq(periodLogs.userId, user.id)))
      .returning();

    if (!deleted[0]) return NextResponse.json({ message: 'Cycle log not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cycle DELETE error:', error);
    return NextResponse.json({ message: 'Failed to delete cycle log' }, { status: 500 });
  }
}
