"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Navigation } from "@/components/navigation"
import { InteractiveHero } from "@/components/interactive-hero"
import DeviceDashboard from "@/components/device-dashboard"
import { ExerciseSection } from "@/components/exercise-section"
import { IndianDietPlans } from "@/components/indian-diet-plans"
import { HealthTracking } from "@/components/health-tracking"
import { DataVisualization } from "@/components/data-visualization"
import { Footer } from "@/components/footer"
import {
  Activity,
  ArrowRight,
  Box,
  CalendarCheck2,
  FileText,
  Leaf,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react"

const MODULE_CARDS = [
  {
    href: "/body-map",
    title: "3D Interactive Body Map",
    desc: "Pin localized symptoms, severity, and triggers on an anatomical 3D model.",
    icon: Box,
    accent: "text-rose-600 bg-rose-50 border-rose-200",
  },
  {
    href: "/clinical-reports",
    title: "Medical Reports & OCR",
    desc: "Upload lab PDFs or images for AI-assisted extraction, 22-marker parsing & trend comparison.",
    icon: FileText,
    accent: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  {
    href: "/ayurveda",
    title: "Ayurveda & Evidence Guide",
    desc: "Dosha-aware Pathya/Apathya nutrition clearly separated by clinical evidence tier.",
    icon: Leaf,
    accent: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    href: "/anonymous-chat",
    title: "Anonymous Support Chat",
    desc: "Strictly isolated, no-login Q&A with instant red-flag emergency triage.",
    icon: MessageCircle,
    accent: "text-teal-600 bg-teal-50 border-teal-200",
  },
  {
    href: "/community",
    title: "Peer Community Circles",
    desc: "Pseudonymized support forums for menstrual health, PCOS, mental wellness & nutrition.",
    icon: Users,
    accent: "text-pink-600 bg-pink-50 border-pink-200",
  },
  {
    href: "/care-finder",
    title: "Care Finder (Google Maps)",
    desc: "Find nearby gynecologists, hospitals, clinics, 24/7 emergency care & diagnostic labs.",
    icon: MapPin,
    accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    href: "/doctor-portal",
    title: "Doctor Portal & Audit Log",
    desc: "Generate time-limited, revocable consultation links with AI pre-visit clinical briefs.",
    icon: Stethoscope,
    accent: "text-violet-600 bg-violet-50 border-violet-200",
  },
  {
    href: "/workspace",
    title: "Gmail, Calendar & Tasks",
    desc: "Sync doctor visits, health reminders, and care emails with Google Workspace.",
    icon: CalendarCheck2,
    accent: "text-sky-600 bg-sky-50 border-sky-200",
  },
]

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <main className="min-h-screen">
      <Navigation />

      {!isLoading && !isAuthenticated && (
        <section className="border-b border-rose-100 bg-gradient-to-r from-rose-50 via-white to-teal-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1.5 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  SAKHI Women&apos;s Health Platform · Modules 1–12 Active
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Your Holistic Menstrual, Clinical & Wellness Companion
                </h1>
                <p className="text-sm text-slate-600">
                  Sign in for personalized cycle predictions and synced dashboards, or jump directly into any module below.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
                >
                  Sign In / Google Sign-In
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Create Account
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {MODULE_CARDS.map((mod) => {
                const Icon = mod.icon
                return (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-rose-300 hover:shadow-md"
                  >
                    <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${mod.accent} mb-2.5`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="text-sm font-semibold text-slate-900 group-hover:text-rose-700 flex items-center justify-between">
                      {mod.title}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{mod.desc}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {isAuthenticated && (
        <div className="border-b border-emerald-100 bg-emerald-50/60 px-4 py-2 text-xs text-emerald-900">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Activity className="h-3.5 w-3.5 text-emerald-700" />
              Signed-in personalized dashboard active — cycle, symptom, 3D body-map & lab data synced to Cloud SQL.
            </span>
            <Link href="/workspace" className="font-semibold text-emerald-800 underline hover:text-emerald-950">
              Open Gmail, Calendar & Tasks Hub →
            </Link>
          </div>
        </div>
      )}

      {/* HOME section */}
      <section id="home" className="scroll-mt-24">
        <InteractiveHero />
      </section>
      <DeviceDashboard />
      <ExerciseSection />
      <IndianDietPlans />
      {isAuthenticated && (
        <>
          <HealthTracking />
          <DataVisualization />
        </>
      )}
      <Footer />
    </main>
  )
}
