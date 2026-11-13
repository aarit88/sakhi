import { Router, Response } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { requireAuth, AuthRequest } from "../middleware/authMiddleware"
import { computeCycleInfo } from "../utils/cycleUtils"

const router = Router()

// Common validations
const dateSchema = z.string().transform((str) => new Date(str))

const moodSchema = z.object({
  date: dateSchema,
  score: z.number().min(1).max(10),
  notes: z.string().optional()
})

const sleepSchema = z.object({
  date: dateSchema,
  hours: z.number().min(0).max(24),
  quality: z.number().min(1).max(5)
})

const hydrationSchema = z.object({
  date: dateSchema,
  intake: z.number().min(0),
  target: z.number().min(1)
})

const activitySchema = z.object({
  date: dateSchema,
  steps: z.number().min(0),
  calories: z.number().min(0)
})

const symptomSchema = z.object({
  date: dateSchema,
  type: z.string(),
  severity: z.string()
})

const cycleSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  flowIntensity: z.string().optional(),
  symptoms: z.string().optional(),
  notes: z.string().optional()
})

// Centralized query builder for ranges
const getDateFilter = (req: any) => {
  const { startDate, endDate } = req.query
  const dateFilter: any = {}
  if (startDate) dateFilter.gte = new Date(startDate as string)
  if (endDate) dateFilter.lte = new Date(endDate as string)
  return Object.keys(dateFilter).length > 0 ? dateFilter : undefined
}


// GET /api/health (aggregate for dashboard)
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    
    // Fetch last 30 days of data for summary and trends
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dateFilter = { gte: thirtyDaysAgo }

    const [mood, sleep, hydration, activity, symptoms, periods] = await Promise.all([
      prisma.moodLog.findMany({ where: { userId, date: dateFilter }, orderBy: { date: "asc" } }),
      prisma.sleepLog.findMany({ where: { userId, date: dateFilter }, orderBy: { date: "asc" } }),
      prisma.hydrationLog.findMany({ where: { userId, date: dateFilter }, orderBy: { date: "asc" } }),
      prisma.activityLog.findMany({ where: { userId, date: dateFilter }, orderBy: { date: "asc" } }),
      prisma.symptomLog.findMany({ where: { userId, date: dateFilter }, orderBy: { date: "asc" } }),
      prisma.periodLog.findMany({ where: { userId }, orderBy: { startDate: "desc" }, take: 4 }) // Fetch 4 to get 3 cycle lengths
    ])

    // Compute basic averages for dashboard
    const avgSleep = sleep.length > 0 ? sleep.reduce((acc, curr) => acc + curr.hours, 0) / sleep.length : 0;
    const avgHydration = hydration.length > 0 ? hydration.reduce((acc, curr) => acc + curr.intake, 0) / hydration.length : 0;
    const avgActivity = activity.length > 0 ? activity.reduce((acc, curr) => acc + curr.steps, 0) / activity.length : 0;
    

    // Calculate cycle info using canonical shared utility
    const cycleInfo = computeCycleInfo(periods.map((p) => p.startDate))

    // Dynamic vitals based on recent logs instead of hardcoded
    const recentActivity = activity[activity.length - 1];
    const recentSleep = sleep[sleep.length - 1];
    const vitals = {
      activeCalories: recentActivity?.calories || 0,
      recentSleepQuality: recentSleep?.quality || 0,
      stepsTrend: avgActivity > 5000 ? 'Good' : 'Needs Improvement',
      sleepTrend: avgSleep >= 7 ? 'Optimal' : 'Needs Improvement'
    }

    res.json({
      success: true,
      data: {
        mood, sleep, hydration, activity, symptoms,
        recentLogs: {
          moods: mood,
          sleeps: sleep,
          hydrations: hydration,
          activities: activity,
          periods
        },
        summary: {
          avgSleep: avgSleep.toFixed(1),
          avgHydration: avgHydration.toFixed(1),
          avgSteps: Math.round(avgActivity)
        },
        currentCycle: cycleInfo,
        vitals
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal server error" })
  }
})

// MOOD
router.get("/mood", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const dateFilter = getDateFilter(req)
    const data = await prisma.moodLog.findMany({
      where: { userId: req.user!.userId, ...(dateFilter && { date: dateFilter }) },
      orderBy: { date: "asc" }
    })
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: "Error" }) }
})

router.post("/mood", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = moodSchema.parse(req.body.data || req.body)
    const data = await prisma.moodLog.create({ data: { ...parsed, userId: req.user!.userId } })
    res.status(201).json({ success: true, data })
  } catch (err: any) { res.status(400).json({ success: false, error: "Invalid data", details: err.errors || err }) }
})

// SLEEP
router.get("/sleep", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const dateFilter = getDateFilter(req)
    const data = await prisma.sleepLog.findMany({
      where: { userId: req.user!.userId, ...(dateFilter && { date: dateFilter }) },
      orderBy: { date: "asc" }
    })
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: "Error" }) }
})

router.post("/sleep", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = sleepSchema.parse(req.body.data || req.body)
    const data = await prisma.sleepLog.create({ data: { ...parsed, userId: req.user!.userId } })
    res.status(201).json({ success: true, data })
  } catch (err: any) { res.status(400).json({ success: false, error: "Invalid data", details: err.errors || err }) }
})

// HYDRATION
router.get("/hydration", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const dateFilter = getDateFilter(req)
    const data = await prisma.hydrationLog.findMany({
      where: { userId: req.user!.userId, ...(dateFilter && { date: dateFilter }) },
      orderBy: { date: "asc" }
    })
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: "Error" }) }
})

router.post("/hydration", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = hydrationSchema.parse(req.body.data || req.body)
    const data = await prisma.hydrationLog.create({ data: { ...parsed, userId: req.user!.userId } })
    res.status(201).json({ success: true, data })
  } catch (err: any) { res.status(400).json({ success: false, error: "Invalid data", details: err.errors || err }) }
})

// ACTIVITY
router.get("/activity", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const dateFilter = getDateFilter(req)
    const data = await prisma.activityLog.findMany({
      where: { userId: req.user!.userId, ...(dateFilter && { date: dateFilter }) },
      orderBy: { date: "asc" }
    })
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: "Error" }) }
})

router.post("/activity", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = activitySchema.parse(req.body.data || req.body)
    const data = await prisma.activityLog.create({ data: { ...parsed, userId: req.user!.userId } })
    res.status(201).json({ success: true, data })
  } catch (err: any) { res.status(400).json({ success: false, error: "Invalid data", details: err.errors || err }) }
})

// SYMPTOMS
router.get("/symptoms", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const dateFilter = getDateFilter(req)
    const data = await prisma.symptomLog.findMany({
      where: { userId: req.user!.userId, ...(dateFilter && { date: dateFilter }) },
      orderBy: { date: "asc" }
    })
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: "Error" }) }
})

router.post("/symptoms", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = symptomSchema.parse(req.body.data || req.body)
    const data = await prisma.symptomLog.create({ data: { ...parsed, userId: req.user!.userId } })
    res.status(201).json({ success: true, data })
  } catch (err: any) { res.status(400).json({ success: false, error: "Invalid data", details: err.errors || err }) }
})

// CYCLE (PeriodLog)
router.get("/cycle", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = await prisma.periodLog.findMany({
      where: { userId: req.user!.userId },
      orderBy: { startDate: "desc" }
    })
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, error: "Error" }) }
})

router.post("/cycle", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = cycleSchema.parse(req.body.data || req.body)
    const data = await prisma.periodLog.create({ data: { ...parsed, userId: req.user!.userId } })
    res.status(201).json({ success: true, data })
  } catch (err: any) { res.status(400).json({ success: false, error: "Invalid data", details: err.errors || err }) }
})

export default router
