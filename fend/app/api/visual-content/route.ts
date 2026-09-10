import { NextRequest, NextResponse } from "next/server"

interface VisualContent {
  id: string
  category: string
  language: string
  title: string
  description?: string
  imageUrl: string
  orderIndex: number
}

const visualGuides: VisualContent[] = [
  {
    id: "guide-1",
    category: "cycle",
    language: "en",
    title: "Understanding Your Menstrual Phase",
    description: "Days 1-5: The uterine lining sheds as estrogen and progesterone dip. Rest, replenish iron, and prioritize warm liquids.",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    orderIndex: 0
  },
  {
    id: "guide-2",
    category: "cycle",
    language: "en",
    title: "The Follicular Awakening",
    description: "Days 6-13: Rising FSH and estrogen boost energy, focus, and stamina. Great time for strength workouts and creative projects.",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    orderIndex: 1
  },
  {
    id: "guide-3",
    category: "cycle",
    language: "en",
    title: "Ovulation Power Peak",
    description: "Days 14-16: LH surge triggers release of the egg. Peak vitality, radiant skin, and highest metabolic output.",
    imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    orderIndex: 2
  },
  {
    id: "guide-4",
    category: "cycle",
    language: "en",
    title: "Luteal Nurturing & PMS Shield",
    description: "Days 17-28: Progesterone rises then drops. Focus on magnesium-rich foods, restorative yoga, and adequate sleep.",
    imageUrl: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
    orderIndex: 3
  },
  // Hindi guides
  {
    id: "guide-hi-1",
    category: "cycle",
    language: "hi",
    title: "मासिक धर्म चरण को समझें",
    description: "दिन 1-5: गर्भाशय की परत अलग होती है। पर्याप्त आराम करें, गर्म तरल पदार्थ लें और पौष्टिक आहार अपनाएं।",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    orderIndex: 0
  },
  {
    id: "guide-hi-2",
    category: "cycle",
    language: "hi",
    title: "फॉलिक्युलर चरण में ऊर्जा",
    description: "दिन 6-13: एस्ट्रोजन के बढ़ने से शरीर में ऊर्जा और स्फूर्ति आती है। व्यायाम और नए कार्यों के लिए अनुकूल समय।",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    orderIndex: 1
  }
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const language = searchParams.get("language") || "en"

  let filtered = visualGuides.filter((g) => g.language === language)
  if (filtered.length === 0) {
    // Fallback to English
    filtered = visualGuides.filter((g) => g.language === "en")
  }

  if (category) {
    const categoryMatches = filtered.filter((g) => g.category.toLowerCase() === category.toLowerCase())
    if (categoryMatches.length > 0) {
      filtered = categoryMatches
    }
  }

  return NextResponse.json({
    success: true,
    data: filtered.sort((a, b) => a.orderIndex - b.orderIndex)
  })
}
