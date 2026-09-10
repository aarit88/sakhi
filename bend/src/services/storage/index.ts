import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export interface StorageProvider {
  uploadFile(fileBuffer: Buffer, mimetype: string, originalName: string): Promise<string>
  getFileUrl(fileId: string): Promise<string>
  deleteFile(fileId: string): Promise<void>
}

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string

  constructor() {
    this.uploadDir = path.join(__dirname, "../../../uploads")
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  async uploadFile(fileBuffer: Buffer, mimetype: string, originalName: string): Promise<string> {
    const ext = path.extname(originalName) || (mimetype === "application/pdf" ? ".pdf" : ".jpg")
    const filename = `${uuidv4()}${ext}`
    const filepath = path.join(this.uploadDir, filename)
    fs.writeFileSync(filepath, fileBuffer)
    return filename // Return local identifier
  }

  async getFileUrl(fileId: string): Promise<string> {
    return `/uploads/${fileId}`
  }

  async deleteFile(fileId: string): Promise<void> {
    const filepath = path.join(this.uploadDir, fileId)
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }
  }
}

// Factory
export const getStorageProvider = (): StorageProvider => {
  const providerType = process.env.STORAGE_PROVIDER || "local"
  if (providerType === "gcs") {
    // Lazy require to avoid breaking local dev if not installed or configured
    const { GCSStorageProvider } = require("./gcs")
    return new GCSStorageProvider()
  }
  return new LocalStorageProvider()
}
