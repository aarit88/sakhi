import { Router } from "express"
import jwt from "jsonwebtoken"
import { z } from "zod"
import prisma from "../prisma"
import { requireAuth, AuthRequest } from "../middleware/authMiddleware"
import { createSakhiAgentReply } from "../services/sakhiAgent"

const router = Router()

// ... Existing Q&A schemas ...
const questionSchema = z.object({
  content: z.string().min(5),
  category: z.string().optional(),
})

const answerSchema = z.object({
  questionId: z.string().cuid(),
  content: z.string().min(1),
})

const chatMessageSchema = z.object({
  message: z.string().min(1).max(1600)
})

// === AI ANONYMOUS CHAT PERSISTENCE ===

// POST /api/anonymous-chat/sessions
router.post("/sessions", async (req, res) => {
  try {
    // Optional auth: check cookie first, then Bearer header
    const authHeader = req.headers.authorization
    const token = req.cookies?.token || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null)
    let userId: string | null = null

    if (token) {
      try {
        const secret = process.env.JWT_SECRET || "dev_secret"
        const decoded: any = jwt.verify(token, secret)
        if (decoded?.userId) {
          userId = decoded.userId
        }
      } catch (tokenErr) {
        // Invalid or expired token: proceed with anonymous session (userId = null)
        userId = null
      }
    }

    const session = await prisma.anonChatSession.create({
      data: {
        userId: userId
      }
    })
    res.status(201).json({ success: true, session })
  } catch(err) {
    res.status(500).json({ message: "Internal error" })
  }
})

// GET /api/anonymous-chat/sessions/:id/messages
router.get("/sessions/:id/messages", async (req, res) => {
  try {
    const messages = await prisma.anonChatMessage.findMany({
      where: { sessionId: req.params.id },
      orderBy: { createdAt: "asc" }
    })
    res.json({ success: true, messages })
  } catch(err) {
    res.status(500).json({ message: "Internal error" })
  }
})

// POST /api/anonymous-chat/sessions/:id/messages
router.post("/sessions/:id/messages", async (req, res) => {
  try {
    const { id: sessionId } = req.params
    const data = chatMessageSchema.parse(req.body)

    const session = await prisma.anonChatSession.findUnique({ where: { id: sessionId } })
    if (!session) return res.status(404).json({ message: "Session not found" })

    // Save user message
    const userMsg = await prisma.anonChatMessage.create({
      data: {
        sessionId,
        role: "user",
        content: data.message
      }
    })

    // Fetch history for AI
    const history = await prisma.anonChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 12
    })
    const formattedHistory = history.map(h => ({ role: h.role as "user"|"assistant", content: h.content }))

    const agentResult = createSakhiAgentReply(data.message, formattedHistory)

    // Save AI response
    const aiMsg = await prisma.anonChatMessage.create({
      data: {
        sessionId,
        role: "assistant",
        content: agentResult.reply
      }
    })

    res.json({ success: true, userMsg, aiMsg, ...agentResult })
  } catch(err) {
    res.status(500).json({ message: "Internal error" })
  }
})

// === Q&A COMMUNITY CHAT ===

router.post("/questions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = questionSchema.parse(req.body)
    const question = await prisma.anonQuestion.create({
      data: {
        userId: req.user!.userId,
        content: data.content,
        category: data.category,
      },
      select: {
        id: true, content: true, category: true, createdAt: true,
        _count: { select: { answers: true } },
      },
    })
    res.status(201).json(question)
  } catch (err: any) {
    res.status(500).json({ message: "Internal server error" })
  }
})

router.get("/questions", async (req, res) => {
  try {
    const { category } = req.query
    const where = category ? { category: String(category) } : {}
    const questions = await prisma.anonQuestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, content: true, category: true, createdAt: true,
        _count: { select: { answers: true } },
      },
    })
    res.json(questions)
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
})

router.get("/questions/:id", async (req, res) => {
  try {
    const question = await prisma.anonQuestion.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, content: true, category: true, createdAt: true,
        answers: {
          orderBy: { createdAt: "asc" },
          select: { id: true, content: true, createdAt: true },
        },
      },
    })
    if (!question) return res.status(404).json({ message: "Question not found" })
    res.json(question)
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
})

router.post("/answers", requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = answerSchema.parse(req.body)
    const answer = await prisma.anonAnswer.create({
      data: {
        questionId: data.questionId,
        userId: req.user!.userId,
        content: data.content,
      },
      select: { id: true, content: true, createdAt: true },
    })
    res.status(201).json(answer)
  } catch (err: any) {
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router
