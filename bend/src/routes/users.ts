import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { z } from "zod"
import prisma from "../prisma"
import dotenv from "dotenv"
import { authMiddleware, AuthRequest } from "../middleware/auth"

dotenv.config()

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret"

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

// POST /api/users/signup
router.post("/signup", async (req, res) => {
  try {
    const data = signupSchema.parse(req.body)

    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    })
    if (existing) {
      return res.status(400).json({ message: "Email already in use" })
    }

    const hashed = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name
      }
    })

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid data", errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// POST /api/users/login
router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    const isValid = await bcrypt.compare(data.password, user.password)
    if (!isValid) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid data", errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// GET /api/users/profile/:userId
router.get("/profile/:userId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params

    // Optional: only allow owner (or admin)
    if (req.user?.role !== "ADMIN" && req.user?.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    })

    if (!user) return res.status(404).json({ message: "User not found" })

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// PUT /api/users/profile/:userId
router.put("/profile/:userId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params
    const bodySchema = z.object({
      name: z.string().optional()
    })
    const data = bodySchema.parse(req.body)

    if (req.user?.role !== "ADMIN" && req.user?.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name: data.name }
    })

    res.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role
    })
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid data", errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

export default router
