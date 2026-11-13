import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret === "dev_secret") {
      throw new Error("A strong, non-default JWT_SECRET is required in production mode.")
    }
    return secret
  }
  return secret || "dev_secret"
}

export interface AuthRequest extends Request {
  user?: {
    userId: string
    role: string
  }
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Check HTTP-only cookie
    let token = req.cookies?.token

    // 2. Fall back to Authorization: Bearer header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication required. No token provided." })
    }

    const secret = getJwtSecret()
    const decoded = jwt.verify(token, secret) as any
    req.user = {
      userId: decoded.userId,
      role: decoded.role || "USER"
    }

    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}
