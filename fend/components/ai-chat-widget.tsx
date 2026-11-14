'use client';

import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, ArrowRight, Bot, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

type AIMessageObj = {
  role: 'user' | 'assistant';
  text: string;
  urgent?: boolean;
  citations?: string[];
};

export function AiChatWidget() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIMessageObj[]>([
    {
      role: 'assistant',
      text: "Hi, I'm SAKHI, your personalized wellness companion. Ask me about cycle patterns, symptoms, Ayurveda guidance, or your uploaded lab reports.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    apiClient
      .get('/api/ai/chat')
      .then((res) => {
        if (res?.success && Array.isArray(res.messages) && res.messages.length > 0) {
          setMessages(
            res.messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              text: m.content,
              urgent: Boolean(m.safetyFlagged),
              citations: m.citations || [],
            }))
          );
        }
      })
      .catch(() => {});
  }, [isOpen, isAuthenticated]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post('/api/ai/chat', { message: text });
      if (response?.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: response.reply,
            urgent: Boolean(response.safetyTriggered),
            citations: response.citations || [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: response?.message || 'Unable to generate a response right now.' },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            err?.message?.includes('sign in')
              ? 'Please sign in to chat with your personal SAKHI companion, or try Anonymous Chat (/anonymous-chat) without signing in.'
              : err?.message || 'Could not reach the AI companion service.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-xl transition-transform hover:scale-105"
          aria-label="Open SAKHI AI Companion"
        >
          <Bot className="h-7 w-7" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[360px] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-rose-600">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">SAKHI Companion</h3>
                <p className="text-[11px] text-rose-100">Educational Guidance Only</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-rose-50/30 px-4 py-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-rose-600 text-white'
                      : msg.urgent
                        ? 'border border-red-300 bg-red-50 text-red-950'
                        : 'border border-rose-100 bg-white text-slate-800 shadow-sm'
                  }`}
                >
                  {msg.urgent && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5" /> Urgent Medical Attention Guidance
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 border-t border-slate-100 pt-1.5 text-[11px] text-slate-500 flex items-start gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                      <span>Sources: {msg.citations.join(' · ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-500 italic">SAKHI is reviewing your context...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-100 bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:bg-white"
                placeholder="Ask SAKHI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={loading}
              />
              <Button
                size="icon"
                className="h-9 w-9 bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
