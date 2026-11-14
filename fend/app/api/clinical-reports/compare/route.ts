import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { medicalReports } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';
import { compareParsedReports } from '@/lib/clinical/reportParser';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const baseId = Number(request.nextUrl.searchParams.get('baseId'));
    const compareId = Number(request.nextUrl.searchParams.get('compareId'));
    if (!Number.isInteger(baseId) || !Number.isInteger(compareId)) {
      return NextResponse.json({ message: 'baseId and compareId are required' }, { status: 400 });
    }

    const [baseRows, compareRows] = await Promise.all([
      db.select().from(medicalReports).where(and(eq(medicalReports.id, baseId), eq(medicalReports.userId, user.id))).limit(1),
      db.select().from(medicalReports).where(and(eq(medicalReports.id, compareId), eq(medicalReports.userId, user.id))).limit(1),
    ]);

    if (!baseRows[0] || !compareRows[0]) {
      return NextResponse.json({ message: 'One or both reports not found' }, { status: 404 });
    }

    const older = baseRows[0].extractedDataJson ? JSON.parse(baseRows[0].extractedDataJson).markers || [] : [];
    const newer = compareRows[0].extractedDataJson ? JSON.parse(compareRows[0].extractedDataJson).markers || [] : [];
    const diffs = compareParsedReports(older, newer);

    return NextResponse.json({
      success: true,
      baseReport: { id: baseRows[0].id, title: baseRows[0].title, reportDate: baseRows[0].reportDate },
      compareReport: { id: compareRows[0].id, title: compareRows[0].title, reportDate: compareRows[0].reportDate },
      diffs,
    });
  } catch (error) {
    console.error('Report compare error:', error);
    return NextResponse.json({ message: 'Failed to compare reports' }, { status: 500 });
  }
}
