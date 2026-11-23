import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

// ── Authoritative JWT secret (fail-closed if missing) ────────────────────────
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required. Set JWT_SECRET before starting the server.")
}

// ── Shared types ──────────────────────────────────────────────────────────────

export interface AuthPayload {
  userId: string
  role: "USER" | "ADMIN"
}

export interface AuthRequest extends Request {
  user?: AuthPayload
}

// ── Token verification ────────────────────────────────────────────────────────

/**
 * Verifies a JWT token and returns the decoded payload.
 * Throws if the token is invalid, expired, or malformed.
 * Never trusts client-supplied identities; identity comes only from the verified token.
 */
export function verifyToken(token: string): AuthPayload {
  const secret = JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not configured")
  }
  const decoded = jwt.verify(token, secret) as unknown as AuthPayload
  if (!decoded || typeof decoded !== "object" || !decoded.userId) {
    throw new Error("Invalid token claims")
  }
  return {
    userId: String(decoded.userId),
    role: decoded.role === "ADMIN" ? "ADMIN" : "USER",
  }
}

/**
 * Extracts a JWT from the request, supporting both authentication transports:
 * 1. Authorization: Bearer <token> header (API / mobile clients)
 * 2. httpOnly "token" cookie (web clients)
 *
 * Returns null when no credential is present. Never reads a raw email or a
 * client-supplied user ID as an authentication source.
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1]
  }

  const cookies = req.cookies as Record<string, string> | undefined
  if (cookies && cookies.token) {
    return cookies.token
  }

  return null
}

// ── Middleware ────────────────────────────────────────────────────────────────

/**
 * Unified authentication middleware. Resolves the authenticated user identity
 * from verified credentials only (Bearer token or httpOnly cookie).
 * Both transports map to the same AuthRequest.user identity model.
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req)

    if (!token) {
      return res.status(401).json({ message: "Authentication required. No token provided." })
    }

    const payload = verifyToken(token)
    req.user = {
      userId: payload.userId,
      role: payload.role,
    }

    next()
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "Invalid token claims") {
        return res.status(401).json({ message: "Invalid token claims" })
      }
      // jwt.verify throws TokenExpiredError, JsonWebTokenError, NotBeforeError, etc.
      return res.status(401).json({ message: "Invalid or expired token" })
    }
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

/**
 * Middleware to require the ADMIN role. Assumes requireAuth has already run.
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

export default { requireAuth, requireAdmin, verifyToken, extractToken }