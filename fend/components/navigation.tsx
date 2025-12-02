"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Heart, Dumbbell, Utensils, Activity, Sparkles, Home } from "lucide-react"
import { useMagneticEffect } from "@/lib/hooks/use-advanced-animations"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [scrollPercent, setScrollPercent] = useState(0)

  const router = useRouter()

  const logoRef = useRef<HTMLDivElement>(null)
  
  const { elementRef: signupCtaRef, transform: signupCtaTransform, handlers: signupCtaHandlers } =
    useMagneticEffect<HTMLButtonElement>(0.15)

  const navItems = [
    { href: "#home", label: "Home", icon: Home },
    { href: "#devices", label: "Devices", icon: Heart },
    { href: "#exercise", label: "Exercise", icon: Dumbbell },
    { href: "#diet", label: "Nutrition", icon: Utensils },
    { href: "#health", label: "Health", icon: Sparkles },
    { href: "#dashboard", label: "Dashboard", icon: Activity },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)

      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolledPercent = (window.scrollY / docHeight) * 100
      setScrollPercent(Math.min(100, scrolledPercent))

      const sections = navItems.map((item) => item.href.substring(1))
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })

      if (currentSection) {
        setActiveSection(`#${currentSection}`)
      } else if (window.scrollY < 10) {
        setActiveSection("#home")
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Top Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled ? "glass-pink border-b border-pink-200/30 backdrop-blur-xl shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div
              ref={logoRef}
              className="flex items-center space-x-2 group cursor-pointer magnetic-container"
              onClick={() => router.push("/")}
            >
              <div className="relative w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 animate-morph-blob-1 flex items-center justify-center group-hover:animate-glow-pulse transition-all duration-300">
                <img src="logo.jpg" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent group-hover:animate-gradient-shift animate-text-reveal">
                SAKHI
              </span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => {
                const IconComponent = item.icon
                const isActive = activeSection === item.href
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? "text-pink-600 bg-pink-100 shadow-md"
                        : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}

              {/* Login + Signup */}
              <div className="flex space-x-3 ml-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="text-pink-600 border-pink-400 hover:bg-pink-50 transition-all duration-300"
                >
                  Login
                </Button>
                
                <Button
                  ref={signupCtaRef}
                  onClick={() => router.push("/signup")}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg transition-all duration-300"
                  style={{ transform: `translate(${signupCtaTransform.x}px, ${signupCtaTransform.y}px)` }}
                  {...signupCtaHandlers}
                >
                  Signup
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="hover:bg-pink-50 transition-all duration-300"
              >
                {isOpen ? <X className="w-6 h-6 text-pink-500" /> : <Menu className="w-6 h-6 text-pink-500" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {isOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 glass-pink rounded-2xl mt-2 border border-pink-200/50 shadow-xl">
                {navItems.map((item, index) => {
                  const IconComponent = item.icon
                  const isActive = activeSection === item.href
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "text-pink-600 bg-pink-100/80 shadow-sm"
                          : "text-gray-700 hover:text-pink-500 hover:bg-pink-50/80"
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}
                
                {/* Mobile Login + Signup */}
                <div className="flex flex-col space-y-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsOpen(false)
                      router.push("/login")
                    }}
                    className="w-full text-pink-600 border-pink-400 hover:bg-pink-50 transition-all duration-300"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsOpen(false)
                      router.push("/signup")
                    }}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
                  >
                    Signup
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Right side floating nav dots */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col space-y-3">
          {navItems.map((item) => {
            const isActive = activeSection === item.href
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`group relative w-3 h-3 rounded-full transition-all duration-300 ${
                  isActive ? "bg-pink-500 shadow-lg" : "bg-gray-300 hover:bg-pink-400"
                }`}
                title={item.label}
              >
                {isActive && <div className="absolute inset-0 rounded-full bg-pink-500 animate-ping opacity-30" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-pink-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>
    </>
  )
}
