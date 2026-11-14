import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { medicalReports } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const rows = await db
      .select()
      .from(medicalReports)
      .where(eq(medicalReports.userId, user.id))
      .orderBy(desc(medicalReports.reportDate));

    const reports = rows.map((r) => ({
      id: r.id,
      title: r.title,
      originalName: r.originalName,
      mimeType: r.mimeType,
      sizeBytes: r.sizeBytes,
      status: r.status,
      verifiedByUser: r.verifiedByUser,
      reportDate: r.reportDate,
      createdAt: r.createdAt,
      parsedText: r.parsedText,
      extractedData: r.extractedDataJson ? JSON.parse(r.extractedDataJson) : null,
      uncertaintyFlags: r.uncertaintyFlagsJson ? JSON.parse(r.uncertaintyFlagsJson) : [],
    }));

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error('Clinical reports GET error:', error);
    return NextResponse.json({ message: 'Failed to load reports' }, { status: 500 });
  }
}
