"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Sparkles, Zap, Shield, ArrowRight, Play, Star } from "lucide-react"

// Define a type for the particle data to ensure type safety
type Particle = {
  left: string
  top: string
  animationDelay: string
  animationDuration: string
}

export function InteractiveHero() {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredDevice, setHoveredDevice] = useState<number | null>(null)
  
  // State to hold randomly generated particle positions to fix hydration error
  const [particles, setParticles] = useState<Particle[]>([])

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

  const currentFeatureData = features[currentFeature]
  const IconComponent = currentFeatureData.icon

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles (Now uses client-side state) */}
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-pink-300 rounded-full opacity-20 animate-float"
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
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            left: "10%",
            top: "20%",
          }}
        />
        <div
          className="absolute w-80 h-80 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
            right: "10%",
            bottom: "20%",
            animationDelay: "2s",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-in-left">
            <div className="space-y-4">
              <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Women's Health
              </Badge>

              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Meet{" "}
                <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent animate-shimmer">
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
                className={`transition-all duration-300 ${isAnimating ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"}`}
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
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 btn-animate group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 transition-all duration-300 hover-lift bg-transparent"
              >
                Watch Demo
              </Button>
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
                    transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
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

              {/* Pulse rings */}
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-pink-300 rounded-full animate-ping opacity-20"
                  style={{
                    width: `${(i + 1) * 100}px`,
                    height: `${(i + 1) * 100}px`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: "3s",
                  }}
                />
              ))}
            </div>

            {/* Floating stats */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-float">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">All Systems Active</span>
              </div>
            </div>

            <div
              className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-float"
              style={{ animationDelay: "1s" }}
            >
              <div className="text-center">
                <div className="text-lg font-bold text-pink-600">98%</div>
                <div className="text-xs text-gray-600">Health Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-pink-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-pink-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}