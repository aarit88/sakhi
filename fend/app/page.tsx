import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { InteractiveHero } from "@/components/interactive-hero"
import DeviceDashboard from "@/components/device-dashboard"
import { ExerciseSection } from "@/components/exercise-section"
import { IndianDietPlans } from "@/components/indian-diet-plans"
import { HealthTracking } from "@/components/health-tracking"
import { DataVisualization } from "@/components/data-visualization"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
       {/* 👇 This is now the HOME section */}
      <section id="home" className="scroll-mt-24">
        <InteractiveHero />
      </section>
      <DeviceDashboard />
      <ExerciseSection />
      <IndianDietPlans />
      <HealthTracking />
      <DataVisualization />
      <Footer />

      {/* 👇 Floating Anonymous Chat Launcher (bottom-right) */}
      <Link
        href="/chatbot" // TODO: change this to your actual chatbot route if different
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open anonymous Sakhi chat"
      >
        <div className="relative">
          {/* Glow effect on hover */}
          <div className="absolute -inset-2 rounded-full bg-pink-400/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Cartoon cat icon */}
          <img
            src="/sakhi-chat-cat.png" // make sure this file exists in /public
            alt="Sakhi anonymous chat"
            className="w-20 h-20 rounded-full shadow-xl border-2 border-pink-300 cursor-pointer
                       bg-white transition-transform duration-200
                       group-hover:scale-110 group-active:scale-95"
          />
        </div>
        
      </Link>
      {/* ☝️ End of floating chat launcher */}
    </main>
  )
}
