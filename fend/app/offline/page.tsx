"use client"

import { WifiOff, RotateCw, Heart, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-white px-4 py-12">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-pink-100 p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        {/* Logo / Header */}
        <div className="flex justify-center items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            SAKHI
          </span>
        </div>

        {/* Offline Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-pink-500" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">You Are Currently Offline</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Please check your internet connection to continue accessing your wellness dashboard, AI companion, and medical reports.
          </p>
        </div>

        {/* Privacy Note */}
        <div className="p-4 bg-pink-50/60 border border-pink-200/60 rounded-2xl flex items-start space-x-3 text-left">
          <ShieldCheck className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
          <p className="text-xs text-pink-950 leading-normal">
            <strong>Privacy Protection:</strong> To safeguard your sensitive personal health data, confidential reports and records are never stored locally in offline cache.
          </p>
        </div>

        {/* Retry Button */}
        <Button
          onClick={handleRetry}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg flex items-center justify-center space-x-2 py-3"
        >
          <RotateCw className="w-4 h-4" />
          <span>Try Reconnecting</span>
        </Button>
      </div>
    </div>
  )
}
