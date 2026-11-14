import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { symptomLogs } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';
import { evaluateRedFlags, logSafetyEvent } from '@/lib/clinical/safety';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const logs = await db.select().from(symptomLogs).where(eq(symptomLogs.userId, user.id)).orderBy(desc(symptomLogs.recordedAt)).limit(60);
  return NextResponse.json({ success: true, logs });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    const body = await request.json();
    const type = typeof body.type === 'string' && body.type.trim() ? body.type.trim().slice(0, 120) : null;
    if (!type) return NextResponse.json({ message: 'Symptom or event type is required' }, { status: 400 });

    const rawSeverity = Number(body.severity ?? 5);
    const severity = Math.min(10, Math.max(1, Number.isFinite(rawSeverity) ? Math.round(rawSeverity) : 5));
    const category = typeof body.category === 'string' ? body.category.slice(0, 40) : 'general';
    const notes = typeof body.notes === 'string' ? body.notes.slice(0, 600) : null;
    const recordedAt = body.recordedAt || body.date ? new Date(body.recordedAt || body.date) : new Date();

    const safety = evaluateRedFlags(`${type} ${notes || ''}`, severity);
    if (safety.triggered) {
      await logSafetyEvent({ userId: user.id, source: 'body_map', evaluation: safety });
    }

    const inserted = await db
      .insert(symptomLogs)
      .values({
        userId: user.id,
        type,
        severity,
        category,
        notes,
        recordedAt: Number.isNaN(recordedAt.getTime()) ? new Date() : recordedAt,
      })
      .returning();

    return NextResponse.json({ success: true, log: inserted[0], safety }, { status: 201 });
  } catch (error) {
    console.error('Symptom POST error:', error);
    return NextResponse.json({ message: 'Failed to log symptom' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const id = Number(request.nextUrl.searchParams.get('id'));
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'Valid id required' }, { status: 400 });
  await db.delete(symptomLogs).where(and(eq(symptomLogs.id, id), eq(symptomLogs.userId, user.id)));
  return NextResponse.json({ success: true });
}
