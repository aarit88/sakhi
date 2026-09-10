import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Seed data for VisualContent.
 *
 * Uses publicly accessible educational health illustration URLs.
 * Content is educational/wellness-oriented only.
 * No medical diagnosis or treatment claims are made.
 *
 * Idempotent: checks for existing entries by (category + language + orderIndex)
 * before inserting.
 */
const contentItems = [
  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY: menstrual-health (English)
  // ──────────────────────────────────────────────────────────────────────────
  {
    category: "menstrual-health",
    language: "en",
    title: "Understanding Your Menstrual Cycle",
    description:
      "The menstrual cycle is a natural monthly process. Phase 1 (Days 1–5): Menstruation — the uterine lining sheds, bringing your period. Rest well and stay warm.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Estradiol_and_progesterone_during_menstrual_cycle.svg/640px-Estradiol_and_progesterone_during_menstrual_cycle.svg.png",
    orderIndex: 1,
  },
  {
    category: "menstrual-health",
    language: "en",
    title: "Follicular Phase — Energy Rising",
    description:
      "Phase 2 (Days 6–13): Your body prepares to release an egg. Estrogen rises, energy increases. Great time for light exercise, creative work, and nutritious meals.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Figure_28_02_07.jpg/640px-Figure_28_02_07.jpg",
    orderIndex: 2,
  },
  {
    category: "menstrual-health",
    language: "en",
    title: "Ovulation — Peak Energy",
    description:
      "Phase 3 (Days 14–16, estimated): An egg is released. You may feel at your most energetic. Stay hydrated and nourish yourself with iron-rich foods.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Ovulation_cycle.svg/640px-Ovulation_cycle.svg.png",
    orderIndex: 3,
  },
  {
    category: "menstrual-health",
    language: "en",
    title: "Luteal Phase — Rest & Prepare",
    description:
      "Phase 4 (Days 17–28, estimated): Progesterone rises. You may notice PMS symptoms like bloating, fatigue, or mood changes. Prioritise rest, warm foods, and gentle movement.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Gray1169.png/640px-Gray1169.png",
    orderIndex: 4,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY: menstrual-health (Hindi / हिन्दी)
  // ──────────────────────────────────────────────────────────────────────────
  {
    category: "menstrual-health",
    language: "hi",
    title: "मासिक धर्म चक्र को समझें",
    description:
      "मासिक धर्म चक्र एक प्राकृतिक मासिक प्रक्रिया है। चरण 1 (दिन 1–5): मासिक धर्म — गर्भाशय की परत झड़ती है। आराम करें और शरीर को गर्म रखें।",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Estradiol_and_progesterone_during_menstrual_cycle.svg/640px-Estradiol_and_progesterone_during_menstrual_cycle.svg.png",
    orderIndex: 1,
  },
  {
    category: "menstrual-health",
    language: "hi",
    title: "फॉलिकुलर चरण — ऊर्जा बढ़ती है",
    description:
      "चरण 2 (दिन 6–13): शरीर अंडाणु छोड़ने की तैयारी करता है। एस्ट्रोजन बढ़ता है, ऊर्जा बढ़ती है। हल्के व्यायाम और पोषक भोजन का अच्छा समय।",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Figure_28_02_07.jpg/640px-Figure_28_02_07.jpg",
    orderIndex: 2,
  },
  {
    category: "menstrual-health",
    language: "hi",
    title: "ओव्यूलेशन — सर्वोच्च ऊर्जा",
    description:
      "चरण 3 (अनुमानित दिन 14–16): अंडाणु जारी होता है। आप सबसे अधिक ऊर्जावान महसूस कर सकती हैं। पानी पीएं और आयरन युक्त भोजन खाएं।",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Ovulation_cycle.svg/640px-Ovulation_cycle.svg.png",
    orderIndex: 3,
  },
  {
    category: "menstrual-health",
    language: "hi",
    title: "ल्यूटियल चरण — आराम और तैयारी",
    description:
      "चरण 4 (अनुमानित दिन 17–28): प्रोजेस्टेरोन बढ़ता है। सूजन, थकान या मूड में बदलाव हो सकता है। आराम करें, गर्म खाना खाएं और हल्का व्यायाम करें।",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Gray1169.png/640px-Gray1169.png",
    orderIndex: 4,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY: sleep-wellness (English)
  // ──────────────────────────────────────────────────────────────────────────
  {
    category: "sleep-wellness",
    language: "en",
    title: "Why Sleep Matters for Women's Health",
    description:
      "Adults need 7–9 hours of sleep per night. Sleep helps regulate hormones, supports immunity, improves mood, and reduces cycle-related symptoms. Aim for a consistent bedtime.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Sleep_stages.jpg/640px-Sleep_stages.jpg",
    orderIndex: 1,
  },
  {
    category: "sleep-wellness",
    language: "en",
    title: "Tips for Better Sleep",
    description:
      "Keep your bedroom cool and dark. Avoid screens 1 hour before bed. Limit caffeine after 2 PM. A warm herbal tea (chamomile or ginger) can help you unwind.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Sleep_hygiene_tips.jpg/640px-Sleep_hygiene_tips.jpg",
    orderIndex: 2,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY: nutrition-wellness (English)
  // ──────────────────────────────────────────────────────────────────────────
  {
    category: "nutrition-wellness",
    language: "en",
    title: "Iron-Rich Foods for Women",
    description:
      "Women need more iron due to monthly blood loss. Eat iron-rich foods: spinach, lentils (dal), chickpeas, eggs, and lean meat. Pair with vitamin C (like lemon) for better absorption.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Dietary_Sources_of_Iron.jpg/640px-Dietary_Sources_of_Iron.jpg",
    orderIndex: 1,
  },
  {
    category: "nutrition-wellness",
    language: "en",
    title: "Staying Hydrated",
    description:
      "Aim for 2–3 litres of water daily. Proper hydration reduces bloating, headaches, and fatigue. Carry a water bottle and sip regularly through the day.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/640px-PNG_transparency_demonstration_1.png",
    orderIndex: 2,
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CATEGORY: ayurveda-wellness (English)
  // ──────────────────────────────────────────────────────────────────────────
  {
    category: "ayurveda-wellness",
    language: "en",
    title: "Ayurvedic Comfort During Menstruation",
    description:
      "According to Ayurveda, menstrual flow is governed by Apana Vata. During this phase: keep yourself warm, drink ginger or cumin tea, eat light cooked meals, and rest well.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Ayurveda_3_body_types.jpg/640px-Ayurveda_3_body_types.jpg",
    orderIndex: 1,
  },
  {
    category: "ayurveda-wellness",
    language: "en",
    title: "Abhyanga — Self-Massage with Warm Oil",
    description:
      "Abhyanga is the Ayurvedic practice of self-massage using warm sesame oil. It can reduce Vata-related cramps, calm the nervous system, and improve circulation. Always consult your doctor for severe symptoms.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ayurvedic_oil_massage.jpg/640px-Ayurvedic_oil_massage.jpg",
    orderIndex: 2,
  },
]

async function seedVisualContent() {
  console.log("Seeding VisualContent table...")

  let created = 0
  let skipped = 0

  for (const item of contentItems) {
    // Idempotency: check by category + language + orderIndex
    const existing = await prisma.visualContent.findFirst({
      where: {
        category: item.category,
        language: item.language,
        orderIndex: item.orderIndex,
      },
    })

    if (existing) {
      console.log(
        `  [skip] Already exists: [${item.language}] ${item.category} #${item.orderIndex} — "${item.title}"`
      )
      skipped++
      continue
    }

    await prisma.visualContent.create({
      data: {
        ...item,
        active: true,
      },
    })
    console.log(
      `  [created] [${item.language}] ${item.category} #${item.orderIndex} — "${item.title}"`
    )
    created++
  }

  console.log(`\nSeeding complete. Created: ${created}, Skipped (already exist): ${skipped}`)
}

seedVisualContent()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
