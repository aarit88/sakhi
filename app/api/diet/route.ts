import { NextResponse } from "next/server"

// Mock diet plan data
const dietPlans = [
  {
    id: "vata-balance",
    name: "Vata Balancing Diet",
    dosha: "vata",
    duration: 7,
    active: false,
    meals: {
      breakfast: [{ name: "Warm Oats with Ghee & Dates", calories: 320, time: "7:00 AM" }],
      lunch: [{ name: "Khichdi with Vegetables", calories: 450, time: "12:30 PM" }],
      dinner: [{ name: "Moong Dal Soup", calories: 280, time: "7:00 PM" }],
    },
  },
  {
    id: "menstrual-phase",
    name: "Menstrual Phase Nutrition",
    phase: "menstrual",
    duration: 5,
    active: false,
    meals: {
      breakfast: [{ name: "Date & Almond Porridge", calories: 350, time: "7:00 AM" }],
      lunch: [{ name: "Spinach Dal with Ghee", calories: 480, time: "12:30 PM" }],
      dinner: [{ name: "Sesame Laddu (2 pieces)", calories: 320, time: "7:00 PM" }],
    },
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: dietPlans,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch diet plans" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { planId, action } = body

    if (action === "activate") {
      // Deactivate all plans first
      dietPlans.forEach((plan) => (plan.active = false))

      // Activate selected plan
      const plan = dietPlans.find((p) => p.id === planId)
      if (plan) {
        plan.active = true
      }

      return NextResponse.json({
        success: true,
        message: "Diet plan activated successfully",
        data: { planId, active: true },
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update diet plan" }, { status: 500 })
  }
}
