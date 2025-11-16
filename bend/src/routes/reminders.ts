import { Router, type Request, type Response } from "express"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

// Validation schema
const reminderSchema = z.object({
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  reminderType: z.enum(["period", "medication", "appointment", "custom"]),
  scheduledTime: z.string().datetime(),
  isActive: z.boolean().default(true),
})

// Create reminder
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = reminderSchema.parse(req.body)

    const reminder = await prisma.reminder.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        reminderType: data.reminderType,
        scheduledTime: new Date(data.scheduledTime),
        isActive: data.isActive,
      },
    })

    res.status(201).json(reminder)
  } catch (error) {
    res.status(400).json({ error: "Failed to create reminder" })
  }
})

// Get user reminders
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const reminders = await prisma.reminder.findMany({
      where: { userId, isActive: true },
      orderBy: { scheduledTime: "asc" },
    })

    res.json(reminders)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reminders" })
  }
})

// Update reminder
router.put("/:reminderId", async (req: Request, res: Response) => {
  try {
    const { reminderId } = req.params
    const data = reminderSchema.partial().parse(req.body)

    const reminder = await prisma.reminder.update({
      where: { id: reminderId },
      data,
    })

    res.json(reminder)
  } catch (error) {
    res.status(500).json({ error: "Failed to update reminder" })
  }
})

// Delete reminder
router.delete("/:reminderId", async (req: Request, res: Response) => {
  try {
    const { reminderId } = req.params

    await prisma.reminder.delete({
      where: { id: reminderId },
    })

    res.json({ message: "Reminder deleted" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete reminder" })
  }
})

export default router
