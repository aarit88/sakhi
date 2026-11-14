import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { accessAuditLogs, clinicianNotes, doctorProfiles, doctorShareTokens } from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';

// GET /api/doctor/shares -> list patient's share links, audit logs, clinician notes, and available partner doctors
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const doctors = await db.select().from(doctorProfiles);

    if (!user) {
      return NextResponse.json({ success: true, authenticated: false, doctors, shares: [], auditLogs: [], clinicianNotes: [] });
    }

    const [shares, logs, notes] = await Promise.all([
      db
        .select()
        .from(doctorShareTokens)
        .where(eq(doctorShareTokens.patientUserId, user.id))
        .orderBy(desc(doctorShareTokens.createdAt)),
      db
        .select()
        .from(accessAuditLogs)
        .where(eq(accessAuditLogs.patientUserId, user.id))
        .orderBy(desc(accessAuditLogs.createdAt))
        .limit(50),
      db
        .select()
        .from(clinicianNotes)
        .where(eq(clinicianNotes.patientUserId, user.id))
        .orderBy(desc(clinicianNotes.createdAt)),
    ]);

    return NextResponse.json({
      success: true,
      authenticated: true,
      doctors,
      shares: shares.map((s) => ({
        ...s,
        scopes: JSON.parse(s.scopesJson),
      })),
      auditLogs: logs.map((a) => ({
        ...a,
        accessedSections: JSON.parse(a.accessedSectionsJson),
      })),
      clinicianNotes: notes,
    });
  } catch (error) {
    console.error('Doctor shares GET error:', error);
    return NextResponse.json({ message: 'Failed to load sharing settings' }, { status: 500 });
  }
}

// POST /api/doctor/shares -> create a scoped, time-limited, revocable patient consent share token
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const body = await request.json();
    const label = typeof body.label === 'string' && body.label.trim() ? body.label.trim().slice(0, 120) : 'Consultation Share';
    const doctorName = typeof body.doctorName === 'string' ? body.doctorName.trim().slice(0, 120) : null;
    const expiresInHours = Math.min(720, Math.max(1, Number(body.expiresInHours) || 72));
    const scopes = {
      cycle: body.scopes?.cycle !== false,
      symptoms: body.scopes?.symptoms !== false,
      bodyMap: body.scopes?.bodyMap !== false,
      reports: body.scopes?.reports !== false,
      aiSummary: body.scopes?.aiSummary !== false,
    };

    const token = `sakhi_dr_${crypto.randomBytes(18).toString('hex')}`;
    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);

    const inserted = await db
      .insert(doctorShareTokens)
      .values({
        patientUserId: user.id,
        token,
        label,
        doctorName,
        scopesJson: JSON.stringify(scopes),
        expiresAt,
      })
      .returning();

    const row = inserted[0];
    return NextResponse.json(
      {
        success: true,
        share: {
          ...row,
          scopes,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Doctor share POST error:', error);
    return NextResponse.json({ message: 'Failed to create doctor share link' }, { status: 500 });
  }
}

// DELETE /api/doctor/shares?id=... -> revoke a share link immediately
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const id = Number(request.nextUrl.searchParams.get('id'));
    if (!Number.isInteger(id)) return NextResponse.json({ message: 'Valid id required' }, { status: 400 });

    const updated = await db
      .update(doctorShareTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(doctorShareTokens.id, id), eq(doctorShareTokens.patientUserId, user.id)))
      .returning();

    if (!updated[0]) return NextResponse.json({ message: 'Share token not found' }, { status: 404 });
    return NextResponse.json({ success: true, share: updated[0] });
  } catch (error) {
    console.error('Doctor share DELETE error:', error);
    return NextResponse.json({ message: 'Failed to revoke share link' }, { status: 500 });
  }
}
