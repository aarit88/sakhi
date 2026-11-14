import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { medicalReports } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';
import { parseClinicalReport } from '@/lib/clinical/reportParser';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

  const { id } = await context.params;
  const reportId = Number(id);
  if (!Number.isInteger(reportId)) return NextResponse.json({ message: 'Invalid report id' }, { status: 400 });

  const rows = await db
    .select()
    .from(medicalReports)
    .where(and(eq(medicalReports.id, reportId), eq(medicalReports.userId, user.id)))
    .limit(1);

  if (!rows[0]) return NextResponse.json({ message: 'Report not found' }, { status: 404 });
  const r = rows[0];
  return NextResponse.json({
    success: true,
    report: {
      ...r,
      extractedData: r.extractedDataJson ? JSON.parse(r.extractedDataJson) : null,
      uncertaintyFlags: r.uncertaintyFlagsJson ? JSON.parse(r.uncertaintyFlagsJson) : [],
    },
  });
}

// PATCH /api/clinical-reports/[id] -> verify or correct extracted text/values
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const { id } = await context.params;
    const reportId = Number(id);
    if (!Number.isInteger(reportId)) return NextResponse.json({ message: 'Invalid report id' }, { status: 400 });

    const body = await request.json();
    const existingRows = await db
      .select()
      .from(medicalReports)
      .where(and(eq(medicalReports.id, reportId), eq(medicalReports.userId, user.id)))
      .limit(1);

    if (!existingRows[0]) return NextResponse.json({ message: 'Report not found' }, { status: 404 });
    const existing = existingRows[0];

    let updatedExtracted = existing.extractedDataJson ? JSON.parse(existing.extractedDataJson) : null;
    let parsedText = existing.parsedText || '';

    if (typeof body.correctedText === 'string' && body.correctedText.trim()) {
      parsedText = body.correctedText.trim().slice(0, 20_000);
      updatedExtracted = parseClinicalReport(parsedText, { age: user.age ?? undefined });
    }

    const updated = await db
      .update(medicalReports)
      .set({
        title: typeof body.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 140) : existing.title,
        parsedText,
        extractedDataJson: updatedExtracted ? JSON.stringify(updatedExtracted) : existing.extractedDataJson,
        verifiedByUser: body.verifiedByUser !== undefined ? Boolean(body.verifiedByUser) : true,
        status: 'verified',
      })
      .where(and(eq(medicalReports.id, reportId), eq(medicalReports.userId, user.id)))
      .returning();

    const row = updated[0];
    return NextResponse.json({
      success: true,
      report: {
        ...row,
        extractedData: row.extractedDataJson ? JSON.parse(row.extractedDataJson) : null,
        uncertaintyFlags: row.uncertaintyFlagsJson ? JSON.parse(row.uncertaintyFlagsJson) : [],
      },
    });
  } catch (error) {
    console.error('Report PATCH error:', error);
    return NextResponse.json({ message: 'Failed to update report' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

  const { id } = await context.params;
  const reportId = Number(id);
  if (!Number.isInteger(reportId)) return NextResponse.json({ message: 'Invalid report id' }, { status: 400 });

  const deleted = await db
    .delete(medicalReports)
    .where(and(eq(medicalReports.id, reportId), eq(medicalReports.userId, user.id)))
    .returning();

  if (!deleted[0]) return NextResponse.json({ message: 'Report not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
