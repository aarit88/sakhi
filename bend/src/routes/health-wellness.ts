import { Router } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { authMiddleware, requireAdmin, AuthRequest } from "../middleware/auth"

const router = Router()

const articleSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.string().optional(),
  isPublished: z.boolean().optional()
})

// GET /api/health-wellness/articles
router.get("/articles", async (_req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" }
    })
    res.json(articles)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// GET /api/health-wellness/articles/:articleId
router.get("/articles/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params
    const article = await prisma.article.findUnique({ where: { id: articleId } })
    if (!article || !article.isPublished) {
      return res.status(404).json({ message: "Article not found" })
    }
    res.json(article)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// POST /api/health-wellness/articles (admin)
router.post("/articles", authMiddleware, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = articleSchema.parse(req.body)

    const article = await prisma.article.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        isPublished: data.isPublished ?? true
      }
    })

    res.status(201).json(article)
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid data", errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// GET /api/health-wellness/tips
router.get("/tips", async (_req, res) => {
  try {
    const tips = await prisma.tip.findMany({ orderBy: { createdAt: "desc" } })
    res.json(tips)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// GET /api/health-wellness/resources
router.get("/resources", async (_req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" }
    })
    res.json(resources)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router
