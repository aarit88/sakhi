import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seedAyurveda() {
  console.log("Seeding AyurvedicKnowledgeEntry...")

  const entries = [
    {
      title: "Vata-type Menstrual Discomfort",
      condition: "Menstrual Cramps",
      dosha: "Vata",
      cyclePhase: "Menstrual",
      symptoms: "cramps, pain, bloating, lower back pain, anxiety",
      traditionalExplanation: "In Ayurveda, menstrual flow is governed by Apana Vata (the downward-moving energy). When Vata is aggravated by stress, cold, or irregular habits, it can cause spasmodic pain, stiffness, and irregular flow.",
      lifestyleGuidance: JSON.stringify([
        "Keep the lower abdomen warm with a heating pad or warm sesame oil massage.",
        "Drink warm ginger or cumin tea to support healthy circulation.",
        "Practice gentle, restorative yoga poses like Balasana (Child's Pose).",
        "Avoid cold, raw, or heavily processed foods during this time."
      ]),
      pathya: JSON.stringify(["Warm cooked meals", "Sesame oil", "Ginger", "Cumin", "Adequate rest"]),
      apathya: JSON.stringify(["Cold drinks", "Raw salads", "Excessive exercise", "Staying up late"]),
      contraindications: JSON.stringify(["If pain is severe or accompanied by fever, consult a doctor immediately.", "Do not use heating pads if experiencing heavy bleeding (Pitta imbalance)."]),
      safetyFlags: JSON.stringify(["fever", "severe pain", "heavy bleeding"])
    },
    {
      title: "Pitta-type Patterns",
      condition: "Heavy Flow & Irritability",
      dosha: "Pitta",
      cyclePhase: "Menstrual",
      symptoms: "heavy bleeding, heat, irritability, acne, breast tenderness",
      traditionalExplanation: "Pitta dosha governs heat and metabolism. An excess of Pitta can manifest as heavy menstrual flow, feelings of excess heat, and emotional irritability during the cycle.",
      lifestyleGuidance: JSON.stringify([
        "Favour cooling, hydrating foods like cucumber, coconut water, and sweet fruits.",
        "Avoid spicy, sour, and excessively salty foods.",
        "Engage in calming activities like meditation or walking in nature.",
        "Drink coriander or fennel tea to help soothe internal heat."
      ]),
      pathya: JSON.stringify(["Coconut water", "Fennel", "Coriander", "Cooling herbs", "Relaxation"]),
      apathya: JSON.stringify(["Spicy foods", "Caffeine", "Alcohol", "Excessive sun exposure"]),
      contraindications: JSON.stringify(["If bleeding is unusually heavy or lasts longer than 7 days, seek medical evaluation."]),
      safetyFlags: JSON.stringify(["excessive bleeding", "fainting", "dizziness"])
    },
    {
      title: "Kapha-type Patterns",
      condition: "Lethargy & Bloating",
      dosha: "Kapha",
      cyclePhase: "Menstrual",
      symptoms: "lethargy, water retention, bloating, heaviness, dull pain",
      traditionalExplanation: "Kapha dosha is characterized by earth and water elements. When out of balance, it can cause sluggishness, fluid retention, and a feeling of heaviness during the menstrual cycle.",
      lifestyleGuidance: JSON.stringify([
        "Incorporate warming spices like black pepper, ginger, and cinnamon into your meals.",
        "Engage in light, stimulating exercise like brisk walking or dynamic yoga (avoiding inversions).",
        "Prefer warm, light, and easily digestible foods over heavy, oily meals.",
        "Avoid sleeping during the daytime to prevent increased sluggishness."
      ]),
      pathya: JSON.stringify(["Ginger", "Black pepper", "Warm water", "Light grains", "Active movement"]),
      apathya: JSON.stringify(["Dairy products", "Cold foods", "Daytime sleep", "Heavy sweets"]),
      contraindications: JSON.stringify(["Ensure persistent bloating is not due to an underlying medical condition."]),
      safetyFlags: JSON.stringify(["sudden weight gain", "severe abdominal pain"])
    }
  ]

  for (const entry of entries) {
    const existing = await prisma.ayurvedicKnowledgeEntry.findFirst({
      where: { title: entry.title }
    })
    
    if (!existing) {
      await prisma.ayurvedicKnowledgeEntry.create({
        data: entry
      })
      console.log(`Created entry: ${entry.title}`)
    } else {
      console.log(`Entry already exists: ${entry.title}`)
    }
  }

  console.log("Seeding complete.")
}

seedAyurveda()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
