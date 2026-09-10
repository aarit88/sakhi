import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret"

export interface AuthRequest extends Request {
  user?: {
    userId: string
    role: string
  }
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token

    if (!token) {
      return res.status(401).json({ message: "Authentication required. No token provided." })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    }

    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}
