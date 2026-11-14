import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { activityLogs } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const logs = await db.select().from(activityLogs).where(eq(activityLogs.userId, user.id)).orderBy(desc(activityLogs.recordedAt)).limit(60);
  return NextResponse.json({ success: true, logs });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    const body = await request.json();
    const steps = Math.max(0, Math.round(Number(body.steps ?? 0) || 0));
    const calories = Math.max(0, Math.round(Number(body.calories ?? 0) || 0));
    const activeMinutes = Math.max(0, Math.round(Number(body.activeMinutes ?? body.duration ?? 0) || 0));
    const recordedAt = body.recordedAt || body.date ? new Date(body.recordedAt || body.date) : new Date();

    const inserted = await db
      .insert(activityLogs)
      .values({
        userId: user.id,
        steps,
        calories,
        activeMinutes,
        activityType: typeof body.activityType === 'string' ? body.activityType.slice(0, 60) : 'Walking',
        notes: typeof body.notes === 'string' ? body.notes.slice(0, 400) : null,
        recordedAt: Number.isNaN(recordedAt.getTime()) ? new Date() : recordedAt,
      })
      .returning();

    return NextResponse.json({ success: true, log: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error('Activity POST error:', error);
    return NextResponse.json({ message: 'Failed to log activity' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const id = Number(request.nextUrl.searchParams.get('id'));
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'Valid id required' }, { status: 400 });
  await db.delete(activityLogs).where(and(eq(activityLogs.id, id), eq(activityLogs.userId, user.id)));
  return NextResponse.json({ success: true });
}
