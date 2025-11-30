import { Router } from "express"
import { z } from "zod"
import prisma from "../prisma"
import { authMiddleware, AuthRequest } from "../middleware/auth"

const router = Router()

const postSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.string().optional()
})

const commentSchema = z.object({
  postId: z.string().cuid(),
  content: z.string().min(1)
})

// POST /api/community/posts
router.post("/posts", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = postSchema.parse(req.body)

    const post = await prisma.communityPost.create({
      data: {
        userId: req.user!.userId,
        title: data.title,
        content: data.content,
        category: data.category
      }
    })

    res.status(201).json(post)
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid data", errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// GET /api/community/posts
router.get("/posts", async (_req, res) => {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        comments: {
          orderBy: { createdAt: "asc" }
        }
      }
    })
    res.json(posts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// GET /api/community/posts/:postId
router.get("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params
    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        comments: {
          orderBy: { createdAt: "asc" }
        }
      }
    })

    if (!post) return res.status(404).json({ message: "Post not found" })
    res.json(post)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// POST /api/community/comments
router.post("/comments", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = commentSchema.parse(req.body)

    const comment = await prisma.comment.create({
      data: {
        postId: data.postId,
        userId: req.user!.userId,
        content: data.content
      }
    })

    res.status(201).json(comment)
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid data", errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// DELETE /api/community/posts/:postId
router.delete("/posts/:postId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params

    const post = await prisma.communityPost.findUnique({ where: { id: postId } })
    if (!post) return res.status(404).json({ message: "Post not found" })

    // allow author or admin to delete
    if (req.user?.role !== "ADMIN" && req.user?.userId !== post.userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    await prisma.comment.deleteMany({ where: { postId } })
    await prisma.communityPost.delete({ where: { id: postId } })

    res.json({ message: "Deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router
