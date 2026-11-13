"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { ChevronLeft, ChevronRight, Volume2, Maximize2, Loader2, HeartPulse } from "lucide-react"

interface VisualContent {
  id: string
  category: string
  language: string
  title: string
  description?: string
  imageUrl: string
  orderIndex: number
}

interface ComicStripViewerProps {
  category: string
  title: string
}

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
]

export function ComicStripViewer({ category, title }: ComicStripViewerProps) {
  const [panels, setPanels] = useState<VisualContent[]>([])
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true)
        const response = await apiClient.get(`/api/visual-content?category=${category}&language=${currentLanguage}`)
        if (response.success) {
          setPanels(response.data)
        } else {
          setError("Failed to load visual guide.")
        }
      } catch (err: any) {
        setError(err.message || "Network error loading visual guide.")
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [category, currentLanguage])

  const handleNext = () => {
    if (currentIndex < panels.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  if (loading && panels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-pink-50 rounded-2xl min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-4" />
        <p className="text-pink-600 font-medium">Loading visual guide...</p>
      </div>
    )
  }

  if (error || panels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl min-h-[400px] border border-slate-200">
        <HeartPulse className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-slate-600 font-medium text-center">
          {error || "No visual guides available for this topic yet."}
        </p>
      </div>
    )
  }

  const currentPanel = panels[currentIndex]

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-pink-500 to-rose-500 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-white font-bold text-xl">{title}</h3>
        
        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <select 
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="bg-white/20 border border-white/30 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="text-slate-800">
                {lang.label}
              </option>
            ))}
          </select>
          <button className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="relative bg-slate-50 aspect-video flex items-center justify-center group overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        )}
        
        {/* Main Image */}
        <img
          src={currentPanel.imageUrl}
          alt={currentPanel.title}
          className="w-full h-full object-contain p-4 transition-opacity duration-300"
          loading="lazy"
        />

        {/* Overlay Navigation */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Previous panel"
          className="absolute left-2 sm:left-4 p-3 rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur-sm hover:bg-white disabled:opacity-30 transition-all duration-300 transform opacity-100 flex items-center justify-center min-w-[44px] min-h-[44px]"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={handleNext}
          disabled={currentIndex === panels.length - 1}
          aria-label="Next panel"
          className="absolute right-2 sm:right-4 p-3 rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur-sm hover:bg-white disabled:opacity-30 transition-all duration-300 transform opacity-100 flex items-center justify-center min-w-[44px] min-h-[44px]"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Fullscreen toggle (placeholder) */}
        <button className="absolute top-4 right-4 p-2 rounded-lg bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Footer / Description */}
      <div className="p-6">
        <h4 className="text-xl font-bold text-slate-900 mb-2">{currentPanel.title}</h4>
        {currentPanel.description && (
          <p className="text-slate-600 leading-relaxed text-lg">{currentPanel.description}</p>
        )}
        
        {/* Progress Dots */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {panels.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex ? "w-6 h-2.5 bg-pink-500" : "w-2.5 h-2.5 bg-pink-200 hover:bg-pink-300"
              }`}
              aria-label={`Go to panel ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
