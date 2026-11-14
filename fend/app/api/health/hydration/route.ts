import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { hydrationLogs } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const logs = await db.select().from(hydrationLogs).where(eq(hydrationLogs.userId, user.id)).orderBy(desc(hydrationLogs.recordedAt)).limit(60);
  return NextResponse.json({ success: true, logs });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    const body = await request.json();
    const rawIntake = Number(body.intake ?? body.amount ?? 1.5);
    const intake = Math.min(10, Math.max(0.1, Number.isFinite(rawIntake) ? Number(rawIntake.toFixed(2)) : 1.5));
    const target = Number.isFinite(Number(body.target)) ? Math.min(8, Math.max(0.5, Number(body.target))) : 2.5;
    const recordedAt = body.recordedAt || body.date ? new Date(body.recordedAt || body.date) : new Date();

    const inserted = await db
      .insert(hydrationLogs)
      .values({
        userId: user.id,
        intake,
        target,
        recordedAt: Number.isNaN(recordedAt.getTime()) ? new Date() : recordedAt,
      })
      .returning();

    return NextResponse.json({ success: true, log: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error('Hydration POST error:', error);
    return NextResponse.json({ message: 'Failed to log hydration' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  const id = Number(request.nextUrl.searchParams.get('id'));
  if (!Number.isInteger(id)) return NextResponse.json({ message: 'Valid id required' }, { status: 400 });
  await db.delete(hydrationLogs).where(and(eq(hydrationLogs.id, id), eq(hydrationLogs.userId, user.id)));
  return NextResponse.json({ success: true });
}
