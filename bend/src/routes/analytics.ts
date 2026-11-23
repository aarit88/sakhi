import { Router, Response } from "express"
import prisma from "../prisma"
import { requireAuth, AuthRequest } from "../middleware/authMiddleware"

const router = Router()

// GET /api/analytics — Get user's aggregated health analytics
router.get(
  "/",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId

      // Calculate date range: last 30 days
      const now = new Date()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(now.getDate() - 30)

      // Count diet logs in the last 30 days
      const dietLogCount = await prisma.dietLog.count({
        where: {
          userId,
          date: {
            gte: thirtyDaysAgo,
            lte: now,
          },
        },
      })

      // Calculate total calories from diet logs in the last 30 days
      const dietCaloriesAggregate = await prisma.dietLog.aggregate({
        where: {
          userId,
          date: {
            gte: thirtyDaysAgo,
            lte: now,
          },
        },
        _sum: {
          calories: true,
        },
      })

      const totalCalories = dietCaloriesAggregate._sum.calories || 0

      // Count mood logs in the last 30 days
      const moodLogCount = await prisma.moodLog.count({
        where: {
          userId,
          date: {
            gte: thirtyDaysAgo,
            lte: now,
          },
        },
      })

      // Count symptom logs in the last 30 days
      const symptomLogCount = await prisma.symptomLog.count({
        where: {
          userId,
          date: {
            gte: thirtyDaysAgo,
            lte: now,
          },
        },
      })

      // Get recent mood entries
      const recentMoodEntries = await prisma.moodLog.findMany({
        where: {
          userId,
          date: {
            gte: thirtyDaysAgo,
            lte: now,
          },
        },
        orderBy: { date: "desc" },
        take: 10,
        select: {
          id: true,
          date: true,
          score: true,
        },
      })

      // Get recent symptom entries
      const recentSymptomEntries = await prisma.symptomLog.findMany({
        where: {
          userId,
          date: {
            gte: thirtyDaysAgo,
            lte: now,
          },
        },
        orderBy: { date: "desc" },
        take: 10,
        select: {
          id: true,
          date: true,
          type: true,
          severity: true,
        },
      })

      // Calculate average symptom severity over the period
      const severityEntries = await prisma.symptomLog.findMany({
        where: {
          userId,
          date: {
            gte: thirtyDaysAgo,
            lte: now,
          },
        },
        select: {
          severity: true,
        },
      })

      let averageSeverity = 0
      if (severityEntries.length > 0) {
        const severityValues: Record<string, number> = { mild: 1, moderate: 2, severe: 3 }
        const totalSeverity = severityEntries
          .map((e) => severityValues[e.severity || ''])
          .reduce((sum, val) => sum + val, 0)
        averageSeverity = totalSeverity / severityEntries.length
      }

      return res.status(200).json({
        success: true,
        data: {
          period: '30 days',
          dietLogCount,
          totalCalories,
          moodLogCount,
          symptomLogCount,
          averageSeverity: Math.round(averageSeverity),
          recentMoods: recentMoodEntries.map((m) => ({
            date: m.date.toISOString().split('T')[0],
            score: m.score,
          })),
          recentSymptoms: recentSymptomEntries.map((s) => ({
            date: s.date.toISOString().split('T')[0],
            type: s.type,
            severity: s.severity || undefined,
          })),
        },
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Analytics error:', err)
      return res.status(500).json({ success: false, message: 'Failed to fetch analytics' })
    }
  }
)

export default router