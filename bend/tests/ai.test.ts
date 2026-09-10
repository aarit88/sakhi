import request from "supertest"
import app from "../src/server"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"

const prisma = new PrismaClient()

describe("AI & Red Flags API", () => {
  let userId: string;
  let userToken: string;
  const testEmail = `aitest_${uuidv4()}@example.com`;
  const password = "password123";

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password, name: "AI Test User" })
    userId = res.body.user.id
    const tokenMatch = res.header["set-cookie"][0].match(/token=([^;]+)/)
    userToken = tokenMatch ? tokenMatch[1] : ""
  })

  afterAll(async () => {
    await prisma.aIMessage.deleteMany({
      where: { conversation: { userId: userId } }
    });
    await prisma.aIConversation.deleteMany({
      where: { userId: userId }
    });
    await prisma.user.deleteMany({
      where: { email: testEmail }
    });
    await prisma.$disconnect()
  })

  describe("1. AI Authorization and Isolation", () => {
    it("should ignore malicious userId injection", async () => {
      const res = await request(app)
        .post("/api/ai/chat")
        .set("Cookie", [`token=${userToken}`])
        .send({ message: "Hello", userId: "admin-id" }) // Attempt to bypass

      expect(res.status).toBe(200)
      
      // Verify conversation was created with the correct authenticated userId, not "admin-id"
      const conv = await prisma.aIConversation.findUnique({
        where: { id: res.body.data.conversationId }
      })
      expect(conv?.userId).toBe(userId)
      expect(conv?.userId).not.toBe("admin-id")
    })
  })

  describe("2. Deterministic Red Flags", () => {
    it("should trigger MEDICAL_ATTENTION_RECOMMENDED on high-risk input", async () => {
      const res = await request(app)
        .post("/api/ai/chat")
        .set("Cookie", [`token=${userToken}`])
        .send({ message: "I am having severe pain and heavy bleeding" })

      expect(res.status).toBe(200)
      expect(res.body.data.safetyStatus).toBe("MEDICAL_ATTENTION_RECOMMENDED")
      expect(res.body.data.urgent).toBe(true)
      expect(res.body.data.message).toMatch(/medical emergency|medical attention/)

      // Verify persistence of safetyStatus
      const msg = await prisma.aIMessage.findUnique({
        where: { id: res.body.data.messageId }
      })
      expect(msg?.safetyStatus).toBe("MEDICAL_ATTENTION_RECOMMENDED")
    })

    it("should return NORMAL status on normal inputs", async () => {
      const res = await request(app)
        .post("/api/ai/chat")
        .set("Cookie", [`token=${userToken}`])
        .send({ message: "I have mild cramps today" })

      expect(res.status).toBe(200)
      expect(res.body.data.safetyStatus).toBe("NORMAL")
      expect(res.body.data.urgent).toBeFalsy()
      expect(res.body.data.message).not.toMatch(/medical emergency/)
    })
  })
})
