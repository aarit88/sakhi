import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { anonChatMessages, anonChatSessions } from '@db/schema.ts';
import { checkRateLimit } from '@/lib/session';
import { evaluateRedFlags, logSafetyEvent } from '@/lib/clinical/safety';
import { generateGroundedSakhiResponse } from '@/lib/gemini';

// GET /api/anonymous-chat/message?sessionToken=... -> load messages for anonymous session
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.nextUrl.searchParams.get('sessionToken');
    if (!sessionToken) {
      return NextResponse.json({ success: true, sessionToken: null, messages: [] });
    }

    const sessions = await db
      .select()
      .from(anonChatSessions)
      .where(eq(anonChatSessions.sessionToken, sessionToken))
      .limit(1);

    if (!sessions[0]) {
      return NextResponse.json({ success: true, sessionToken: null, messages: [] });
    }

    const messages = await db
      .select()
      .from(anonChatMessages)
      .where(eq(anonChatMessages.sessionId, sessions[0].id))
      .orderBy(anonChatMessages.createdAt);

    return NextResponse.json({
      success: true,
      sessionToken,
      topic: sessions[0].topic,
      messages,
    });
  } catch (error) {
    console.error('Anon chat GET error:', error);
    return NextResponse.json({ message: 'Failed to load anonymous session' }, { status: 500 });
  }
}

// POST /api/anonymous-chat/message -> strictly anonymous (zero user PII/health history loaded)
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anon';
    const rl = checkRateLimit(`anon:${ip}`, 25, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ message: 'Too many requests. Please slow down.' }, { status: 429 });
    }

    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const topic = typeof body.topic === 'string' ? body.topic.slice(0, 60) : 'general';
    let sessionToken = typeof body.sessionToken === 'string' ? body.sessionToken.trim() : '';

    if (!message || message.length > 1600) {
      return NextResponse.json({ message: 'Message must be 1–1600 characters.' }, { status: 400 });
    }

    let session = sessionToken
      ? (await db.select().from(anonChatSessions).where(eq(anonChatSessions.sessionToken, sessionToken)).limit(1))[0]
      : undefined;

    if (!session) {
      sessionToken = crypto.randomUUID();
      const inserted = await db
        .insert(anonChatSessions)
        .values({ sessionToken, topic })
        .returning();
      session = inserted[0];
    }

    await db.insert(anonChatMessages).values({
      sessionId: session.id,
      sender: 'user',
      content: message,
      safetyFlagged: false,
    });

    const safety = evaluateRedFlags(message);
    if (safety.triggered) {
      await logSafetyEvent({ userId: null, source: 'anon_chat', evaluation: safety });

      const urgentReply = `Important Safety Guidance (${safety.severity.toUpperCase()}): ${safety.urgentGuidance}\n\nHelplines:\n${safety.helplines
        .map((h) => `• ${h.label}: ${h.contact}`)
        .join('\n')}`;

      await db.insert(anonChatMessages).values({
        sessionId: session.id,
        sender: 'assistant',
        content: urgentReply,
        safetyFlagged: true,
      });

      return NextResponse.json({
        success: true,
        sessionToken,
        safetyTriggered: true,
        safety,
        reply: urgentReply,
      });
    }

    const historyRows = await db
      .select()
      .from(anonChatMessages)
      .where(eq(anonChatMessages.sessionId, session.id))
      .orderBy(desc(anonChatMessages.createdAt))
      .limit(10);

    const history = historyRows
      .reverse()
      .slice(0, -1)
      .map((m) => ({
        role: m.sender === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      }));

    const result = await generateGroundedSakhiResponse({
      userMessage: message,
      history,
      systemContext: `You are SAKHI Anonymous Support. This conversation is strictly anonymous and MUST NEVER reference any personal account records or clinical files. Offer empathetic, stigma-free, evidence-aware educational guidance on women's health (${topic}), reminding users to consult a clinician for medical diagnosis or prescriptions.`,
      isAnonymous: true,
    });

    await db.insert(anonChatMessages).values({
      sessionId: session.id,
      sender: 'assistant',
      content: result.reply,
      safetyFlagged: false,
    });

    await db.update(anonChatSessions).set({ updatedAt: new Date() }).where(eq(anonChatSessions.id, session.id));

    return NextResponse.json({
      success: true,
      sessionToken,
      safetyTriggered: false,
      reply: result.reply,
    });
  } catch (error) {
    console.error('Anon chat POST error:', error);
    return NextResponse.json({ message: 'Failed to send anonymous message' }, { status: 500 });
  }
}
