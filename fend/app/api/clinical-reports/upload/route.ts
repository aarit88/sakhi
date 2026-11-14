import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db/index.ts';
import { medicalReports } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';
import { extractMedicalReportTextWithGemini } from '@/lib/gemini';
import { isValidFileType, parseClinicalReport } from '@/lib/clinical/reportParser';
import { evaluateRedFlags, logSafetyEvent } from '@/lib/clinical/safety';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file');
    const titleInput = formData.get('title');
    const reportDateInput = formData.get('reportDate');
    const pregnant = formData.get('pregnant') === 'true';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: 'Report file is required' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: 'File exceeds 10 MB limit' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const detected = isValidFileType(buffer, file.type);

    if (!detected.valid || !detected.mime) {
      return NextResponse.json(
        { message: 'Unsupported or invalid file signature. Accepted formats: PDF, JPEG, PNG, WEBP, or TXT.' },
        { status: 400 }
      );
    }

    const ocr = await extractMedicalReportTextWithGemini(buffer, detected.mime, file.name);
    const parsed = parseClinicalReport(ocr.text, { age: user.age ?? undefined, pregnant }, ocr.uncertaintyNotes);

    const hasCritical = parsed.markers.some((m) => m.status === 'critical');
    if (hasCritical) {
      const evalRes = evaluateRedFlags(
        `critical lab marker: ${parsed.markers
          .filter((m) => m.status === 'critical')
          .map((m) => `${m.label} ${m.value} ${m.unit}`)
          .join(', ')}`
      );
      if (evalRes.triggered) {
        await logSafetyEvent({ userId: user.id, source: 'report', evaluation: evalRes });
      }
    }

    const title =
      typeof titleInput === 'string' && titleInput.trim()
        ? titleInput.trim().slice(0, 140)
        : file.name.replace(/\.[^.]+$/, '');
    const parsedDate =
      typeof reportDateInput === 'string' && reportDateInput ? new Date(reportDateInput) : new Date();

    const inserted = await db
      .insert(medicalReports)
      .values({
        userId: user.id,
        title,
        originalName: file.name,
        mimeType: detected.mime,
        sizeBytes: file.size,
        parsedText: ocr.text.slice(0, 20_000),
        extractedDataJson: JSON.stringify(parsed),
        uncertaintyFlagsJson: JSON.stringify(parsed.uncertaintyFlags),
        verifiedByUser: parsed.uncertaintyFlags.length === 0 && parsed.markers.length > 0,
        status: parsed.markers.length > 0 ? 'parsed' : 'needs_review',
        reportDate: Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
      })
      .returning();

    const row = inserted[0];
    return NextResponse.json(
      {
        success: true,
        usedOcr: ocr.usedOcr,
        report: {
          ...row,
          extractedData: parsed,
          uncertaintyFlags: parsed.uncertaintyFlags,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Report upload error:', error);
    return NextResponse.json({ message: 'Failed to process uploaded report' }, { status: 500 });
  }
}
