"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  FileText,
  HeartPulse,
  Lock,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import toast from "react-hot-toast"

const API = process.env.NEXT_PUBLIC_API_URL || ""

type ChatRole = "user" | "assistant"
type SafetyLevel = "normal" | "caution" | "urgent"

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  safetyLevel?: SafetyLevel
  suggestions?: string[]
  resources?: string[]
  disclaimer?: string
}

type ChatResponse = {
  reply: string
  intent: string
  safetyLevel: SafetyLevel
  suggestions: string[]
  resources: string[]
  disclaimer: string
}

const starterPrompts = [
  "My period is late and I am worried.",
  "I have cramps and heavy bleeding.",
  "Can you help me understand my CBC report?",
  "I feel anxious before my period.",
]

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getAnonymousSessionId() {
  if (typeof window === "undefined") return "server"
  const existing = localStorage.getItem("sakhi_anon_session")
  if (existing) return existing
  const created = `anon-${crypto.randomUUID()}`
  localStorage.setItem("sakhi_anon_session", created)
  return created
}

function safetyStyle(level?: SafetyLevel) {
  if (level === "urgent") return "border-red-200 bg-red-50 text-red-700"
  if (level === "caution") return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-emerald-200 bg-emerald-50 text-emerald-700"
}

function safetyIcon(level?: SafetyLevel) {
  if (level === "urgent") return <AlertTriangle className="h-4 w-4" />
  if (level === "caution") return <HeartPulse className="h-4 w-4" />
  return <CheckCircle2 className="h-4 w-4" />
}

export default function AnonymousChatPage() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sessionId, setSessionId] = useState("")
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I am Sakhi. You can ask about periods, symptoms, mental health, nutrition, pregnancy concerns, or report values. I will help you decide what may be routine, what needs watching, and what needs clinical care.",
      safetyLevel: "normal",
      suggestions: starterPrompts,
      resources: ["Clinical report parser", "Qualified clinician for diagnosis"],
      disclaimer: "This chat is educational and anonymous. It is not a substitute for emergency or professional care.",
    },
  ])

  useEffect(() => {
    setSessionId(getAnonymousSessionId())
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, loading])

  const history = useMemo(
    () =>
      messages
        .filter((message) => message.id !== "welcome")
        .slice(-8)
        .map((message) => ({ role: message.role, content: message.content })),
    [messages]
  )

  const sendMessage = async (messageText: string) => {
    const trimmed = messageText.trim()
    if (!trimmed || loading) return

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
    }

    setMessages((current) => [...current, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/anonymous-chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: trimmed,
          history,
        }),
      })

      const data = (await res.json()) as ChatResponse & { message?: string }
      if (!res.ok) throw new Error(data.message || "Unable to reach Sakhi")

      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: data.reply,
          safetyLevel: data.safetyLevel,
          suggestions: data.suggestions,
          resources: data.resources,
          disclaimer: data.disclaimer,
        },
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Chat failed"
      toast.error(message)
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: "I could not connect to the Sakhi backend. Please check that the backend is running on port 5000.",
          safetyLevel: "caution",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    sendMessage(input)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </button>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-rose-600 text-white">
              <MessageCircle className="h-5 w-5" />
            </span>
            Anonymous Sakhi Chat
          </div>

          <button
            type="button"
            onClick={() => router.push("/clinical-reports")}
            className="inline-flex items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100"
          >
            <FileText className="h-4 w-4" />
            Reports
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-[calc(100vh-7rem)] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Anonymous
              </span>
              <span className="inline-flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                <Lock className="h-3.5 w-3.5" />
                Not stored by chat API
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-rose-100 text-rose-700">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-lg border px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "border-rose-200 bg-rose-600 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-800"
                  }`}
                >
                  <p>{message.content}</p>

                  {message.role === "assistant" && message.safetyLevel && (
                    <div
                      className={`mt-3 inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs font-semibold ${safetyStyle(
                        message.safetyLevel
                      )}`}
                    >
                      {safetyIcon(message.safetyLevel)}
                      {message.safetyLevel === "urgent" ? "Urgent" : message.safetyLevel === "caution" ? "Review" : "Stable"}
                    </div>
                  )}

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => sendMessage(suggestion)}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-left text-xs font-medium text-slate-700 hover:border-rose-200 hover:bg-rose-50"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {message.disclaimer && (
                    <p className="mt-3 border-t border-slate-200 pt-2 text-xs leading-5 text-slate-500">{message.disclaimer}</p>
                  )}
                </div>
              </article>
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-rose-100 text-rose-700">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                Sakhi is reading your message...
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={2}
                maxLength={1600}
                placeholder="Ask anonymously..."
                className="min-h-12 flex-1 resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-rose-600 text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Privacy
            </h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p>No name, email, or login is required for this chat.</p>
              <p>The API response is generated without saving message history.</p>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Red Flags
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>Severe pelvic pain, fainting, or chest pain</li>
              <li>Heavy bleeding that soaks pads rapidly</li>
              <li>Pregnancy with bleeding or one-sided pain</li>
              <li>Thoughts of self-harm or feeling unsafe</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  )
}
