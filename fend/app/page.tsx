"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Navigation } from "@/components/navigation"
import { InteractiveHero } from "@/components/interactive-hero"
import DeviceDashboard from "@/components/device-dashboard"
import { ExerciseSection } from "@/components/exercise-section"
import { IndianDietPlans } from "@/components/indian-diet-plans"
import { HealthTracking } from "@/components/health-tracking"
import { DataVisualization } from "@/components/data-visualization"
import { Footer } from "@/components/footer"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-pink-600 font-medium">Loading SAKHI...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      {/* HOME section */}
      <section id="home" className="scroll-mt-24">
        <InteractiveHero />
      </section>
      <DeviceDashboard />
      <ExerciseSection />
      <IndianDietPlans />
      <HealthTracking />
      <DataVisualization />
      <Footer />
    </main>
  )
}
