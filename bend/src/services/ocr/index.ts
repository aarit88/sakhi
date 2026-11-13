import { GoogleGenAI } from "@google/genai"

export interface OCRProvider {
  extractText(fileBuffer: Buffer, mimetype: string): Promise<string>
}

export class GeminiOCRProvider implements OCRProvider {
  private ai: GoogleGenAI

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. OCR will fall back to mock.")
      this.ai = null as any
    } else {
      this.ai = new GoogleGenAI({ apiKey })
    }
  }

  async extractText(fileBuffer: Buffer, mimetype: string): Promise<string> {
    if (!this.ai) {
      console.log(`[MockOCR] Extracting text from ${mimetype}...`)
      return "HEMOGLOBIN 12.5 g/dL\nGLUCOSE 95 mg/dL\nTHYROID TSH 2.1 mIU/L"
    }

    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                { text: "Extract all text from this medical report. Output only the exact text found in the document, preserving line breaks. Do not add any conversational filler or markdown formatting." },
                { inlineData: { mimeType: mimetype, data: fileBuffer.toString("base64") } }
              ]
            }
          ]
        })
        return response.text || ""
      } catch (err: any) {
        attempt++;
        const status = err?.status || err?.response?.status;
        
        // Transient failures usually have 429 (Rate Limit) or >= 500 (Server Errors)
        const isTransient = status === 429 || (status >= 500) || err.message?.includes('timeout') || err.message?.includes('network') || err.message?.includes('fetch');

        if (!isTransient || attempt >= maxAttempts) {
          console.error(`[GeminiOCRProvider] Final error after ${attempt} attempts:`, err?.message || "Unknown Error");
          throw new Error("Failed to extract text from document due to an AI service error.");
        }

        console.warn(`[GeminiOCRProvider] Transient error on attempt ${attempt}/${maxAttempts}. Retrying in ${Math.pow(2, attempt)}s...`);
        const delayMs = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    throw new Error("Failed to extract text from document using AI.");
  }
}

// Factory
export const getOCRProvider = (): OCRProvider => {
  return new GeminiOCRProvider()
}
