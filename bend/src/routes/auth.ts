// bend/src/routes/auth.ts
import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { z } from "zod"
import prisma from "../prisma"
import dotenv from "dotenv"

dotenv.config()

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret"

// Request validation
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const data = signupSchema.parse(req.body)

    // check if user exists
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
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid data", errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// POST /api/auth/login
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
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
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
