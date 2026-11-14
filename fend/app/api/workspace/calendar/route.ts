import { NextRequest, NextResponse } from 'next/server';

const CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

function getBearerHeader(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) return null;
  return auth;
}

export async function GET(req: NextRequest) {
  const auth = getBearerHeader(req);
  if (!auth) {
    return NextResponse.json({ message: 'Google Workspace authorization token required' }, { status: 401 });
  }

  try {
    const timeMin = req.nextUrl.searchParams.get('timeMin') || new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const url = new URL(CALENDAR_BASE);
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('timeMin', timeMin);
    url.searchParams.set('maxResults', '20');

    const res = await fetch(url.toString(), {
      headers: { Authorization: auth },
    });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.error?.message || 'Failed to fetch Google Calendar events' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      events: Array.isArray(data.items) ? data.items : [],
    });
  } catch (error) {
    console.error('Calendar GET proxy error:', error);
    return NextResponse.json({ message: 'Failed to communicate with Google Calendar API' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getBearerHeader(req);
  if (!auth) {
    return NextResponse.json({ message: 'Google Workspace authorization token required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const location = typeof body.location === 'string' ? body.location.trim() : '';
    const startIso = typeof body.startIso === 'string' ? body.startIso : '';
    const endIso = typeof body.endIso === 'string' ? body.endIso : '';

    if (!summary || !startIso || !endIso) {
      return NextResponse.json({ message: 'Event title, start time, and end time are required.' }, { status: 400 });
    }

    const res = await fetch(CALENDAR_BASE, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        description: description || undefined,
        location: location || undefined,
        start: { dateTime: new Date(startIso).toISOString() },
        end: { dateTime: new Date(endIso).toISOString() },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.error?.message || 'Failed to create Calendar event' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, event: data }, { status: 201 });
  } catch (error) {
    console.error('Calendar POST proxy error:', error);
    return NextResponse.json({ message: 'Failed to create Google Calendar event' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = getBearerHeader(req);
  if (!auth) {
    return NextResponse.json({ message: 'Google Workspace authorization token required' }, { status: 401 });
  }

  try {
    const eventId = req.nextUrl.searchParams.get('eventId');
    if (!eventId) {
      return NextResponse.json({ message: 'eventId is required' }, { status: 400 });
    }

    const res = await fetch(`${CALENDAR_BASE}/${encodeURIComponent(eventId)}`, {
      method: 'DELETE',
      headers: { Authorization: auth },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { message: data?.error?.message || 'Failed to delete Calendar event' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Calendar DELETE proxy error:', error);
    return NextResponse.json({ message: 'Failed to delete Calendar event' }, { status: 500 });
  }
}
