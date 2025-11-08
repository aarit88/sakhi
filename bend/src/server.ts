import express from "express"
import cors from "cors"
import dotenv from "dotenv"

// Import routes
import userRoutes from "./routes/users"
import periodTrackingRoutes from "./routes/period-tracking"
import healthWellnessRoutes from "./routes/health-wellness"
import remindersRoutes from "./routes/reminders"
import communityRoutes from "./routes/community"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get("/api/users", (req, res) => {
  res.json({ status: "Backend is running" })
})

// Routes
app.use("/api/users", userRoutes)
app.use("/api/period-tracking", periodTrackingRoutes)
app.use("/api/health-wellness", healthWellnessRoutes)
app.use("/api/reminders", remindersRoutes)
app.use("/api/community", communityRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: "Internal Server Error" })
})

app.listen(PORT, () => {
  console.log(`🚀 Sakhi Backend running on http://localhost:${PORT}`)
})
