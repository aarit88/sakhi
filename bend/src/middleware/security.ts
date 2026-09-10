import type { NextFunction, Request, Response } from "express"

type RateBucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateBucket>()

export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("Referrer-Policy", "no-referrer")
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  next()
}

export const createRateLimiter = (options?: { windowMs?: number; max?: number }) => {
  const windowMs = options?.windowMs ?? 60_000
  const max = options?.max ?? 120

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now()
    const forwardedFor = req.headers["x-forwarded-for"]
    const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0]
    const key = (forwardedIp || req.socket.remoteAddress || "unknown").trim()

    const existing = buckets.get(key)
    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      next()
      return
    }

    existing.count += 1
    if (existing.count > max) {
      res.status(429).json({ message: "Too many requests. Please wait a minute and try again." })
      return
    }

    next()
  }
}
