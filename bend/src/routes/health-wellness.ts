import { Router, type Request, type Response } from "express"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

// Validation schema
const articleSchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.enum(["nutrition", "exercise", "mental-health", "general"]),
  author: z.string(),
})

// Get all wellness articles
router.get("/articles", async (req: Request, res: Response) => {
  try {
    const { category } = req.query

    const articles = await prisma.article.findMany({
      where: category ? { category: category as string } : {},
      orderBy: { createdAt: "desc" },
    })

    res.json(articles)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch articles" })
  }
})

// Get single article
router.get("/articles/:articleId", async (req: Request, res: Response) => {
  try {
    const { articleId } = req.params

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!article) {
      return res.status(404).json({ error: "Article not found" })
    }

    res.json(article)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch article" })
  }
})

// Create article (admin)
router.post("/articles", async (req: Request, res: Response) => {
  try {
    const data = articleSchema.parse(req.body)

    const article = await prisma.article.create({
      data,
    })

    res.status(201).json(article)
  } catch (error) {
    res.status(400).json({ error: "Failed to create article" })
  }
})

// Get wellness tips
router.get("/tips", async (req: Request, res: Response) => {
  try {
    const tips = await prisma.tip.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    res.json(tips)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tips" })
  }
})

// Get resources
router.get("/resources", async (req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
    })

    res.json(resources)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resources" })
  }
})

export default router
