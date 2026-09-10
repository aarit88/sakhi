import { Router, Response } from "express"
import { requireAuth, AuthRequest } from "../middleware/authMiddleware"
import prisma from "../prisma"

const router = Router()

// GET /api/visual-content?category=...&language=...
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { category, language } = req.query
    
    // Default language is en
    const lang = (language as string) || "en"
    
    const content = await prisma.visualContent.findMany({
      where: {
        active: true,
        ...(category ? { category: category as string } : {}),
        language: lang
      },
      orderBy: {
        orderIndex: "asc"
      }
    })

    // If no content found for requested language, fallback to English
    if (content.length === 0 && lang !== "en") {
      const fallbackContent = await prisma.visualContent.findMany({
        where: {
          active: true,
          ...(category ? { category: category as string } : {}),
          language: "en"
        },
        orderBy: {
          orderIndex: "asc"
        }
      })
      return res.json({
        success: true,
        fallback: true,
        data: fallbackContent
      })
    }
    
    res.json({
      success: true,
      data: content
    })
  } catch (error) {
    console.error("Error fetching visual content:", error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
})

export default router
