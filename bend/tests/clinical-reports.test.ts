import request from "supertest"
import app from "../src/server"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"

const prisma = new PrismaClient()

describe("Clinical Reports API", () => {
  let userId: string;
  let userToken: string;
  let userBId: string;
  let userBToken: string;
  const testEmail = `ocrtest_${uuidv4()}@example.com`;
  const testEmailB = `ocrtestB_${uuidv4()}@example.com`;
  const password = "password123";

  beforeAll(async () => {
    // User A
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password, name: "OCR Test User" })
    userId = res.body.user.id
    const tokenMatch = res.header["set-cookie"][0].match(/token=([^;]+)/)
    userToken = tokenMatch ? tokenMatch[1] : ""

    // User B
    const resB = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmailB, password, name: "OCR Test User B" })
    userBId = resB.body.user.id
    const tokenMatchB = resB.header["set-cookie"][0].match(/token=([^;]+)/)
    userBToken = tokenMatchB ? tokenMatchB[1] : ""
  })

  afterAll(async () => {
    await prisma.medicalReport.deleteMany({
      where: { userId: { in: [userId, userBId] } }
    });
    await prisma.user.deleteMany({
      where: { email: { in: [testEmail, testEmailB] } }
    });
    await prisma.$disconnect()
  })

  describe("1. Medical Report OCR Parse endpoint", () => {
    it("should parse text and save to db securely", async () => {
      const res = await request(app)
        .post("/api/clinical-reports/parse")
        .set("Cookie", [`token=${userToken}`])
        .send({ rawText: "HEMOGLOBIN 11.0 g/dL\nGLUCOSE 100 mg/dL", sourceLabel: "Test Lab" })

      expect(res.status).toBe(201)
      expect(res.body.stored).toBe(true)
      expect(res.body.markers.length).toBeGreaterThan(0)
      
      const report = await prisma.medicalReport.findFirst({
        where: { userId: userId, title: "Test Lab" }
      })
      expect(report).not.toBeNull()
      expect(report?.parsedText).toContain("HEMOGLOBIN")
    })

    it("should flag severe medical conditions", async () => {
      const res = await request(app)
        .post("/api/clinical-reports/parse")
        .set("Cookie", [`token=${userToken}`])
        .send({ rawText: "patient shows signs of malignant carcinoma", sourceLabel: "Bad Lab" })

      expect(res.status).toBe(201)
      expect(res.body.alerts.length).toBeGreaterThan(0)
      expect(res.body.alerts[0].severity).toBe("urgent")
    })

    it("should block unauthenticated access", async () => {
      const res = await request(app)
        .post("/api/clinical-reports/parse")
        .send({ rawText: "HEMOGLOBIN 11.0 g/dL" })

      expect(res.status).toBe(401)
    })
  })

  describe("2. Medical Report Upload and Magic Bytes", () => {
    it("should allow valid PDF upload", async () => {
      // Magic bytes for PDF: %PDF
      const validPdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0x00, 0x00]);
      const res = await request(app)
        .post("/api/clinical-reports/upload")
        .set("Cookie", [`token=${userToken}`])
        .attach("report", validPdfBuffer, { filename: "test.pdf", contentType: "application/pdf" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should reject invalid magic bytes even if mimetype is valid", async () => {
      // Magic bytes for an executable or random text, not a PDF
      const spoofedBuffer = Buffer.from("MZ is an executable header, definitely not a PDF...");
      const res = await request(app)
        .post("/api/clinical-reports/upload")
        .set("Cookie", [`token=${userToken}`])
        .attach("report", spoofedBuffer, { filename: "malware.pdf", contentType: "application/pdf" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Magic byte");
    });
  });

  describe("3. Secure Deletion API", () => {
    let reportId: string;

    beforeAll(async () => {
      // Create a report for User A
      const res = await request(app)
        .post("/api/clinical-reports/parse")
        .set("Cookie", [`token=${userToken}`])
        .send({ rawText: "To be deleted", sourceLabel: "Delete Me" });
      
      const report = await prisma.medicalReport.findFirst({
        where: { userId, title: "Delete Me" }
      });
      reportId = report!.id;
    });

    it("should prevent User B from deleting User A's report", async () => {
      const res = await request(app)
        .delete(`/api/clinical-reports/${reportId}`)
        .set("Cookie", [`token=${userBToken}`]);

      expect(res.status).toBe(403);
    });

    it("should prevent unauthenticated deletion", async () => {
      const res = await request(app)
        .delete(`/api/clinical-reports/${reportId}`);

      expect(res.status).toBe(401);
    });

    it("should allow User A to delete their own report", async () => {
      const res = await request(app)
        .delete(`/api/clinical-reports/${reportId}`)
        .set("Cookie", [`token=${userToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await prisma.medicalReport.findUnique({ where: { id: reportId } });
      expect(check).toBeNull();
    });

    it("should return 404 for missing report", async () => {
      const res = await request(app)
        .delete(`/api/clinical-reports/nonexistent-id`)
        .set("Cookie", [`token=${userToken}`]);

      expect(res.status).toBe(404);
    });
  });
})
