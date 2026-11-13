import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Retrieves relevant Ayurvedic knowledge entries based on keywords (e.g. cycle phase, symptoms).
 * This acts as a safe, isolated retrieval engine for traditional wisdom.
 */
export async function getAyurvedicWellnessInsights(symptoms: string[], cyclePhase?: string): Promise<string> {
  // To prevent loading the entire DB, we'll fetch active records and filter by keyword overlap.
  const entries = await prisma.ayurvedicKnowledgeEntry.findMany({
    where: { active: true }
  })

  const matchedEntries = entries.filter(entry => {
    let match = false
    if (cyclePhase && entry.cyclePhase && entry.cyclePhase.toLowerCase() === cyclePhase.toLowerCase()) {
      match = true
    }
    const entrySymptoms = entry.symptoms?.toLowerCase() || ""
    const entryCondition = entry.condition?.toLowerCase() || ""
    
    for (const symptom of symptoms) {
      if (entrySymptoms.includes(symptom.toLowerCase()) || entryCondition.includes(symptom.toLowerCase())) {
        match = true
      }
    }
    
    // Always provide general menstrual insights if relevant
    if (entry.title.toLowerCase().includes("menstrual") && cyclePhase?.toLowerCase() === "menstrual") {
        match = true
    }
    
    return match
  })

  if (matchedEntries.length === 0) {
    return "No specific traditional lifestyle guidance retrieved for these symptoms."
  }

  let insights = "APPROVED TRADITIONAL LIFESTYLE GUIDANCE:\n"
  matchedEntries.slice(0, 3).forEach(entry => {
    insights += `\n- Topic: ${entry.title}`
    insights += `\n  Condition/Dosha: ${entry.condition} (${entry.dosha})`
    insights += `\n  Explanation: ${entry.traditionalExplanation}`
    try {
      const tips = JSON.parse(entry.lifestyleGuidance) as string[]
      insights += `\n  Suggestions: ${tips.join("; ")}`
    } catch (e) {
        insights += `\n  Suggestions: ${entry.lifestyleGuidance}`
    }
    insights += `\n  Safety Note: ${entry.contraindications ? JSON.parse(entry.contraindications).join(" ") : ""}\n`
  })

  return insights
}
