import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@db/index.ts';
import { communityComments, communityPosts, moderationReports } from '@db/schema.ts';
import { checkRateLimit } from '@/lib/session';

const ADJECTIVES = ['Quiet', 'Calm', 'Bright', 'Gentle', 'Dawn', 'Amber', 'Silver', 'Warm'];
const NOUNS = ['Lotus', 'River', 'Breeze', 'Willow', 'Cedar', 'Starling', 'Fern', 'Moon'];

function generatePseudonym() {
  const adj = ADJECTIVES[crypto.randomInt(0, ADJECTIVES.length)];
  const noun = NOUNS[crypto.randomInt(0, NOUNS.length)];
  const num = crypto.randomInt(100, 999);
  return `${adj}${noun}-${num}`;
}

export async function GET(request: NextRequest) {
  try {
    const topic = request.nextUrl.searchParams.get('topic');
    const posts = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.status, 'active'))
      .orderBy(desc(communityPosts.createdAt))
      .limit(50);

    const filtered = topic && topic !== 'All' ? posts.filter((p) => p.topic === topic) : posts;
    const allComments = await db
      .select()
      .from(communityComments)
      .where(eq(communityComments.status, 'active'))
      .orderBy(communityComments.createdAt);

    const commentsByPost = new Map<number, typeof allComments>();
    for (const c of allComments) {
      const list = commentsByPost.get(c.postId) || [];
      list.push(c);
      commentsByPost.set(c.postId, list);
    }

    return NextResponse.json({
      success: true,
      posts: filtered.map((p) => ({
        id: p.id,
        authorPseudonym: p.authorPseudonym,
        topic: p.topic,
        title: p.title,
        body: p.body,
        helpfulCount: p.helpfulCount,
        createdAt: p.createdAt,
        comments: commentsByPost.get(p.id) || [],
      })),
    });
  } catch (error) {
    console.error('Community GET error:', error);
    return NextResponse.json({ message: 'Failed to load community posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'community';
    const rl = checkRateLimit(`community:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ message: 'Please wait before posting again.' }, { status: 429 });
    }

    const body = await request.json();
    const action = body.action || 'post';

    if (action === 'comment') {
      const postId = Number(body.postId);
      const commentBody = typeof body.body === 'string' ? body.body.trim() : '';
      if (!Number.isInteger(postId) || commentBody.length < 3 || commentBody.length > 1000) {
        return NextResponse.json({ message: 'Valid postId and comment (3–1000 chars) required.' }, { status: 400 });
      }
      const inserted = await db
        .insert(communityComments)
        .values({
          postId,
          authorPseudonym: generatePseudonym(),
          body: commentBody,
          status: 'active',
        })
        .returning();
      return NextResponse.json({ success: true, comment: inserted[0] }, { status: 201 });
    }

    if (action === 'helpful') {
      const postId = Number(body.postId);
      if (!Number.isInteger(postId)) return NextResponse.json({ message: 'Valid postId required' }, { status: 400 });
      const existing = await db.select().from(communityPosts).where(eq(communityPosts.id, postId)).limit(1);
      if (!existing[0]) return NextResponse.json({ message: 'Post not found' }, { status: 404 });
      const updated = await db
        .update(communityPosts)
        .set({ helpfulCount: existing[0].helpfulCount + 1 })
        .where(eq(communityPosts.id, postId))
        .returning();
      return NextResponse.json({ success: true, helpfulCount: updated[0].helpfulCount });
    }

    if (action === 'report') {
      const targetType = body.targetType === 'comment' ? 'comment' : 'post';
      const targetId = Number(body.targetId);
      const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 120) : 'Abuse / Unsafe advice';
      if (!Number.isInteger(targetId)) return NextResponse.json({ message: 'Valid targetId required' }, { status: 400 });
      await db.insert(moderationReports).values({
        targetType,
        targetId,
        reason,
        details: typeof body.details === 'string' ? body.details.slice(0, 400) : null,
      });
      return NextResponse.json({ success: true, message: 'Thank you. This item has been flagged for moderation review.' });
    }

    // Create anonymous topic post
    const topic = typeof body.topic === 'string' && body.topic.trim() ? body.topic.trim().slice(0, 60) : 'Menstrual Health';
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const postBody = typeof body.body === 'string' ? body.body.trim() : '';
    if (title.length < 5 || title.length > 160 || postBody.length < 10 || postBody.length > 2000) {
      return NextResponse.json(
        { message: 'Title (5–160 chars) and post body (10–2000 chars) are required.' },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash('sha256').update(`${ip}:${Date.now()}`).digest('hex').slice(0, 24);
    const inserted = await db
      .insert(communityPosts)
      .values({
        authorPseudonym: generatePseudonym(),
        authorTokenHash: tokenHash,
        topic,
        title,
        body: postBody,
        status: 'active',
      })
      .returning();

    return NextResponse.json({ success: true, post: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error('Community POST error:', error);
    return NextResponse.json({ message: 'Community action failed' }, { status: 500 });
  }
}
