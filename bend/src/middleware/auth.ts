import type { Response, NextFunction } from "express"
import { requireAuth, AuthRequest, getJwtSecret } from "./authMiddleware"

export type AuthPayload = {
  userId: string
  role: "USER" | "ADMIN"
}

export { AuthRequest, getJwtSecret }

// Unified authMiddleware supporting both Cookie and Bearer token auth
export const authMiddleware = requireAuth

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" })
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}
