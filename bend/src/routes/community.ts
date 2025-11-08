import { Router, type Request, type Response } from "express"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

// Validation schemas
const postSchema = z.object({
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.enum(["discussion", "question", "experience", "support"]),
})

const commentSchema = z.object({
  userId: z.string(),
  postId: z.string(),
  content: z.string(),
})

// Create community post
router.post("/posts", async (req: Request, res: Response) => {
  try {
    const data = postSchema.parse(req.body)

    const post = await prisma.communityPost.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        category: data.category,
      },
    })

    res.status(201).json(post)
  } catch (error) {
    res.status(400).json({ error: "Failed to create post" })
  }
})

// Get all community posts
router.get("/posts", async (req: Request, res: Response) => {
  try {
    const { category, limit = 20 } = req.query

    const posts = await prisma.communityPost.findMany({
      where: category ? { category: category as string } : {},
      orderBy: { createdAt: "desc" },
      take: Number.parseInt(limit as string),
      include: { _count: { select: { comments: true } } },
    })

    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" })
  }
})

// Get single post with comments
router.get("/posts/:postId", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      include: { comments: { orderBy: { createdAt: "desc" } } },
    })

    if (!post) {
      return res.status(404).json({ error: "Post not found" })
    }

    res.json(post)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch post" })
  }
})

// Add comment to post
router.post("/comments", async (req: Request, res: Response) => {
  try {
    const data = commentSchema.parse(req.body)

    const comment = await prisma.comment.create({
      data: {
        userId: data.userId,
        postId: data.postId,
        content: data.content,
      },
    })

    res.status(201).json(comment)
  } catch (error) {
    res.status(400).json({ error: "Failed to add comment" })
  }
})

// Delete post
router.delete("/posts/:postId", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params

    await prisma.communityPost.delete({
      where: { id: postId },
    })

    res.json({ message: "Post deleted" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" })
  }
})

export default router
