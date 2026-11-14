import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { sleepLogs } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const logs = await db.select().from(sleepLogs).where(eq(sleepLogs.userId, user.id)).orderBy(desc(sleepLogs.recordedAt)).limit(60);
  return NextResponse.json({ success: true, logs });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    const body = await request.json();
    const rawHours = Number(body.hours ?? body.duration ?? 7.5);
    const hours = Math.min(24, Math.max(0.5, Number.isFinite(rawHours) ? Number(rawHours.toFixed(1)) : 7.5));
    const recordedAt = body.recordedAt || body.date ? new Date(body.recordedAt || body.date) : new Date();

    const inserted = await db
      .insert(sleepLogs)
      .values({
        userId: user.id,
        hours,
        quality: typeof body.quality === 'string' ? body.quality.slice(0, 40) : 'good',
        notes: typeof body.notes === 'string' ? body.notes.slice(0, 400) : null,
        recordedAt: Number.isNaN(recordedAt.getTime()) ? new Date() : recordedAt,
      })
      .returning();

    return NextResponse.json({ success: true, log: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error('Sleep POST error:', error);
    return NextResponse.json({ message: 'Failed to log sleep' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const id = Number(request.nextUrl.searchParams.get('id'));
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'Valid id required' }, { status: 400 });
  await db.delete(sleepLogs).where(and(eq(sleepLogs.id, id), eq(sleepLogs.userId, user.id)));
  return NextResponse.json({ success: true });
}
