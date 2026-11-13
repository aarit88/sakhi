"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, ArrowRight, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { apiClient } from "@/lib/api-client"

type AIMessageObj = {
  role: "user" | "assistant"
  text?: string
  urgent?: boolean
  sections?: { title: string; content: string }[]
  traditionalGuidance?: { enabled: boolean; disclaimer: string; suggestions: string[] }
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<AIMessageObj[]>([
    { role: "assistant", text: "Hi, I'm SAKHI, your personalized wellness companion. How can I help you today?" }
  ])
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    
    setMessages(prev => [...prev, { role: "user", text }])
    setInput("")
    setLoading(true)

    try {
      const response = await apiClient.post("/api/ai/chat", {
        message: text,
        conversationId
      })

      if (response.success) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          text: response.data.message,
          urgent: response.data.urgent,
          sections: response.data.sections,
          traditionalGuidance: response.data.traditionalGuidance
        }])
        if (response.data.conversationId) {
          setConversationId(response.data.conversationId)
        }
      } else {
        setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I am having trouble connecting to the server." }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", text: "A network error occurred." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:scale-105 transition-transform"
        >
          <Bot className="w-8 h-8" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] max-w-[90vw] h-[500px] bg-white border border-pink-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Bot className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">SAKHI</h3>
                <p className="text-[10px] text-pink-100">Personalized Wellness AI</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto bg-pink-50/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-2xl px-4 py-2 text-sm max-w-[85%] ${
                  msg.role === "user" 
                    ? "bg-pink-500 text-white rounded-br-sm" 
                    : msg.urgent 
                      ? "bg-red-100 text-red-900 border border-red-200 rounded-bl-sm font-medium"
                      : "bg-white text-gray-800 border border-pink-100 rounded-bl-sm shadow-sm"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  
                  {msg.sections && msg.sections.map((sec, i) => (
                    <div key={i} className="mt-2">
                      <strong className="block text-[13px] text-pink-700">{sec.title}</strong>
                      <span className="text-gray-700 text-xs">{sec.content}</span>
                    </div>
                  ))}

                  {msg.traditionalGuidance?.enabled && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase">Traditional Lifestyle Guidance</span>
                      </div>
                      <ul className="list-disc list-inside text-xs text-amber-900 space-y-1 mb-2">
                        {msg.traditionalGuidance.suggestions.map((sug, i) => (
                          <li key={i}>{sug}</li>
                        ))}
                      </ul>
                      <p className="text-[9px] text-amber-600 italic leading-tight">{msg.traditionalGuidance.disclaimer}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-pink-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-pink-100">
            <div className="flex items-center space-x-2">
              <input
                className="flex-1 text-sm rounded-full border border-pink-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition-all bg-gray-50 hover:bg-white"
                placeholder="Ask SAKHI anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={loading}
              />
              <Button
                size="icon"
                className="w-10 h-10 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-md disabled:opacity-50 transition-colors"
                onClick={handleSend}
                disabled={loading}
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
