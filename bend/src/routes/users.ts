import { Router, type Request, type Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  age: z.number().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Sign up
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name, age } = signupSchema.parse(req.body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        age,
      },
    })

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    })

    res.status(201).json({ user: { id: user.id, email, name }, token })
  } catch (error) {
    res.status(400).json({ error: "Signup failed" })
  }
})

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    })

    res.json({ user: { id: user.id, email, name: user.name }, token })
  } catch (error) {
    res.status(400).json({ error: "Login failed" })
  }
})

// Get user profile
router.get("/profile/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, age: true, createdAt: true },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

// Update user profile
router.put("/profile/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { name, age } = req.body

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, age },
      select: { id: true, email: true, name: true, age: true },
    })

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" })
  }
})

export default router
