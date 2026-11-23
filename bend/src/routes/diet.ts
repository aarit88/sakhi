import { Router, Response } from "express"
import prisma from "../prisma"
import { requireAuth, AuthRequest } from "../middleware/authMiddleware"

const router = Router()

// POST /api/diet — Create a new diet log entry
router.post(
  "/",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { mealName, calories, notes } = req.body
      const date = req.body.date ? new Date(req.body.date) : new Date()

      if (!mealName || mealName.trim() === "") {
        return res.status(400).json({ message: "Meal name is required" })
      }

      const dietLog = await prisma.dietLog.create({
        data: {
          userId: req.user!.userId,
          date: date,
          mealName: mealName.trim(),
          calories: calories !== undefined ? Number(calories) : undefined,
          notes: notes ? notes.trim() : undefined,
        },
        select: {
          id: true,
          mealName: true,
          calories: true,
          notes: true,
          date: true,
          createdAt: true,
        },
      })

      return res.status(201).json({ success: true, data: dietLog })
    } catch (err) {
      console.error("Diet log error:", err)
      return res.status(500).json({ message: "Failed to log diet entry" })
    }
  }
)

// GET /api/diet — Get user's diet logs
router.get(
  "/",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const logs = await prisma.dietLog.findMany({
        where: { userId: req.user!.userId },
        orderBy: { date: "desc" },
        select: {
          id: true,
          mealName: true,
          calories: true,
          notes: true,
          date: true,
          createdAt: true,
        },
      })

      return res.status(200).json({ success: true, data: logs })
    } catch (err) {
      console.error("Get diet logs error:", err)
      return res.status(500).json({ message: "Failed to fetch diet logs" })
    }
  }
)

// DELETE /api/diet/:id — Delete a diet log entry
router.delete(
  "/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params

      const log = await prisma.dietLog.findUnique({
        where: { id },
      })

      if (!log) {
        return res.status(404).json({ message: "Diet log not found" })
      }

      // Ensure user can only delete their own logs
      if (log.userId !== req.user!.userId) {
        return res.status(403).json({ message: "Forbidden: not your log" })
      }

      await prisma.dietLog.delete({
        where: { id },
      })

      return res.status(200).json({ success: true, data: {} })
    } catch (err) {
      console.error("Delete diet log error:", err)
      return res.status(500).json({ message: "Failed to delete diet log" })
    }
  }
)

export default router