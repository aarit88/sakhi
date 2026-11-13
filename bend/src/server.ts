import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import helmet from "helmet"

import authRouter from "./routes/auth"
import usersRouter from "./routes/users"
import periodTrackingRouter from "./routes/period-tracking"
import healthWellnessRouter from "./routes/health-wellness"
import remindersRouter from "./routes/reminders"
import communityRouter from "./routes/community"
import anonymousChatRouter from "./routes/anonymous-chat"
import clinicalReportsRouter from "./routes/clinical-reports"
import healthRouter from "./routes/health"
import aiRouter from "./routes/ai"
import visualContentRouter from "./routes/visual-content"
import { createRateLimiter, securityHeaders } from "./middleware/security"

dotenv.config()

// ── Security: Validate critical environment variables at startup ──────────────
if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev_secret") {
    console.error(
      "[SAKHI STARTUP ERROR] A secure, non-default JWT_SECRET environment variable is required in production. " +
      "The server will not start without it. Set JWT_SECRET to a strong random string."
    )
    process.exit(1)
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const app = express()
const PORT = process.env.PORT || 5000

app.disable("x-powered-by")

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://localhost:3000",
].filter(Boolean) as string[]

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
)
app.use(helmet())
app.use(securityHeaders)
app.use(createRateLimiter({ windowMs: 60_000, max: 180 }))
app.use(express.json({ limit: "1mb" }))
app.use(cookieParser())

app.get("/", (_req, res) => {
  res.json({
    message: "SAKHI Backend API running",
    features: ["auth", "period-tracking", "anonymous-chat", "clinical-report-parser"],
  })
})

app.use("/api/auth", authRouter)
app.use("/api/users", usersRouter)
app.use("/api/period-tracking", periodTrackingRouter)
app.use("/api/health-wellness", healthWellnessRouter)
app.use("/api/health", healthRouter)
app.use("/api/reminders", remindersRouter)
app.use("/api/community", communityRouter)
app.use("/api/anonymous-chat", anonymousChatRouter)
app.use("/api/clinical-reports", clinicalReportsRouter)
app.use("/api/ai", aiRouter)
app.use("/api/visual-content", visualContentRouter)

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" })
})

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unexpected error:", err)
  res.status(500).json({ message: "Internal server error" })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`SAKHI backend running on http://localhost:${PORT}`)
  })
}

export default app
