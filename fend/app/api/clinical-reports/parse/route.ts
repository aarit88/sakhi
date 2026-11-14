import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db/index.ts';
import { medicalReports } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';
import { parseClinicalReport } from '@/lib/clinical/reportParser';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const body = await request.json();
    const rawText = typeof body.text === 'string' ? body.text.trim() : '';
    if (!rawText) {
      return NextResponse.json({ message: 'Report text is required' }, { status: 400 });
    }

    const parsed = parseClinicalReport(rawText, {
      age: typeof body.age === 'number' ? body.age : user.age ?? undefined,
      pregnant: Boolean(body.pregnant),
    });

    let savedReport = null;
    if (body.save !== false) {
      const title =
        typeof body.title === 'string' && body.title.trim()
          ? body.title.trim().slice(0, 140)
          : `Lab Report (${new Date().toLocaleDateString()})`;
      const reportDate = body.reportDate ? new Date(body.reportDate) : new Date();
      const inserted = await db
        .insert(medicalReports)
        .values({
          userId: user.id,
          title,
          originalName: 'pasted-report.txt',
          mimeType: 'text/plain',
          sizeBytes: Buffer.byteLength(rawText, 'utf8'),
          parsedText: rawText.slice(0, 20_000),
          extractedDataJson: JSON.stringify(parsed),
          uncertaintyFlagsJson: JSON.stringify(parsed.uncertaintyFlags),
          verifiedByUser: parsed.uncertaintyFlags.length === 0 && parsed.markers.length > 0,
          status: parsed.markers.length > 0 ? 'parsed' : 'needs_review',
          reportDate: Number.isNaN(reportDate.getTime()) ? new Date() : reportDate,
        })
        .returning();
      savedReport = inserted[0];
    }

    return NextResponse.json({
      success: true,
      parsed,
      report: savedReport
        ? {
            ...savedReport,
            extractedData: parsed,
            uncertaintyFlags: parsed.uncertaintyFlags,
          }
        : null,
    });
  } catch (error) {
    console.error('Report parse error:', error);
    return NextResponse.json({ message: 'Failed to parse report text' }, { status: 500 });
  }
}
