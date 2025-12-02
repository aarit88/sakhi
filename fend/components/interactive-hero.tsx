"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Sparkles, Zap, Shield, ArrowRight, Play, Star, MessageCircle, X } from "lucide-react"

// Define a type for the particle data to ensure type safety
type Particle = {
  left: string
  top: string
  animationDelay: string
  animationDuration: string
}

export function InteractiveHero() {
  const router = useRouter()

  const [currentFeature, setCurrentFeature] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredDevice, setHoveredDevice] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false) // 🔹 NEW

  // State to hold randomly generated particle positions to fix hydration error
  const [particles, setParticles] = useState<Particle[]>([])

  // 🔹 Anonymous chat popup state
  const [showAnonInvite, setShowAnonInvite] = useState(false)
  const [isAnonChatOpen, setIsAnonChatOpen] = useState(false)
  const [anonChatInput, setAnonChatInput] = useState("")
  const [anonMessages, setAnonMessages] = useState<
    { from: "them" | "you"; text: string; time: string }[]
  >([
    {
      from: "them",
      text: "Hi, I'm an anonymous Sakhi. I need some suggestions, can you help me?",
      time: "Just now",
    },
  ])
  const [hasUnread, setHasUnread] = useState(true)

  const features = [
    {
      title: "Smart Health Tracking",
      description: "AI-powered insights for your wellness journey",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      stats: "24/7 Monitoring",
    },
    {
      title: "Personalized Care",
      description: "Tailored recommendations for your unique needs",
      icon: Sparkles,
      color: "from-purple-500 to-indigo-500",
      stats: "95% Accuracy",
    },
    {
      title: "Instant Connectivity",
      description: "Seamless integration with all your devices",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      stats: "Real-time Sync",
    },
  ]

  const devices = [
    { name: "Heat Pack", temp: "38°C", status: "Active", position: { x: 20, y: 30 } },
    { name: "Water Bottle", level: "75%", status: "Connected", position: { x: 60, y: 20 } },
    { name: "Mood Light", mood: "Calm", status: "On", position: { x: 80, y: 60 } },
  ]

  // 🔹 mark when we're mounted so we can safely use dynamic transforms
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fix for Hydration Error: Generate random values on the client side only
  useEffect(() => {
    const NUM_PARTICLES = 20
    const generatedParticles: Particle[] = []
    for (let i = 0; i < NUM_PARTICLES; i++) {
      generatedParticles.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 4}s`,
        animationDuration: `${4 + Math.random() * 4}s`,
      })
    }
    setParticles(generatedParticles)
  }, [])

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length)
        setIsAnimating(false)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Mouse tracking for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // 🔹 Show avatar popup trigger after user lands on page
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnonInvite(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const currentFeatureData = features[currentFeature]
  const IconComponent = currentFeatureData.icon

  // 🔹 helper: parallax transform that is stable on server + first client render
  const parallaxTransform = (multX: number, multY: number) =>
    isMounted ? `translate(${mousePosition.x * multX}px, ${mousePosition.y * multY}px)` : "translate(0px, 0px)"

  // 🔹 handle send in anonymous chat (with backend call)
  const handleSendAnonMessage = async () => {
    if (!anonChatInput.trim()) return
    const text = anonChatInput.trim()

    // update UI immediately
    setAnonMessages((prev) => [
      ...prev,
      { from: "you", text, time: "Just now" },
    ])
    setAnonChatInput("")

    // send to backend (non-blocking for UI)
    try {
      await fetch("/api/anon-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      })
    } catch (error) {
      console.error("Failed to send anonymous message", error)
    }
  }

  return (
    // this is your main hero / “home” section
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-pink-50 via-rose-50 to-white pt-24"
    >
      {/* Background decorative layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-white opacity-70" />

        {/* Floating particles */}
        {particles.map((particle, index) => (
          <div
            key={index}
            className="absolute w-2 h-2 rounded-full bg-pink-300/60 animate-float-slow"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration,
            }}
          />
        ))}

        {/* Gradient orbs with parallax */}
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: parallaxTransform(0.02, 0.02),
            left: "10%",
            top: "20%",
          }}
        />
        <div
          className="absolute w-80 h-80 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: parallaxTransform(-0.01, -0.01),
            right: "10%",
            bottom: "20%",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-in-left">
            <div className="space-y-4">
              <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Women's Health
              </Badge>

              {/* SAKHI title with original fancy animation */}
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Meet <span className="text-pink-500">SAKHI</span>{" "}
                <span className="sakhi-title-animated sakhi-title-gradient bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent animate-shimmer sakhi-title-overlay">
                  SAKHI
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Your intelligent companion for holistic women's wellness. Combining ancient Ayurvedic wisdom with modern
                IoT technology.
              </p>
            </div>

            {/* Interactive Feature Showcase */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 hover:shadow-xl transition-all duration-500">
              <div
                className={`transition-all duration-300 ${
                  isAnimating ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"
                }`}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentFeatureData.color} flex items-center justify-center animate-pulse-glow`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{currentFeatureData.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {currentFeatureData.stats}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-600">{currentFeatureData.description}</p>
              </div>

              {/* Feature indicators */}
              <div className="flex space-x-2 mt-4">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentFeature ? "bg-pink-500 w-6" : "bg-gray-300 hover:bg-pink-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* ✅ Redirects to /subscription */}
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 btn-animate group"
                onClick={() => router.push("/subscription")}
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <a
                href="https://youtu.be/xEyHLzRx4UA?si=CgQUXVd2JnHprMCm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 transition-all duration-300 hover-lift bg-transparent"
                >
                  Watch Demo
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-pink-100">
              {[
                { number: "10K+", label: "Happy Users", icon: Heart },
                { number: "99.9%", label: "Uptime", icon: Shield },
                { number: "4.9", label: "App Rating", icon: Star },
              ].map((stat, index) => {
                const StatIcon = stat.icon
                return (
                  <div key={index} className="text-center group cursor-pointer">
                    <div className="flex items-center justify-center mb-2">
                      <StatIcon className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Content - Interactive Device Visualization */}
          <div className="relative animate-slide-in-right">
            <div className="relative w-full h-96 lg:h-[500px]">
              {/* Central hub */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center animate-pulse-glow">
                <Heart className="w-12 h-12 text-white animate-bounce-gentle" />
              </div>

              {/* Device nodes */}
              {devices.map((device, index) => (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{
                    left: `${device.position.x}%`,
                    top: `${device.position.y}%`,
                    // 🔹 initial render: just center; after mount: add mouse parallax
                    transform: isMounted
                      ? `translate(-50%, -50%) translate(${mousePosition.x * 0.01}px, ${
                          mousePosition.y * 0.01
                        }px)`
                      : "translate(-50%, -50%)",
                  }}
                  onMouseEnter={() => setHoveredDevice(index)}
                  onMouseLeave={() => setHoveredDevice(null)}
                >
                  {/* Connection line */}
                  <svg
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                      width: `${Math.abs(50 - device.position.x) * 8}px`,
                      height: `${Math.abs(50 - device.position.y) * 8}px`,
                    }}
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2={`${(50 - device.position.x) * 4}px`}
                      y2={`${(50 - device.position.y) * 4}px`}
                      stroke="rgba(236, 72, 153, 0.3)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  </svg>

                  {/* Device node */}
                  <div
                    className={`w-16 h-16 bg-white rounded-full shadow-lg border-4 border-pink-200 flex items-center justify-center transition-all duration-300 ${
                      hoveredDevice === index ? "scale-110 border-pink-400 shadow-xl" : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-pulse" />
                  </div>

                  {/* Device info tooltip */}
                  <div
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg p-3 min-w-max transition-all duration-300 ${
                      hoveredDevice === index
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">{device.name}</div>
                    <div className="text-xs text-gray-600">
                      {device.temp || device.level || device.mood} • {device.status}
                    </div>
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 SINGLE cartoon avatar popup trigger with notification dot */}
      {showAnonInvite && (
        <button
          type="button"
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-2xl border-4 border-white bg-white overflow-hidden animate-slide-in-up"
          onClick={() => {
            setIsAnonChatOpen((open) => {
              const next = !open
              if (next) setHasUnread(false)
              return next
            })
          }}
        >
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden">
            <Image
              src="/sakhi-cat.png" // ⬅️ your cartoon image in /public
              alt="Anonymous Sakhi"
              fill
              className="object-cover"
            />
            {(hasUnread || (!isAnonChatOpen && anonMessages.length > 0)) && (
              <>
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-pink-500 rounded-full border-2 border-white" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-pink-500 rounded-full border-2 border-white animate-ping" />
              </>
            )}
          </div>
        </button>
      )}

      {/* 🔹 Anonymous chat window (opens when avatar clicked) */}
      {isAnonChatOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-80 max-w-[90vw] bg-white border border-pink-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Anonymous Sakhi needs a suggestion</p>
                <p className="text-[10px] text-pink-100">You are replying anonymously</p>
              </div>
            </div>
            <button
              className="text-white/80 hover:text-white"
              onClick={() => setIsAnonChatOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 px-3 py-2 space-y-2 max-h-64 overflow-y-auto bg-pink-50/40">
            {anonMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.from === "you" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-2xl px-3 py-2 text-xs max-w-[80%] ${
                    msg.from === "you"
                      ? "bg-pink-500 text-white rounded-br-sm"
                      : "bg-white text-gray-800 border border-pink-100 rounded-bl-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="block mt-1 text-[9px] opacity-70">
                    {msg.from === "you" ? "You • " : "Anonymous • "}
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-pink-100 bg-white px-3 py-2">
            <div className="flex items-center space-x-2">
              <input
                className="flex-1 text-xs rounded-full border border-pink-200 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-pink-400"
                placeholder="Type your anonymous reply..."
                value={anonChatInput}
                onChange={(e) => setAnonChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSendAnonMessage()
                  }
                }}
              />
              <Button
                size="icon"
                className="w-8 h-8 bg-pink-500 hover:bg-pink-600 text-white rounded-full"
                onClick={handleSendAnonMessage}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="mt-1 text-[9px] text-gray-400 text-right">
              Be kind. Your name will not be shown.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
