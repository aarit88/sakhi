import request from "supertest"
import app from "../src/server"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"

const prisma = new PrismaClient()

describe("Authentication & Isolation API", () => {
  let userAId: string;
  let userBId: string;
  let userAToken: string;
  let userBToken: string;
  let testEmailA = `testA_${uuidv4()}@example.com`;
  let testEmailB = `testB_${uuidv4()}@example.com`;
  const password = "password123";

  afterAll(async () => {
    await prisma.aIMessage.deleteMany({
      where: { conversation: { userId: { in: [userAId, userBId] } } }
    });
    await prisma.aIConversation.deleteMany({
      where: { userId: { in: [userAId, userBId] } }
    });
    await prisma.moodLog.deleteMany({
      where: { userId: { in: [userAId, userBId] } }
    });
    await prisma.user.deleteMany({
      where: { email: { in: [testEmailA, testEmailB] } }
    });
    await prisma.$disconnect()
  })

  describe("1. Registration", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: testEmailA, password, name: "Test User A" })
      
      expect(res.status).toBe(201)
      expect(res.body.user).toHaveProperty("id")
      expect(res.body.user.email).toBe(testEmailA)
      expect(res.body.user).not.toHaveProperty("password")
      userAId = res.body.user.id
      
      // Cookie Check
      const setCookie = res.header["set-cookie"]
      expect(setCookie).toBeDefined()
      expect(setCookie[0]).toMatch(/token=/)
      expect(setCookie[0]).toMatch(/HttpOnly/)
    })

    it("should fail duplicate registration", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: testEmailA, password, name: "Test User A" })
      expect(res.status).toBe(400)
    })
  })

  describe("2. Login", () => {
    it("should fail on invalid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmailA, password: "wrongpassword" })
      expect(res.status).toBe(400)
    })

    it("should login successfully and set HttpOnly cookie", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmailA, password })
      expect(res.status).toBe(200)
      
      const setCookie = res.header["set-cookie"]
      expect(setCookie).toBeDefined()
      expect(setCookie[0]).toMatch(/token=/)
      expect(setCookie[0]).toMatch(/HttpOnly/)

      // Capture token for future requests
      const tokenMatch = setCookie[0].match(/token=([^;]+)/)
      userAToken = tokenMatch ? tokenMatch[1] : ""
    })
  })

  describe("3. GET /me & Logout", () => {
    it("should return authenticated user details", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", [`token=${userAToken}`])
      
      expect(res.status).toBe(200)
      expect(res.body.user.id).toBe(userAId)
    })

    it("should logout successfully and clear cookie", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
      
      expect(res.status).toBe(200)
      const setCookie = res.header["set-cookie"]
      expect(setCookie[0]).toMatch(/token=;/) // Cookie cleared
    })

    it("should fail /me after logout", async () => {
      const res = await request(app)
        .get("/api/auth/me")
      expect(res.status).toBe(401)
    })
  })

  describe("4. User Data Isolation", () => {
    beforeAll(async () => {
      // Register User B
      const resB = await request(app)
        .post("/api/auth/register")
        .send({ email: testEmailB, password, name: "Test User B" })
      userBId = resB.body.user.id
      const tokenMatch = resB.header["set-cookie"][0].match(/token=([^;]+)/)
      userBToken = tokenMatch ? tokenMatch[1] : ""
    })

    it("User A creates a mood log", async () => {
      const res = await request(app)
        .post("/api/health/mood")
        .set("Cookie", [`token=${userAToken}`])
        .send({ date: new Date().toISOString(), score: 4, notes: "Feeling good A" })
      expect(res.status).toBe(201)
    })

    it("User B creates a mood log", async () => {
      const res = await request(app)
        .post("/api/health/mood")
        .set("Cookie", [`token=${userBToken}`])
        .send({ date: new Date().toISOString(), score: 2, notes: "Feeling bad B" })
      expect(res.status).toBe(201)
    })

    it("User A retrieves ONLY their own mood log", async () => {
      const res = await request(app)
        .get("/api/health/mood")
        .set("Cookie", [`token=${userAToken}`])
      expect(res.status).toBe(200)
      expect(res.body.data.length).toBeGreaterThan(0)
      // Assert every returned record belongs to User A (or verify notes content)
      expect(res.body.data.every((record: any) => record.userId === userAId)).toBe(true)
      expect(res.body.data.some((record: any) => record.notes === "Feeling good A")).toBe(true)
      expect(res.body.data.some((record: any) => record.notes === "Feeling bad B")).toBe(false)
    })
  })
})
