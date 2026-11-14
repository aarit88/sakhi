'use client';

import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileText,
  Lock,
  MessageCircle,
  PhoneCall,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

type ChatRole = 'user' | 'assistant';

interface AnonMessage {
  id: string;
  role: ChatRole;
  content: string;
  safetyFlagged?: boolean;
  suggestions?: string[];
  helplines?: Array<{ label: string; contact: string }>;
}

const TOPIC_OPTIONS = [
  'general',
  'Menstrual Health',
  'PCOS & Hormones',
  'Pregnancy & Postpartum',
  'Mental Wellness',
  'Contraception & STI Care',
];

const STARTER_PROMPTS = [
  'My period is 10 days late and I feel stressed.',
  'How do I tell if period cramps are severe enough to see a doctor?',
  'Can PCOS cause irregular spotting between periods?',
  'I have been feeling overwhelmed and anxious before my cycle.',
];

const WELCOME_MSG: AnonMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Welcome to SAKHI Anonymous Support. This space is strictly isolated from your personal account, medical reports, and body-map records. Ask anything stigma-free about periods, hormones, sexual health, pregnancy concerns, or mental wellbeing.',
  suggestions: STARTER_PROMPTS,
};

export default function AnonymousChatPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [topic, setTopic] = useState<string>('general');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [messages, setMessages] = useState<AnonMessage[]>([WELCOME_MSG]);

  useEffect(() => {
    async function restoreSession() {
      const savedToken =
        typeof window !== 'undefined' ? localStorage.getItem('sakhi_anon_session_token') : null;
      if (!savedToken) {
        setInitialLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/anonymous-chat/message?sessionToken=${encodeURIComponent(savedToken)}`
        );
        const data = await res.json();
        if (res.ok && data.sessionToken && Array.isArray(data.messages) && data.messages.length > 0) {
          setSessionToken(data.sessionToken);
          if (data.topic) setTopic(data.topic);
          setMessages([
            WELCOME_MSG,
            ...data.messages.map((m: any) => ({
              id: String(m.id),
              role: m.sender === 'assistant' ? 'assistant' : 'user',
              content: m.content,
              safetyFlagged: Boolean(m.safetyFlagged),
            })),
          ]);
        }
      } catch {
        // Non-blocking fallback
      } finally {
        setInitialLoading(false);
      }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const startNewSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sakhi_anon_session_token');
    }
    setSessionToken('');
    setMessages([WELCOME_MSG]);
    toast.success('Started a fresh anonymous session');
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: AnonMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/anonymous-chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: sessionToken || undefined,
          topic,
          message: trimmed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Unable to send message');
      }

      if (data.sessionToken) {
        setSessionToken(data.sessionToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sakhi_anon_session_token', data.sessionToken);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          safetyFlagged: Boolean(data.safetyTriggered),
          helplines: data.safety?.helplines,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to send anonymous message';
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'I ran into a temporary connection issue. Please try sending your question again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navigation />

      <div className="mx-auto w-full max-w-6xl flex-1 grid gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Chat Panel */}
        <div className="flex min-h-[75vh] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-600 text-white">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-sm font-bold text-slate-900">Anonymous SAKHI Support</h1>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" /> Zero Account Linkage
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700">
                    <Lock className="h-3.5 w-3.5" /> Isolated Session
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"
                aria-label="Conversation topic"
              >
                {TOPIC_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    Topic: {t === 'general' ? 'General Wellness' : t}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={startNewSession}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                New Session
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 max-h-[60vh]">
            {initialLoading ? (
              <p className="text-xs text-slate-500">Restoring anonymous session...</p>
            ) : (
              messages.map((message) => (
                <article
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                        message.safetyFlagged
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {message.safetyFlagged ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[84%] rounded-xl border px-4 py-3 text-sm leading-6 ${
                      message.role === 'user'
                        ? 'border-rose-200 bg-rose-600 text-white'
                        : message.safetyFlagged
                        ? 'border-rose-300 bg-rose-50 text-rose-950'
                        : 'border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>

                    {message.role === 'assistant' && (
                      <div
                        className={`mt-2.5 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                          message.safetyFlagged
                            ? 'border-rose-300 bg-white text-rose-800'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {message.safetyFlagged ? (
                          <>
                            <PhoneCall className="h-3 w-3" /> Urgent Safety Guidance
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Educational & Confidential
                          </>
                        )}
                      </div>
                    )}

                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => sendMessage(suggestion)}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-left text-xs font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-teal-100 text-teal-700">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                Sakhi is thinking...
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                maxLength={1600}
                placeholder="Ask privately without revealing your identity..."
                className="min-h-12 flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Send anonymous message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2.5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Strict Privacy Architecture
            </h2>
            <p className="text-xs leading-relaxed text-slate-600">
              This anonymous channel uses an opaque random token and never queries your personal profile, cycle history, 3D body map, or clinical reports.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/community"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100"
              >
                <Users className="h-3.5 w-3.5" />
                Visit Peer Community Forum
              </Link>
              <Link
                href="/care-finder"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <FileText className="h-3.5 w-3.5" />
                Find Nearby Care Facilities
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-rose-900">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Medical Red-Flag Detection
            </h2>
            <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-rose-900">
              <li>• Severe pelvic or one-sided pain / dizziness / fainting</li>
              <li>• Soaking through a pad or tampon every hour</li>
              <li>• Bleeding during pregnancy or chest pain / breathlessness</li>
              <li>• Thoughts of self-harm or immediate personal danger</li>
            </ul>
            <p className="mt-3 text-[11px] font-medium text-rose-800">
              Emergency (India): 112 / 108 · Tele-MANAS Mental Health: 14416 · Women Helpline: 181
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
