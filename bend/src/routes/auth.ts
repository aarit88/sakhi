import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { z } from "zod"
import prisma from "../prisma"
import dotenv from "dotenv"
import { getJwtSecret } from "../middleware/authMiddleware"

dotenv.config()

const router = Router()

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const registerHandler = async (req: any, res: any) => {
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
      getJwtSecret(),
      { expiresIn: "7d" }
    )

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Invalid data", errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
}

router.post("/signup", registerHandler)
router.post("/register", registerHandler)

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
      getJwtSecret(),
      { expiresIn: "7d" }
    )

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({
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

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  })
  res.json({ message: "Logged out successfully" })
})

router.get("/me", async (req: any, res: any) => {
  try {
    let token = req.cookies?.token
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1]
    }
    if (!token) return res.status(401).json({ message: "Not authenticated" })

    const decoded: any = jwt.verify(token, getJwtSecret())
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    if (!user) return res.status(401).json({ message: "User not found" })

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" })
  }
})

export default router
