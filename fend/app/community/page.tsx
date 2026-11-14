'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Flag,
  Heart,
  MessageCircle,
  MessageSquarePlus,
  Send,
  ShieldCheck,
  ThumbsUp,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CommentItem {
  id: number;
  postId: number;
  authorPseudonym: string;
  body: string;
  createdAt: string;
}

interface CommunityPost {
  id: number;
  authorPseudonym: string;
  topic: string;
  title: string;
  body: string;
  helpfulCount: number;
  createdAt: string;
  comments: CommentItem[];
}

const TOPICS = [
  'All',
  'Menstrual Health',
  'PCOS & Hormones',
  'Mental Wellness',
  'Pregnancy',
  'Nutrition',
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState('All');

  // Create Post form state
  const [showComposer, setShowComposer] = useState(false);
  const [newTopic, setNewTopic] = useState('Menstrual Health');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Per-post comment & report inline UI
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [reportingPostId, setReportingPostId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('Misinformation / Unsafe medical advice');

  const fetchPosts = async (topicFilter: string) => {
    setLoading(true);
    try {
      const qs = topicFilter !== 'All' ? `?topic=${encodeURIComponent(topicFilter)}` : '';
      const res = await fetch(`/api/community/posts${qs}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch {
      toast.error('Failed to load community discussions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeTopic);
  }, [activeTopic]);

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (newTitle.trim().length < 5 || newBody.trim().length < 10) {
      toast.error('Please enter a title (5+ chars) and message (10+ chars).');
      return;
    }

    setSubmittingPost(true);
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'post',
          topic: newTopic,
          title: newTitle.trim(),
          body: newBody.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not publish post');

      toast.success(`Published anonymously as ${data.post.authorPseudonym}`);
      setNewTitle('');
      setNewBody('');
      setShowComposer(false);
      fetchPosts(activeTopic);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleHelpful = async (postId: number) => {
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'helpful', postId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, helpfulCount: data.helpfulCount } : p))
      );
    } catch {
      toast.error('Could not record vote right now');
    }
  };

  const handleAddComment = async (postId: number) => {
    const text = (commentDrafts[postId] || '').trim();
    if (text.length < 3) {
      toast.error('Reply must be at least 3 characters.');
      return;
    }

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comment', postId, body: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, data.comment] } : p
        )
      );
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      setExpandedComments((prev) => ({ ...prev, [postId]: true }));
      toast.success(`Reply posted as ${data.comment.authorPseudonym}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post reply');
    }
  };

  const handleSubmitReport = async (postId: number) => {
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'report',
          targetType: 'post',
          targetId: postId,
          reason: reportReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message || 'Flagged for moderation review');
      setReportingPostId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit report');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50/40 via-white to-teal-50/30">
      <Navigation />

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 mb-2">
              <Users className="h-3.5 w-3.5" />
              Peer Support · Auto-Pseudonymized
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Anonymous Community Circles
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Share experiences safely under generated pseudonyms. Zero email, real name, or medical report data is ever exposed here.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/anonymous-chat">
              <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                <MessageCircle className="h-4 w-4 mr-2" />
                1-on-1 Anon AI Chat
              </Button>
            </Link>
            <Button
              onClick={() => setShowComposer(!showComposer)}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              {showComposer ? 'Close Composer' : 'Ask or Share Anonymously'}
            </Button>
          </div>
        </div>

        {/* Privacy & Moderation Banner */}
        <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 flex items-start gap-3 text-xs text-teal-950">
          <ShieldCheck className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Safe Peer Environment</p>
            <p className="mt-0.5 leading-relaxed">
              Every post and reply receives a fresh random pseudonym (like <em>CalmLotus-412</em>). Peer stories are supportive experiences—not medical prescriptions. Flag unsafe advice anytime for moderation review.
            </p>
          </div>
        </div>

        {/* New Post Composer */}
        {showComposer && (
          <Card className="border-rose-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Create an Anonymous Post</CardTitle>
              <CardDescription>
                Your identity stays completely private; a random pseudonym will be assigned automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Topic Circle</label>
                    <select
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      {TOPICS.filter((t) => t !== 'All').map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Headline</label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Short descriptive title..."
                      maxLength={160}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Your Question or Experience</label>
                  <Textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Share context without including your real name, phone number, or address..."
                    rows={4}
                    maxLength={2000}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowComposer(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submittingPost} className="bg-rose-600 hover:bg-rose-700 text-white">
                    {submittingPost ? 'Publishing...' : 'Publish Anonymously'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Topic Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTopic(t)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors border ${
                activeTopic === t
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-40 animate-pulse bg-slate-100 border-slate-200" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-10 text-center border-slate-200">
            <p className="text-slate-600">No posts in this circle yet. Start the conversation above!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const isExpanded = Boolean(expandedComments[post.id]);
              return (
                <Card key={post.id} className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                          {post.topic}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-700">
                          {post.authorPseudonym}
                        </span>
                        <span className="text-xs text-slate-400">
                          · {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setReportingPostId(reportingPostId === post.id ? null : post.id)
                        }
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600"
                      >
                        <Flag className="h-3.5 w-3.5" />
                        Report
                      </button>
                    </div>
                    <CardTitle className="text-lg text-slate-900 mt-1">{post.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {post.body}
                    </p>

                    {reportingPostId === post.id && (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 flex flex-wrap items-center gap-2">
                        <select
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="flex-1 min-w-[200px] rounded border border-rose-200 bg-white px-2.5 py-1.5 text-xs"
                        >
                          <option value="Misinformation / Unsafe medical advice">
                            Misinformation / Unsafe medical advice
                          </option>
                          <option value="Harassment or disrespectful language">
                            Harassment or disrespectful language
                          </option>
                          <option value="Personal identifying details exposed">
                            Personal identifying details exposed
                          </option>
                          <option value="Spam or commercial solicitation">
                            Spam or commercial solicitation
                          </option>
                        </select>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleSubmitReport(post.id)}
                        >
                          Submit Flag
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReportingPostId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleHelpful(post.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Helpful ({post.helpfulCount})
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedComments((prev) => ({ ...prev, [post.id]: !isExpanded }))
                        }
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Heart className="h-3.5 w-3.5 text-rose-500" />
                        Support Replies ({post.comments.length})
                      </button>
                    </div>

                    {/* Replies Section */}
                    {(isExpanded || post.comments.length > 0) && (
                      <div className="space-y-3 rounded-lg bg-slate-50/80 border border-slate-200 p-3.5">
                        {post.comments.slice(0, isExpanded ? undefined : 2).map((c) => (
                          <div key={c.id} className="border-b last:border-b-0 border-slate-200 pb-2.5 last:pb-0">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-teal-800">{c.authorPseudonym}</span>
                              <span className="text-slate-400">
                                · {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-700 leading-relaxed">{c.body}</p>
                          </div>
                        ))}

                        {!isExpanded && post.comments.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedComments((prev) => ({ ...prev, [post.id]: true }))
                            }
                            className="text-xs font-semibold text-rose-600 hover:underline"
                          >
                            View all {post.comments.length} replies
                          </button>
                        )}

                        <div className="flex gap-2 pt-1">
                          <Input
                            value={commentDrafts[post.id] || ''}
                            onChange={(e) =>
                              setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            placeholder="Write a supportive anonymous reply..."
                            className="bg-white text-xs h-9"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleAddComment(post.id)}
                            className="bg-teal-600 hover:bg-teal-700 text-white h-9"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
