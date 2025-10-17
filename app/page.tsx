import { Navigation } from "@/components/navigation"
import { InteractiveHero } from "@/components/interactive-hero"
import DeviceDashboard from "@/components/device-dashboard" // CHANGED TO DEFAULT IMPORT
import { ExerciseSection } from "@/components/exercise-section"
import { IndianDietPlans } from "@/components/indian-diet-plans"
import { HealthTracking } from "@/components/health-tracking"
import { DataVisualization } from "@/components/data-visualization"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <InteractiveHero />
      <DeviceDashboard />
      <ExerciseSection />
      <IndianDietPlans />
      <HealthTracking />
      <DataVisualization />
      <Footer />
    </main>
  )
}
