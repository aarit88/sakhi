import express from "express"
import cors from "cors"
import dotenv from "dotenv"

// Routers
import authRouter from "./routes/auth"
import usersRouter from "./routes/users"
import periodTrackingRouter from "./routes/period-tracking"
import healthWellnessRouter from "./routes/health-wellness"
import remindersRouter from "./routes/reminders"
import communityRouter from "./routes/community"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "Sakhi Backend API running" })
})

/* =======================
   API Route Mounting
======================= */

// 🔹 Authentication (Signup + Login)
app.use("/api/auth", authRouter)

// 🔹 Users
app.use("/api/users", usersRouter)

// 🔹 Period Tracking
app.use("/api/period-tracking", periodTrackingRouter)

// 🔹 Health & Wellness
app.use("/api/health-wellness", healthWellnessRouter)

// 🔹 Reminders
app.use("/api/reminders", remindersRouter)

// 🔹 Community
app.use("/api/community", communityRouter)

/* =======================
   404 Handler
======================= */
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" })
})

/* =======================
   Global Error Handler
======================= */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unexpected error:", err)
  res.status(500).json({ message: "Internal server error" })
})

/* =======================
   Start Server
======================= */
app.listen(PORT, () => {
  console.log(`Sakhi backend running on http://localhost:${PORT}`)
})

export default app
