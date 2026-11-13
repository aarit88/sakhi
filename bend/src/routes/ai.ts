import { Router, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { requireAuth, AuthRequest } from "../middleware/authMiddleware"
import { z } from "zod"
import { AIOrchestrator } from "../services/ai/orchestrator"

const router = Router()
const prisma = new PrismaClient()

const chatSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional()
})

router.post("/chat", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId
    const parsed = chatSchema.parse(req.body)
    
    // Resolve or create conversation
    let conversationId = parsed.conversationId
    if (!conversationId) {
      const newConv = await prisma.aIConversation.create({
        data: { userId, title: "New Conversation" }
      })
      conversationId = newConv.id
    } else {
      // Verify ownership
      const conv = await prisma.aIConversation.findUnique({ where: { id: conversationId } })
      if (!conv || conv.userId !== userId) {
        return res.status(403).json({ success: false, error: "Unauthorized conversation access" })
      }
    }

    // Persist User Message
    await prisma.aIMessage.create({
      data: {
        conversationId,
        role: "user",
        content: parsed.message
      }
    })

    // Orchestrate AI Response
    const aiResponse = await AIOrchestrator.processChat(userId, parsed.message)

    // Persist AI Message with safety status
    const persistedReply = await prisma.aIMessage.create({
      data: {
        conversationId,
        role: "assistant",
        content: JSON.stringify(aiResponse), // Storing the full JSON structure
        safetyStatus: aiResponse.safetyStatus
      }
    })

    res.json({
      success: true,
      data: {
        ...aiResponse,
        conversationId,
        messageId: persistedReply.id
      }
    })

  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || "Invalid request" })
  }
})

export default router
