"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function SubscriptionPage() {
  const router = useRouter()

  const plans = [
    {
      name: "Basic",
      price: "₹99 / month",
      features: [
        "Cycle tracking",
        "Symptom logging",
        "Basic health insights",
        "Community access"
      ],
      highlight: false
    },
    {
      name: "Premium",
      price: "₹199 / month",
      features: [
        "Everything in Basic",
        "AI-powered health predictions",
        "Sleep & mood analytics",
        "Device integration",
        "Priority support"
      ],
      highlight: true
    },
    {
      name: "Elite",
      price: "₹299 / month",
      features: [
        "Everything in Premium",
        "Personalized wellness plans",
        "Ayurvedic recommendations",
        "Advanced IoT insights",
        "Exclusive community spaces",
      ],
      highlight: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white p-8">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          Choose Your <span className="text-pink-500">Sakhi Plan</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Unlock personalized women's wellness with AI, Ayurveda & IoT tracking.
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-3xl shadow-xl p-6 border backdrop-blur-xl transition hover:scale-105 ${
                plan.highlight
                  ? "border-pink-300 bg-white/80"
                  : "border-gray-200 bg-white/60"
              }`}
            >
              <h2 className="text-2xl font-semibold text-pink-600">{plan.name}</h2>
              <p className="text-3xl font-bold text-gray-800 mt-3 mb-6">{plan.price}</p>

              <ul className="space-y-3 text-gray-700">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="text-pink-500">✔</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => router.push(`/subscription/checkout?plan=${plan.name}`)}
                className="w-full mt-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md hover:shadow-lg hover:from-pink-600 hover:to-rose-600"
              >
                Choose {plan.name}
              </Button>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-10 text-pink-600 underline hover:text-pink-800"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}
