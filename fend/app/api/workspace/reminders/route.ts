import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import {
  emailReminderLogs,
  emailReminderSettings,
  periodLogs,
} from '@db/schema.ts';
import { getAuthenticatedUser } from '@/lib/session';
import { computeCycleInfo } from '@/lib/clinical/cycleUtils';

const CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const GMAIL_PROFILE = 'https://gmail.googleapis.com/gmail/v1/users/me/profile';
const GMAIL_SEND = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

const DEFAULT_KEYWORDS =
  'doctor,gynecologist,ob-gyn,obgyn,clinic,hospital,checkup,ultrasound,blood test,lab,sakhi,consultation,appointment';

function getBearerHeader(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) return null;
  return auth;
}

function encodeBase64Url(str: string): string {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function encodeMimeSubject(subject: string): string {
  // Use RFC 2047 UTF-8 Base64 encoding when non-ASCII characters are present
  if (/^[\x20-\x7E]*$/.test(subject)) return subject;
  return `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
}

async function getOrCreateSettings(userId: number, fallbackEmail: string | null) {
  const rows = await db
    .select()
    .from(emailReminderSettings)
    .where(eq(emailReminderSettings.userId, userId))
    .limit(1);

  if (rows[0]) return rows[0];

  const inserted = await db
    .insert(emailReminderSettings)
    .values({
      userId,
      enabled: true,
      recipientEmail: fallbackEmail,
      cycleReminderEnabled: true,
      cycleLeadDays: 3,
      doctorReminderEnabled: true,
      doctorLeadHours: 48,
      calendarKeywords: DEFAULT_KEYWORDS,
    })
    .returning();
  return inserted[0];
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const bearer = getBearerHeader(req);

    let gmailEmail: string | null = null;
    let calendarEvents: any[] = [];
    let calendarError: string | null = null;

    if (bearer) {
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      const calUrl = new URL(CALENDAR_BASE);
      calUrl.searchParams.set('singleEvents', 'true');
      calUrl.searchParams.set('orderBy', 'startTime');
      calUrl.searchParams.set('timeMin', timeMin);
      calUrl.searchParams.set('timeMax', timeMax);
      calUrl.searchParams.set('maxResults', '40');

      const [profileRes, calRes] = await Promise.all([
        fetch(GMAIL_PROFILE, { headers: { Authorization: bearer } }).catch(() => null),
        fetch(calUrl.toString(), { headers: { Authorization: bearer } }).catch(() => null),
      ]);

      if (profileRes?.ok) {
        const pData = await profileRes.json().catch(() => null);
        gmailEmail = pData?.emailAddress || null;
      }

      if (calRes?.ok) {
        const cData = await calRes.json().catch(() => null);
        calendarEvents = Array.isArray(cData?.items) ? cData.items : [];
      } else if (calRes) {
        const errData = await calRes.json().catch(() => null);
        calendarError = errData?.error?.message || `Calendar status ${calRes.status}`;
      }
    }

    const settings = user
      ? await getOrCreateSettings(user.id, user.email || gmailEmail)
      : {
          id: 0,
          userId: 0,
          enabled: true,
          recipientEmail: gmailEmail || '',
          cycleReminderEnabled: true,
          cycleLeadDays: 3,
          doctorReminderEnabled: true,
          doctorLeadHours: 48,
          calendarKeywords: DEFAULT_KEYWORDS,
          lastCheckedAt: null,
          updatedAt: new Date(),
        };

    const effectiveRecipient = settings.recipientEmail || user?.email || gmailEmail || '';

    const periods = user
      ? await db
          .select()
          .from(periodLogs)
          .where(eq(periodLogs.userId, user.id))
          .orderBy(desc(periodLogs.startDate))
          .limit(12)
      : [];

    const cycleInfo = user
      ? computeCycleInfo(
          periods.map((p) => new Date(p.startDate)),
          user.cycleLengthAvg || 28
        )
      : null;

    const history = user
      ? await db
          .select()
          .from(emailReminderLogs)
          .where(eq(emailReminderLogs.userId, user.id))
          .orderBy(desc(emailReminderLogs.sentAt))
          .limit(25)
      : [];

    const sentKeys = new Set(history.map((h) => h.reminderKey));

    // Match scheduled doctor visits from Google Calendar
    const keywordList = (settings.calendarKeywords || DEFAULT_KEYWORDS)
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const nowMs = Date.now();
    const leadHoursMs = Math.max(1, settings.doctorLeadHours) * 3600 * 1000;

    const detectedDoctorVisits = calendarEvents
      .map((ev) => {
        const startRaw = ev.start?.dateTime || ev.start?.date || '';
        if (!startRaw) return null;
        const startMs = new Date(startRaw).getTime();
        if (Number.isNaN(startMs)) return null;

        const haystack = `${ev.summary || ''} ${ev.description || ''} ${ev.location || ''}`.toLowerCase();
        const matchedKeywords = keywordList.filter((kw) => haystack.includes(kw));
        if (matchedKeywords.length === 0) return null;

        const hoursUntil = Math.round((startMs - nowMs) / (3600 * 1000));
        const withinLeadWindow = hoursUntil >= 0 && startMs - nowMs <= leadHoursMs;
        const reminderKey = `doctor:${ev.id}:${startRaw}`;
        const alreadySent = sentKeys.has(reminderKey);

        return {
          eventId: ev.id,
          summary: ev.summary || 'Scheduled Medical Appointment',
          location: ev.location || null,
          description: ev.description || null,
          startRaw,
          hoursUntil,
          matchedKeywords,
          withinLeadWindow,
          alreadySent,
          reminderKey,
          htmlLink: ev.htmlLink || null,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    // Build ready-to-confirm reminder drafts
    const dueReminders: Array<{
      reminderKey: string;
      type: 'cycle' | 'doctor_visit';
      recipientEmail: string;
      subject: string;
      body: string;
      targetDate: string;
      sourceLabel: string;
      alreadySent: boolean;
      withinWindow: boolean;
    }> = [];

    // 1) Cycle date reminder check
    let daysUntilNextPeriod: number | null = null;
    if (cycleInfo && /^\d{4}-\d{2}-\d{2}$/.test(cycleInfo.nextPeriod)) {
      const targetMs = new Date(`${cycleInfo.nextPeriod}T09:00:00`).getTime();
      daysUntilNextPeriod = Math.ceil((targetMs - nowMs) / (24 * 3600 * 1000));
      const cycleKey = `cycle:${cycleInfo.nextPeriod}`;
      const withinCycleWindow =
        daysUntilNextPeriod >= -1 && daysUntilNextPeriod <= settings.cycleLeadDays;

      if (settings.enabled && settings.cycleReminderEnabled) {
        dueReminders.push({
          reminderKey: cycleKey,
          type: 'cycle',
          recipientEmail: effectiveRecipient,
          subject: `SAKHI Cycle Reminder: Predicted Period Around ${cycleInfo.nextPeriod}`,
          body: [
            `Hi ${user?.name || 'there'},`,
            '',
            `This is your SAKHI cycle preparation reminder. Based on your logged periods (estimated ${cycleInfo.cycleLength}-day average), your next period is estimated around ${cycleInfo.nextPeriod} (${daysUntilNextPeriod <= 0 ? 'expected shortly' : `in ~${daysUntilNextPeriod} day(s)`}).`,
            '',
            `Current Cycle Context: Day ${cycleInfo.day} (${cycleInfo.phase})`,
            `Note: ${cycleInfo.predictionNote}`,
            '',
            'Helpful Checklist:',
            '- Keep pads, tampons, or menstrual cup stocked and ready',
            '- Stay hydrated and keep a warm compress or heat pack handy if cramps occur',
            '- Log your start date, flow intensity, and symptoms in SAKHI to refine future estimates',
            '',
            'Take care,',
            'SAKHI Women’s Health Companion',
          ].join('\n'),
          targetDate: cycleInfo.nextPeriod,
          sourceLabel:
            daysUntilNextPeriod <= 0
              ? 'Estimated Period Window (Imminent)'
              : `Estimated Period in ${daysUntilNextPeriod} day(s)`,
          alreadySent: sentKeys.has(cycleKey),
          withinWindow: withinCycleWindow,
        });
      }
    }

    // 2) Calendar Doctor Visit reminders
    if (settings.enabled && settings.doctorReminderEnabled) {
      for (const visit of detectedDoctorVisits) {
        const formattedTime = new Date(visit.startRaw).toLocaleString();
        dueReminders.push({
          reminderKey: visit.reminderKey,
          type: 'doctor_visit',
          recipientEmail: effectiveRecipient,
          subject: `SAKHI Appointment Reminder: ${visit.summary} (${formattedTime})`,
          body: [
            `Hi ${user?.name || 'there'},`,
            '',
            `You have an upcoming medical appointment scheduled on your Google Calendar:`,
            `- Appointment: ${visit.summary}`,
            `- Date & Time: ${formattedTime}`,
            visit.location ? `- Location: ${visit.location}` : null,
            visit.description ? `- Calendar Notes: ${visit.description}` : null,
            '',
            'Before Your Visit:',
            '- Generate a scoped Doctor Portal share link in SAKHI (/doctor-portal) so your clinician can review your cycle timeline, 3D body-map logs, and lab reports',
            '- Carry recent lab reports and a list of current medications or supplements',
            '',
            'Wishing you a smooth consultation,',
            'SAKHI Women’s Health Companion',
          ]
            .filter((line): line is string => line !== null)
            .join('\n'),
          targetDate: visit.startRaw,
          sourceLabel:
            visit.hoursUntil <= 24
              ? `Google Calendar (${Math.max(0, visit.hoursUntil)}h away)`
              : `Google Calendar (${Math.round(visit.hoursUntil / 24)}d away)`,
          alreadySent: visit.alreadySent,
          withinWindow: visit.withinLeadWindow,
        });
      }
    }

    if (user && settings.id) {
      await db
        .update(emailReminderSettings)
        .set({ lastCheckedAt: new Date() })
        .where(eq(emailReminderSettings.id, settings.id));
    }

    return NextResponse.json({
      success: true,
      authenticated: Boolean(user),
      workspaceConnected: Boolean(bearer),
      gmailEmail,
      calendarError,
      settings,
      cycleInfo: cycleInfo
        ? { ...cycleInfo, daysUntilNextPeriod }
        : null,
      detectedDoctorVisits,
      dueReminders,
      history,
    });
  } catch (error) {
    console.error('Workspace reminders GET error:', error);
    return NextResponse.json({ message: 'Failed to inspect automated reminders' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Please sign in to save reminder automation preferences.' }, { status: 401 });
    }

    const body = await req.json();
    const existing = await getOrCreateSettings(user.id, user.email || null);

    const enabled = typeof body.enabled === 'boolean' ? body.enabled : existing.enabled;
    const recipientEmail =
      typeof body.recipientEmail === 'string' && body.recipientEmail.trim()
        ? body.recipientEmail.trim().slice(0, 180)
        : existing.recipientEmail || user.email;
    const cycleReminderEnabled =
      typeof body.cycleReminderEnabled === 'boolean'
        ? body.cycleReminderEnabled
        : existing.cycleReminderEnabled;
    const cycleLeadDays = Math.min(14, Math.max(1, Number(body.cycleLeadDays) || existing.cycleLeadDays));
    const doctorReminderEnabled =
      typeof body.doctorReminderEnabled === 'boolean'
        ? body.doctorReminderEnabled
        : existing.doctorReminderEnabled;
    const doctorLeadHours = Math.min(
      336,
      Math.max(1, Number(body.doctorLeadHours) || existing.doctorLeadHours)
    );
    const calendarKeywords =
      typeof body.calendarKeywords === 'string' && body.calendarKeywords.trim()
        ? body.calendarKeywords.trim().slice(0, 500)
        : existing.calendarKeywords;

    const updated = await db
      .update(emailReminderSettings)
      .set({
        enabled,
        recipientEmail,
        cycleReminderEnabled,
        cycleLeadDays,
        doctorReminderEnabled,
        doctorLeadHours,
        calendarKeywords,
        updatedAt: new Date(),
      })
      .where(eq(emailReminderSettings.id, existing.id))
      .returning();

    return NextResponse.json({ success: true, settings: updated[0] });
  } catch (error) {
    console.error('Workspace reminders PUT error:', error);
    return NextResponse.json({ message: 'Failed to update reminder preferences' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const bearer = getBearerHeader(req);
  if (!bearer) {
    return NextResponse.json(
      { message: 'Connect Google Workspace first so Gmail can send reminders.' },
      { status: 401 }
    );
  }

  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const reminders = Array.isArray(body.reminders) ? body.reminders : [];

    if (reminders.length === 0) {
      return NextResponse.json({ message: 'At least one confirmed reminder is required.' }, { status: 400 });
    }

    const results: Array<{ reminderKey: string; ok: boolean; gmailMessageId?: string; error?: string }> = [];

    for (const item of reminders.slice(0, 10)) {
      const recipientEmail = typeof item.recipientEmail === 'string' ? item.recipientEmail.trim() : '';
      const subject = typeof item.subject === 'string' ? item.subject.trim() : '';
      const msgBody = typeof item.body === 'string' ? item.body.trim() : '';
      const reminderKey = typeof item.reminderKey === 'string' ? item.reminderKey : `manual:${Date.now()}`;
      const type = item.type === 'cycle' ? 'cycle' : 'doctor_visit';
      const targetDate = typeof item.targetDate === 'string' ? item.targetDate : new Date().toISOString();

      if (!recipientEmail || !subject || !msgBody) {
        results.push({ reminderKey, ok: false, error: 'Missing recipient, subject, or body' });
        continue;
      }

      const rawMime = [
        `To: ${recipientEmail}`,
        `Subject: ${encodeMimeSubject(subject)}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        msgBody,
      ].join('\r\n');

      const sendRes = await fetch(GMAIL_SEND, {
        method: 'POST',
        headers: {
          Authorization: bearer,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodeBase64Url(rawMime) }),
      });

      const sendData = await sendRes.json().catch(() => ({}));
      if (!sendRes.ok) {
        results.push({
          reminderKey,
          ok: false,
          error: sendData?.error?.message || `Gmail API status ${sendRes.status}`,
        });
        continue;
      }

      if (user) {
        await db.insert(emailReminderLogs).values({
          userId: user.id,
          reminderKey,
          reminderType: type,
          recipientEmail,
          subject,
          targetDate,
          gmailMessageId: sendData.id || null,
          status: 'sent',
        });
      }

      results.push({
        reminderKey,
        ok: true,
        gmailMessageId: sendData.id || undefined,
      });
    }

    const sentCount = results.filter((r) => r.ok).length;
    if (sentCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: results[0]?.error || 'Failed to send reminder email(s) via Gmail',
          results,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      sentCount,
      results,
    });
  } catch (error) {
    console.error('Workspace reminders POST error:', error);
    return NextResponse.json({ message: 'Failed to dispatch Gmail reminders' }, { status: 500 });
  }
}
