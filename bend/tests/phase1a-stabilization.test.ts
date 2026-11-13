import request from "supertest"
import app from "../src/server"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"

const prisma = new PrismaClient()

describe("Phase 1A Stabilization Regression Tests", () => {
  let userId: string
  let userToken: string
  const testEmail = `phase1a_${uuidv4()}@example.com`
  const password = "password123"

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password, name: "Phase 1A Tester" })
    userId = res.body.user.id
    const tokenMatch = res.header["set-cookie"][0].match(/token=([^;]+)/)
    userToken = tokenMatch ? tokenMatch[1] : ""
  })

  afterAll(async () => {
    await prisma.anonChatMessage.deleteMany({
      where: { session: { userId: userId } }
    })
    await prisma.anonChatSession.deleteMany({
      where: { userId: userId }
    })
    await prisma.symptomLog.deleteMany({
      where: { userId: userId }
    })
    await prisma.moodLog.deleteMany({
      where: { userId: userId }
    })
    await prisma.user.deleteMany({
      where: { email: testEmail }
    })
    await prisma.$disconnect()
  })

  describe("1. Anonymous Chat Session Auth & Race Condition Fix", () => {
    it("should create an anonymous session with userId = null when no token is passed", async () => {
      const res = await request(app)
        .post("/api/anonymous-chat/sessions")
        .send({})
      
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.session.userId).toBeNull()
    })

    it("should correctly resolve and populate userId when authenticated via Cookie", async () => {
      const res = await request(app)
        .post("/api/anonymous-chat/sessions")
        .set("Cookie", [`token=${userToken}`])
        .send({})

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.session.userId).toBe(userId)
    })

    it("should correctly resolve and populate userId when authenticated via Bearer token", async () => {
      const res = await request(app)
        .post("/api/anonymous-chat/sessions")
        .set("Authorization", `Bearer ${userToken}`)
        .send({})

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.session.userId).toBe(userId)
    })

    it("should gracefully fall back to anonymous (userId = null) when given an invalid token", async () => {
      const res = await request(app)
        .post("/api/anonymous-chat/sessions")
        .set("Authorization", "Bearer invalid-garbage-token")
        .send({})

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.session.userId).toBeNull()
    })
  })

  describe("2. Symptom Logging Contract Validation", () => {
    it("should accept valid payload with 'type' and 'severity' and persist correctly", async () => {
      const now = new Date().toISOString()
      const res = await request(app)
        .post("/api/health/symptoms")
        .set("Cookie", [`token=${userToken}`])
        .send({ date: now, type: "Migraine", severity: "severe" })

      expect(res.status).toBe(201)
      expect(res.body.data).toHaveProperty("id")
      expect(res.body.data.type).toBe("Migraine")
      expect(res.body.data.severity).toBe("severe")
      expect(res.body.data.userId).toBe(userId)
    })

    it("should reject symptom payload missing 'type' with HTTP 400", async () => {
      const res = await request(app)
        .post("/api/health/symptoms")
        .set("Cookie", [`token=${userToken}`])
        .send({ date: new Date().toISOString(), severity: "mild" }) // missing type

      expect(res.status).toBe(400)
    })

    it("should reject symptom payload missing 'severity' with HTTP 400", async () => {
      const res = await request(app)
        .post("/api/health/symptoms")
        .set("Cookie", [`token=${userToken}`])
        .send({ date: new Date().toISOString(), type: "Headache" }) // missing severity

      expect(res.status).toBe(400)
    })
  })

  describe("3. Dual Authentication (Cookie and Bearer) on Protected Routes", () => {
    it("should authenticate /api/health/mood using Bearer token header", async () => {
      const res = await request(app)
        .get("/api/health/mood")
        .set("Authorization", `Bearer ${userToken}`)

      expect(res.status).toBe(200)
    })

    it("should authenticate /api/health/mood using Cookie token", async () => {
      const res = await request(app)
        .get("/api/health/mood")
        .set("Cookie", [`token=${userToken}`])

      expect(res.status).toBe(200)
    })

    it("should reject unauthenticated request with HTTP 401", async () => {
      const res = await request(app)
        .get("/api/health/mood")

      expect(res.status).toBe(401)
    })
  })
})
