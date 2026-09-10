import { PrismaClient } from "@prisma/client"
import { getAyurvedicWellnessInsights } from "./ayurvedicTools"
import { computeCycleInfo } from "../../../utils/cycleUtils"

const prisma = new PrismaClient()

/**
 * Retrieves the user's recent health data explicitly scoped by userId.
 * This ensures the LLM never queries the database directly and only receives authorized data.
 */
export async function buildUserContext(userId: string): Promise<string> {
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)
  const dateFilter = { gte: lastWeek }

  const [symptoms, periods, moods, sleeps, recentReport] = await Promise.all([
    prisma.symptomLog.findMany({ 
      where: { userId, date: dateFilter }, 
      orderBy: { date: "desc" },
      take: 5
    }),
    prisma.periodLog.findMany({ 
      where: { userId }, 
      orderBy: { startDate: "desc" }, 
      take: 1 
    }),
    prisma.moodLog.findMany({
      where: { userId, date: dateFilter },
      orderBy: { date: "desc" },
      take: 3
    }),
    prisma.sleepLog.findMany({
      where: { userId, date: dateFilter },
      orderBy: { date: "desc" },
      take: 3
    }),
    prisma.medicalReport.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" }
    })
  ])

  let contextString = "USER CONTEXT:\n"
  
  if (symptoms.length > 0) {
    contextString += "Recent symptoms logged by user:\n"
    symptoms.forEach(s => {
      contextString += `- ${s.date.toISOString().split('T')[0]}: ${s.type} (Severity: ${s.severity})\n`
    })
  } else {
    contextString += "No recent symptoms logged.\n"
  }

  // Use canonical cycle utility (same calculation as dashboard)
  const cycleData = computeCycleInfo(periods.map((p) => p.startDate))
  const cyclePhaseStr = cycleData.phase

  if (periods.length > 0) {
    contextString += `Current menstrual cycle day: ${cycleData.day}\n`
    contextString += `Estimated cycle phase: ${cyclePhaseStr}\n`
  }

  if (moods.length > 0) {
    contextString += "Recent Moods:\n"
    moods.forEach(m => contextString += `- ${m.score}/10: ${m.notes || ""}\n`)
  }

  if (sleeps.length > 0) {
    contextString += "Recent Sleep:\n"
    sleeps.forEach(s => contextString += `- ${s.hours} hours (Quality: ${s.quality}/10)\n`)
  }

  if (recentReport) {
    contextString += "\nLatest Medical Report:\n"
    contextString += `Date: ${recentReport.createdAt.toISOString().split('T')[0]}\n`
    try {
      const parsedData = JSON.parse(recentReport.extractedData || "{}")
      if (parsedData.markers && parsedData.markers.length > 0) {
        contextString += "Extracted Markers:\n"
        parsedData.markers.forEach((m: any) => {
          contextString += `- ${m.label}: ${m.value} ${m.unit} (Status: ${m.status})\n`
        })
      }
      if (parsedData.alerts && parsedData.alerts.length > 0) {
        contextString += "Alerts:\n"
        parsedData.alerts.forEach((a: any) => {
          contextString += `- ${a.severity.toUpperCase()}: ${a.title}\n`
        })
      }
    } catch (e) {
      // JSON parse error, ignore
    }
  }

  // Fetch Traditional Knowledge
  const symptomNames = symptoms.map(s => s.type)
  const traditionalInsights = await getAyurvedicWellnessInsights(symptomNames, cyclePhaseStr)
  
  contextString += `\n${traditionalInsights}\n`

  return contextString
}
