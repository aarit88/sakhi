import { Storage } from "@google-cloud/storage"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import { StorageProvider } from "./index"

export class GCSStorageProvider implements StorageProvider {
  private storage: Storage
  private bucketName: string

  constructor() {
    this.bucketName = process.env.GCS_BUCKET_NAME || ""
    const projectId = process.env.GCP_PROJECT_ID
    const clientEmail = process.env.GCP_CLIENT_EMAIL
    let privateKey = process.env.GCP_PRIVATE_KEY || ""
    
    // Handle multiline private key from env string
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n')
    }

    if (!this.bucketName || !projectId || !clientEmail || !privateKey) {
      console.error("[GCSStorageProvider] Missing GCP credentials in environment variables.")
      // We don't throw in constructor to prevent breaking the server on boot if missing,
      // but we warn so that local dev fails gracefully upon use.
    }

    this.storage = new Storage({
      projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey
      }
    })
  }

  async uploadFile(fileBuffer: Buffer, mimetype: string, originalName: string): Promise<string> {
    if (!this.bucketName) {
      throw new Error("GCS_BUCKET_NAME is not configured.")
    }

    const ext = path.extname(originalName) || (mimetype === "application/pdf" ? ".pdf" : ".jpg")
    const filename = `${uuidv4()}${ext}`
    
    const bucket = this.storage.bucket(this.bucketName)
    const file = bucket.file(filename)

    await file.save(fileBuffer, {
      metadata: { contentType: mimetype },
      resumable: false // Buffer uploads don't need resumable
    })

    return filename // Return the object key
  }

  async getFileUrl(fileId: string): Promise<string> {
    if (!this.bucketName) {
      return "" // Fallback if misconfigured
    }

    const bucket = this.storage.bucket(this.bucketName)
    const file = bucket.file(fileId)

    // Generate a signed URL that expires in 15 minutes
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000 // 15 minutes
    })

    return url
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.bucketName) return;

    try {
      const bucket = this.storage.bucket(this.bucketName)
      const file = bucket.file(fileId)
      await file.delete({ ignoreNotFound: true })
    } catch (err) {
      console.error(`[GCSStorageProvider] Failed to delete file ${fileId}:`, err)
      throw new Error(`Storage deletion failed for ${fileId}`)
    }
  }
}
