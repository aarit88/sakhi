import { Router, type Request, type Response } from "express"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

// Validation schema
const periodLogSchema = z.object({
  userId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  flowIntensity: z.enum(["light", "moderate", "heavy"]).optional(),
  symptoms: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

// Log period
router.post("/log", async (req: Request, res: Response) => {
  try {
    const data = periodLogSchema.parse(req.body)

    const periodLog = await prisma.periodLog.create({
      data: {
        userId: data.userId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        flowIntensity: data.flowIntensity,
        symptoms: data.symptoms,
        notes: data.notes,
      },
    })

    res.status(201).json(periodLog)
  } catch (error) {
    res.status(400).json({ error: "Failed to log period" })
  }
})

// Get period history
router.get("/history/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { limit = 12 } = req.query

    const history = await prisma.periodLog.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
      take: Number.parseInt(limit as string),
    })

    res.json(history)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch period history" })
  }
})

// Get cycle prediction
router.get("/prediction/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const logs = await prisma.periodLog.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
      take: 3,
    })

    if (logs.length < 2) {
      return res.json({ prediction: null, message: "Not enough data for prediction" })
    }

    // Simple cycle prediction based on average cycle length
    const cycleLengths = []
    for (let i = 0; i < logs.length - 1; i++) {
      const diff = Math.floor((logs[i].startDate.getTime() - logs[i + 1].startDate.getTime()) / (1000 * 60 * 60 * 24))
      cycleLengths.push(diff)
    }

    const avgCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b) / cycleLengths.length)
    const nextPeriodDate = new Date(logs[0].startDate)
    nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength)

    res.json({
      averageCycleLength: avgCycleLength,
      nextPeriodDate,
      daysUntilNextPeriod: Math.ceil((nextPeriodDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate prediction" })
  }
})

// Update period log
router.put("/:logId", async (req: Request, res: Response) => {
  try {
    const { logId } = req.params
    const data = periodLogSchema.partial().parse(req.body)

    const updated = await prisma.periodLog.update({
      where: { id: logId },
      data,
    })

    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: "Failed to update period log" })
  }
})

// Delete period log
router.delete("/:logId", async (req: Request, res: Response) => {
  try {
    const { logId } = req.params

    await prisma.periodLog.delete({
      where: { id: logId },
    })

    res.json({ message: "Period log deleted" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete period log" })
  }
})

export default router
