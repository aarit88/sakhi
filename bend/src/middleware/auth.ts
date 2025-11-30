import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret"

export interface AuthPayload {
  userId: string
  role: "USER" | "ADMIN"
}

export interface AuthRequest extends Request {
  user?: AuthPayload
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" })
  }

  const token = authHeader.split(" ")[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" })
  }
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" })
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}
