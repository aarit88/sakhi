import { Router } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

const periodLogSchema = z.object({
  userId: z.string().cuid(),
  startDate: z.string().datetime().or(z.string()), // frontend may send ISO string
  endDate: z.string().datetime().or(z.string()).optional(),
  flowIntensity: z.string().optional(),
  symptoms: z.string().optional(),
  notes: z.string().optional()
})

// POST /api/period-tracking/log
router.post("/log", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = periodLogSchema.parse(req.body)

    if (req.user?.role !== "ADMIN" && req.user?.userId !== data.userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const log = await prisma.periodLog.create({
      data: {
        userId: data.userId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        flowIntensity: data.flowIntensity,
        symptoms: data.symptoms,
        notes: data.notes
      }
    })

    res.status(201).json(log)
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid data", errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// GET /api/period-tracking/history/:userId
router.get("/history/:userId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params

    if (req.user?.role !== "ADMIN" && req.user?.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const logs = await prisma.periodLog.findMany({
      where: { userId },
      orderBy: { startDate: "desc" }
    })

    res.json(logs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Simple prediction: average cycle length
// GET /api/period-tracking/prediction/:userId
router.get("/prediction/:userId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params

    if (req.user?.role !== "ADMIN" && req.user?.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const logs = await prisma.periodLog.findMany({
      where: { userId },
      orderBy: { startDate: "asc" }
    })

    if (logs.length < 2) {
      return res.json({ message: "Not enough data to predict" })
    }

    let totalCycleDays = 0
    let count = 0
    for (let i = 1; i < logs.length; i++) {
      const prev = logs[i - 1]
      const curr = logs[i]
      const diffMs = curr.startDate.getTime() - prev.startDate.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      totalCycleDays += diffDays
      count++
    }

    const avgCycleLength = Math.round(totalCycleDays / count)
    const lastLog = logs[logs.length - 1]
    const predictedNext = new Date(lastLog.startDate)
    predictedNext.setDate(predictedNext.getDate() + avgCycleLength)

    res.json({
      averageCycleLengthDays: avgCycleLength,
      lastPeriodStart: lastLog.startDate,
      predictedNextPeriod: predictedNext
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// PUT /api/period-tracking/:logId
router.put("/:logId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { logId } = req.params
    const bodySchema = periodLogSchema.partial()
    const data = bodySchema.parse(req.body)

    const existing = await prisma.periodLog.findUnique({ where: { id: logId } })
    if (!existing) return res.status(404).json({ message: "Log not found" })

    if (req.user?.role !== "ADMIN" && req.user?.userId !== existing.userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const updated = await prisma.periodLog.update({
      where: { id: logId },
      data: {
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        flowIntensity: data.flowIntensity,
        symptoms: data.symptoms,
        notes: data.notes
      }
    })

    res.json(updated)
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid data", errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// DELETE /api/period-tracking/:logId
router.delete("/:logId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { logId } = req.params

    const existing = await prisma.periodLog.findUnique({ where: { id: logId } })
    if (!existing) return res.status(404).json({ message: "Log not found" })

    if (req.user?.role !== "ADMIN" && req.user?.userId !== existing.userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    await prisma.periodLog.delete({ where: { id: logId } })
    res.json({ message: "Deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router
