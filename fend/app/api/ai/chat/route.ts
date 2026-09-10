import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const message: string = (body.message || "").trim().toLowerCase()
    const conversationId: string = body.conversationId || `conv-${Date.now()}`

    // 1. Safety & Emergency red flags check
    const isEmergency = /suicid|self[-\s]?harm|kill myself|chest pain|can't breathe|cannot breathe|faint|unconscious|heavy bleeding|soak.*pad|severe.*pain/i.test(message)
    if (isEmergency) {
      return NextResponse.json({
        success: true,
        data: {
          message: "⚠️ Urgent Medical Warning: The symptoms you described require prompt medical evaluation. Please contact emergency services (112 or local emergency room) immediately.",
          urgent: true,
          sections: [
            {
              title: "Emergency Recommendations",
              content: "Do not wait. If you are experiencing heavy bleeding, severe abdominal pain, chest pain, or breathing difficulty, seek urgent medical care right away."
            }
          ],
          traditionalGuidance: {
            enabled: false,
            disclaimer: "Traditional remedies must not be used during acute medical emergencies.",
            suggestions: []
          },
          conversationId
        }
      })
    }

    // 2. Specialized Health Categorization
    let replyText = ""
    let sections: { title: string; content: string }[] = []
    let suggestions: string[] = []

    if (/cramp|period|cycle|flow|pms|bleed|pcos/i.test(message)) {
      replyText = "Menstrual cramps (dysmenorrhea) often result from prostaglandin contractions in the uterine muscles. Here is how you can support your body right now:"
      sections = [
        {
          title: "Immediate Comfort Measures",
          content: "Apply a warm heating pad across your lower abdomen or lower back. Gentle pelvic tilts, child's pose, and light walking encourage pelvic blood circulation."
        },
        {
          title: "Hydration & Mineral Balance",
          content: "Ensure adequate magnesium and potassium through warm herbal teas, banana, or soaked pumpkin seeds to help relax smooth muscle tissues."
        }
      ]
      suggestions = [
        "Warm ginger & ajwain tea to ease uterine spasms",
        "Abhyanga: gentle sesame oil massage on lower abdomen",
        "Avoid cold, processed, or excessively spicy foods during flow"
      ]
    } else if (/diet|food|eat|nutrition|iron|protein|weight/i.test(message)) {
      replyText = "Balanced hormonal nutrition relies on steady blood sugar levels, bioavailable micronutrients, and gut health:"
      sections = [
        {
          title: "Hormone-Balancing Plate",
          content: "Focus on complex grains (millets, oats, brown rice), leafy greens for folate & iron, and quality proteins (sprouts, lentils, paneer, eggs)."
        },
        {
          title: "Micronutrient Synergy",
          content: "Pair non-heme plant iron (spinach, beetroot) with Vitamin C (lemon juice, amla) for enhanced absorption. Keep caffeine 1 hour away from main meals."
        }
      ]
      suggestions = [
        "Amla (Indian gooseberry) juice in the morning for vitamin C",
        "Soaked fenugreek (methi) seeds for insulin sensitivity",
        "Warm golden turmeric milk with a pinch of black pepper before bedtime"
      ]
    } else if (/stress|anxiety|sleep|insomnia|tired|fatigue/i.test(message)) {
      replyText = "Chronic fatigue and stress disrupt the hypothalamic-pituitary-adrenal (HPA) axis, directly impacting progesterone and cycle regularity:"
      sections = [
        {
          title: "Nervous System Reset",
          content: "Practice 4-7-8 breathing: Inhale quietly for 4 seconds, hold for 7 seconds, exhale completely through the mouth for 8 seconds. Repeat 4 cycles."
        },
        {
          title: "Sleep Architecture",
          content: "Keep screens away 45 minutes before sleep. A consistent circadian rhythm stabilizes melatonin and cortisol curves."
        }
      ]
      suggestions = [
        "Ashwagandha or Brahmi under Ayurvedic guidance for cortisol regulation",
        "Chamomile or lavender infusion before bed",
        "Foot massage (Padabhyanga) with warm ghee or sesame oil to calm Vata dosha"
      ]
    } else {
      replyText = "I'm Sakhi, your companion for women's holistic wellness. I can help guide you through menstrual cycle stages, nutrition tips, symptom logging, or understanding blood test markers."
      sections = [
        {
          title: "Personalized Support Areas",
          content: "You can ask about symptom relief, Ayurvedic daily routines (Dinacharya), menstrual phase planning, or clinical test interpretation."
        }
      ]
      suggestions = [
        "Warm cumin-coriander-fennel (CCF) water for digestion and hormonal detox",
        "Daily 15-minute sunlight exposure for Vitamin D and serotonin balance",
        "Regular cycle tracking in your SAKHI dashboard"
      ]
    }

    return NextResponse.json({
      success: true,
      data: {
        message: replyText,
        urgent: false,
        sections,
        traditionalGuidance: {
          enabled: true,
          disclaimer: "Ayurvedic recommendations are complementary lifestyle practices and do not replace certified medical treatments.",
          suggestions
        },
        conversationId
      }
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "AI response failed" }, { status: 500 })
  }
}
