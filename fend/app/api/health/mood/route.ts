import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { moodLogs } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const logs = await db.select().from(moodLogs).where(eq(moodLogs.userId, user.id)).orderBy(desc(moodLogs.recordedAt)).limit(60);
  return NextResponse.json({ success: true, logs });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    const body = await request.json();
    const rawScore = Number(body.score ?? body.mood ?? 7);
    const score = Math.min(10, Math.max(1, Number.isFinite(rawScore) ? Math.round(rawScore) : 7));
    const energyLevel = body.energyLevel !== undefined ? Math.min(10, Math.max(1, Math.round(Number(body.energyLevel)))) : null;
    const recordedAt = body.recordedAt || body.date ? new Date(body.recordedAt || body.date) : new Date();

    const inserted = await db
      .insert(moodLogs)
      .values({
        userId: user.id,
        score,
        energyLevel,
        moodTag: typeof body.moodTag === 'string' ? body.moodTag.slice(0, 60) : null,
        notes: typeof body.notes === 'string' ? body.notes.slice(0, 600) : null,
        recordedAt: Number.isNaN(recordedAt.getTime()) ? new Date() : recordedAt,
      })
      .returning();

    return NextResponse.json({ success: true, log: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error('Mood POST error:', error);
    return NextResponse.json({ message: 'Failed to log mood' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const id = Number(request.nextUrl.searchParams.get('id'));
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'Valid id required' }, { status: 400 });
  await db.delete(moodLogs).where(and(eq(moodLogs.id, id), eq(moodLogs.userId, user.id)));
  return NextResponse.json({ success: true });
}
