import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { aiConversations, aiMessages } from '@db/schema.ts';
import { checkRateLimit, getAuthenticatedUser } from '@/lib/session';
import { evaluateRedFlags, logSafetyEvent } from '@/lib/clinical/safety';
import { buildAuthorizedUserContext } from '@/lib/clinical/contextBuilder';
import { generateGroundedSakhiResponse } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

  const convs = await db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.userId, user.id))
    .orderBy(desc(aiConversations.updatedAt))
    .limit(1);

  if (!convs[0]) return NextResponse.json({ success: true, messages: [] });

  const messages = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, convs[0].id))
    .orderBy(aiMessages.createdAt);

  return NextResponse.json({
    success: true,
    conversationId: convs[0].id,
    messages: messages.map((m) => ({
      ...m,
      citations: m.citationsJson ? JSON.parse(m.citationsJson) : [],
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Please sign in to chat with your personal SAKHI companion.' }, { status: 401 });
    }

    const rl = checkRateLimit(`ai:${user.id}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ message: 'Rate limit reached. Please wait a minute before sending another message.' }, { status: 429 });
    }

    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message || message.length > 2000) {
      return NextResponse.json({ message: 'Message must be between 1 and 2000 characters.' }, { status: 400 });
    }

    // 1. Ensure conversation row exists
    const existingConv = await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, user.id))
      .orderBy(desc(aiConversations.updatedAt))
      .limit(1);

    let conv = existingConv[0];
    if (!conv) {
      const inserted = await db
        .insert(aiConversations)
        .values({ userId: user.id, title: 'SAKHI Wellness Companion' })
        .returning();
      conv = inserted[0];
    }

    // 2. Persist user message
    await db.insert(aiMessages).values({
      conversationId: conv.id,
      role: 'user',
      content: message,
      safetyFlagged: false,
    });

    // 3. Deterministic Safety & Red-Flag Interceptor BEFORE AI model invocation
    const safety = evaluateRedFlags(message);
    if (safety.triggered) {
      await logSafetyEvent({ userId: user.id, source: 'ai_chat', evaluation: safety });

      const urgentReply = `**Important Safety Notice (${safety.severity.toUpperCase()})**\n\n${safety.urgentGuidance}\n\n**Emergency Contacts:**\n${safety.helplines
        .map((h) => `- ${h.label}: ${h.contact}`)
        .join('\n')}`;

      await db.insert(aiMessages).values({
        conversationId: conv.id,
        role: 'assistant',
        content: urgentReply,
        safetyFlagged: true,
        citationsJson: JSON.stringify(['Deterministic Clinical Red-Flag Safety Protocol']),
      });

      return NextResponse.json({
        success: true,
        safetyTriggered: true,
        safety,
        reply: urgentReply,
        citations: ['Deterministic Clinical Red-Flag Safety Protocol'],
      });
    }

    // 4. Retrieve authorized PostgreSQL user context & chat history
    const [context, recentHistory] = await Promise.all([
      buildAuthorizedUserContext(user.id),
      db.select().from(aiMessages).where(eq(aiMessages.conversationId, conv.id)).orderBy(desc(aiMessages.createdAt)).limit(10),
    ]);

    const orderedHistory = recentHistory
      .reverse()
      .slice(0, -1)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const result = await generateGroundedSakhiResponse({
      userMessage: message,
      history: orderedHistory,
      systemContext: context.systemPrompt,
      isAnonymous: false,
    });

    await db.insert(aiMessages).values({
      conversationId: conv.id,
      role: 'assistant',
      content: result.reply,
      safetyFlagged: false,
      citationsJson: JSON.stringify(result.citations),
    });

    await db.update(aiConversations).set({ updatedAt: new Date() }).where(eq(aiConversations.id, conv.id));

    return NextResponse.json({
      success: true,
      safetyTriggered: false,
      reply: result.reply,
      citations: result.citations,
      modelUsed: result.modelUsed,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ message: 'Failed to generate companion response' }, { status: 500 });
  }
}
