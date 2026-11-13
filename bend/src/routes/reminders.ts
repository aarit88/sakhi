import { Router } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

const reminderSchema = z.object({
  userId: z.string().cuid(),
  type: z.enum(["PERIOD", "MEDICATION", "APPOINTMENT", "CUSTOM"]),
  title: z.string().min(3),
  description: z.string().optional(),
  remindAt: z.string() // ISO date
})

// POST /api/reminders
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = reminderSchema.parse(req.body)

    if (req.user?.role !== "ADMIN" && req.user?.userId !== data.userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        description: data.description,
        remindAt: new Date(data.remindAt)
      }
    })

    res.status(201).json(reminder)
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid data", errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// GET /api/reminders/:userId
router.get("/:userId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params

    if (req.user?.role !== "ADMIN" && req.user?.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId },
      orderBy: { remindAt: "asc" }
    })

    res.json(reminders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// PUT /api/reminders/:reminderId
router.put("/:reminderId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { reminderId } = req.params
    const bodySchema = reminderSchema.partial()
    const data = bodySchema.parse(req.body)

    const existing = await prisma.reminder.findUnique({ where: { id: reminderId } })
    if (!existing) return res.status(404).json({ message: "Reminder not found" })

    if (req.user?.role !== "ADMIN" && req.user?.userId !== existing.userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const updated = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        remindAt: data.remindAt ? new Date(data.remindAt) : undefined
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

// DELETE /api/reminders/:reminderId
router.delete("/:reminderId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { reminderId } = req.params

    const existing = await prisma.reminder.findUnique({ where: { id: reminderId } })
    if (!existing) return res.status(404).json({ message: "Reminder not found" })

    if (req.user?.role !== "ADMIN" && req.user?.userId !== existing.userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    await prisma.reminder.delete({ where: { id: reminderId } })
    res.json({ message: "Deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router
