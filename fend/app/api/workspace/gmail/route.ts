import { NextRequest, NextResponse } from 'next/server';

const GMAIL_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

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

export async function GET(req: NextRequest) {
  const auth = getBearerHeader(req);
  if (!auth) {
    return NextResponse.json({ message: 'Google Workspace authorization token required' }, { status: 401 });
  }

  try {
    const q = req.nextUrl.searchParams.get('q') || '';
    const maxResults = Math.min(20, Math.max(1, Number(req.nextUrl.searchParams.get('maxResults')) || 12));
    const listUrl = new URL(`${GMAIL_BASE}/messages`);
    listUrl.searchParams.set('maxResults', String(maxResults));
    if (q.trim()) listUrl.searchParams.set('q', q.trim());

    const listRes = await fetch(listUrl.toString(), {
      headers: { Authorization: auth },
    });
    const listData = await listRes.json();

    if (!listRes.ok) {
      return NextResponse.json(
        { message: listData?.error?.message || 'Failed to list Gmail messages' },
        { status: listRes.status }
      );
    }

    const messageRefs: Array<{ id: string; threadId: string }> = Array.isArray(listData.messages)
      ? listData.messages
      : [];

    const hydrated = await Promise.all(
      messageRefs.slice(0, 12).map(async (ref) => {
        const msgRes = await fetch(
          `${GMAIL_BASE}/messages/${encodeURIComponent(ref.id)}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: auth } }
        );
        if (!msgRes.ok) return null;
        const msg = await msgRes.json();
        const headers: Array<{ name: string; value: string }> = msg?.payload?.headers || [];
        const getHeader = (name: string) =>
          headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: msg.snippet || '',
          labelIds: Array.isArray(msg.labelIds) ? msg.labelIds : [],
          subject: getHeader('Subject') || '(No Subject)',
          from: getHeader('From') || 'Unknown sender',
          date: getHeader('Date') || '',
        };
      })
    );

    return NextResponse.json({
      success: true,
      messages: hydrated.filter(Boolean),
    });
  } catch (error) {
    console.error('Gmail GET proxy error:', error);
    return NextResponse.json({ message: 'Failed to communicate with Gmail API' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getBearerHeader(req);
  if (!auth) {
    return NextResponse.json({ message: 'Google Workspace authorization token required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const to = typeof body.to === 'string' ? body.to.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const messageBody = typeof body.body === 'string' ? body.body.trim() : '';

    if (!to || !subject || !messageBody) {
      return NextResponse.json({ message: 'Recipient (to), subject, and body are required.' }, { status: 400 });
    }

    const rawMime = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      messageBody,
    ].join('\r\n');

    const sendRes = await fetch(`${GMAIL_BASE}/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodeBase64Url(rawMime) }),
    });

    const data = await sendRes.json();
    if (!sendRes.ok) {
      return NextResponse.json(
        { message: data?.error?.message || 'Failed to send Gmail message' },
        { status: sendRes.status }
      );
    }

    return NextResponse.json({ success: true, sent: data }, { status: 201 });
  } catch (error) {
    console.error('Gmail POST proxy error:', error);
    return NextResponse.json({ message: 'Failed to send email via Gmail API' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = getBearerHeader(req);
  if (!auth) {
    return NextResponse.json({ message: 'Google Workspace authorization token required' }, { status: 401 });
  }

  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Message id is required' }, { status: 400 });
    }

    const trashRes = await fetch(`${GMAIL_BASE}/messages/${encodeURIComponent(id)}/trash`, {
      method: 'POST',
      headers: { Authorization: auth },
    });
    const data = await trashRes.json();

    if (!trashRes.ok) {
      return NextResponse.json(
        { message: data?.error?.message || 'Failed to move message to Trash' },
        { status: trashRes.status }
      );
    }

    return NextResponse.json({ success: true, trashed: data });
  } catch (error) {
    console.error('Gmail DELETE proxy error:', error);
    return NextResponse.json({ message: 'Failed to delete email' }, { status: 500 });
  }
}
