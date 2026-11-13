import { Router, Response } from "express"
import multer from "multer"
import { getSupportedMarkers, parseClinicalReport } from "../services/reportParser"
import { getStorageProvider } from "../services/storage"
import { getOCRProvider } from "../services/ocr"
import { requireAuth, AuthRequest } from "../middleware/authMiddleware"
import { checkReportSafety } from "../services/ai/safety"
import { createRateLimiter } from "../middleware/security"
import prisma from "../prisma"
import { isValidFileType } from "../utils/fileType"

const router = Router()

// Strict rate limit for OCR endpoints to prevent abuse (10 requests per 15 minutes)
const ocrRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: process.env.NODE_ENV === 'test' ? 100 : 10 })
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })
const storageProvider = getStorageProvider()
const ocrProvider = getOCRProvider()

// POST /api/clinical-reports/upload
router.post("/upload", requireAuth, ocrRateLimiter, upload.single("report"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const { mimetype, originalname, buffer } = req.file
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
    if (!validTypes.includes(mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only PDF, PNG, JPG allowed." })
    }

    const typeCheck = isValidFileType(buffer)
    if (!typeCheck.valid) {
      return res.status(400).json({ message: "Invalid file content. Magic byte validation failed." })
    }

    // 1. Upload to Storage
    const fileId = await storageProvider.uploadFile(buffer, mimetype, originalname)
    const fileUrl = await storageProvider.getFileUrl(fileId)

    // 2. Extract Text (OCR)
    const rawText = await ocrProvider.extractText(buffer, mimetype)

    // 3. Check Safety and Parse Clinical Report Data
    const isSafe = await checkReportSafety(rawText)
    const parsedData = parseClinicalReport(rawText, {})
    if (!isSafe) {
      parsedData.alerts.unshift({
        severity: "urgent",
        title: "Medical Attention Advised",
        message: "We detected terms in this report that may require professional medical interpretation. Please consult a doctor."
      })
    }

    // 4. Save to DB
    const report = await prisma.medicalReport.create({
      data: {
        userId: req.user!.userId,
        title: originalname,
        originalName: originalname,
        mimeType: mimetype,
        sizeBytes: req.file.size || buffer.length,
        fileUrl,
        parsedText: rawText,
        extractedData: JSON.stringify(parsedData),
        status: "COMPLETED"
      }
    })

    res.status(201).json({ success: true, report, parsedData })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// POST /api/clinical-reports/parse
router.post("/parse", requireAuth, ocrRateLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { rawText, sourceLabel, patientContext } = req.body
    
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ message: "rawText is required" })
    }

    const isSafe = await checkReportSafety(rawText)
    const parsedData = parseClinicalReport(rawText, patientContext || {})
    if (!isSafe) {
      parsedData.alerts.unshift({
        severity: "urgent",
        title: "Medical Attention Advised",
        message: "We detected terms in this report that may require professional medical interpretation. Please consult a doctor."
      })
    }

    const report = await prisma.medicalReport.create({
      data: {
        userId: req.user!.userId,
        title: sourceLabel || "Manual Entry",
        originalName: "manual_entry.txt",
        mimeType: "text/plain",
        sizeBytes: Buffer.byteLength(rawText, 'utf8'),
        fileUrl: "", // Required by schema, but no file is uploaded in /parse
        parsedText: rawText,
        extractedData: JSON.stringify(parsedData),
        status: "COMPLETED"
      }
    })

    // Return exact format expected by frontend
    res.status(201).json({
      parsedAt: report.createdAt.toISOString(),
      stored: true,
      privacy: "Private",
      ...parsedData
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
})

// GET /api/clinical-reports
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const reports = await prisma.medicalReport.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" }
    })
    
    // For GCS, we need to generate fresh signed URLs on the fly for each fetch
    const reportsWithUrls = await Promise.all(reports.map(async (r) => {
      // If fileUrl is a local path or empty, leave it. If it's a UUID/key (GCS), generate signed URL.
      if (r.fileUrl && !r.fileUrl.startsWith('/') && !r.fileUrl.startsWith('http')) {
        try {
          r.fileUrl = await storageProvider.getFileUrl(r.fileUrl)
        } catch (e) {
          // ignore, keep original
        }
      } else if (r.fileUrl && r.fileUrl.startsWith('/uploads/')) {
        // If it was stored locally, StorageProvider is LocalStorageProvider, getFileUrl prepends /uploads/
        // Actually, local provider stored just the filename in DB, but let's be safe.
        // Wait, local provider `uploadFile` returns `filename` (UUID.ext).
        try {
          r.fileUrl = await storageProvider.getFileUrl(r.fileUrl)
        } catch (e) {}
      } else if (r.fileUrl && !r.fileUrl.startsWith('http') && !r.fileUrl.startsWith('/')) {
        try {
          r.fileUrl = await storageProvider.getFileUrl(r.fileUrl)
        } catch (e) {}
      }
      return r
    }))

    res.json({ success: true, reports: reportsWithUrls })
  } catch (err) {
    res.status(500).json({ message: "Internal server error" })
  }
})

router.get("/markers", (_req, res) => {
  res.json(getSupportedMarkers())
})

// DELETE /api/clinical-reports/:id
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const reportId = req.params.id;
    const userId = req.user!.userId;

    const report = await prisma.medicalReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (report.fileUrl && !report.fileUrl.startsWith('http') && !report.fileUrl.startsWith('/')) {
      try {
        await storageProvider.deleteFile(report.fileUrl);
      } catch (err) {
        console.error(`Failed to delete file from storage for report ${reportId}:`, err);
        return res.status(500).json({ message: "Storage deletion failed, database record preserved." });
      }
    } else if (report.fileUrl && report.fileUrl.startsWith('/uploads/')) {
      // For local storage, the ID might be the filename itself or we can extract it.
      // But typically we don't have to support local delete perfectly for production, yet let's try.
      const filename = report.fileUrl.split('/').pop();
      if (filename) {
        try {
          await storageProvider.deleteFile(filename);
        } catch (err) {
          console.error(`Failed to delete local file for report ${reportId}:`, err);
        }
      }
    }

    try {
      await prisma.medicalReport.delete({
        where: { id: reportId }
      });
    } catch (err) {
      console.error(`Failed to delete database record for report ${reportId}:`, err);
      return res.status(500).json({ message: "Database deletion failed. Storage file was deleted." });
    }

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (err) {
    console.error("Delete report error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router
