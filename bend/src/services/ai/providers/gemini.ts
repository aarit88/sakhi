import { GoogleGenAI } from "@google/genai"
import { AIProvider, AIRequest, AIResponse } from "../types"

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.")
    }
    this.ai = new GoogleGenAI({ apiKey })
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      const chat = this.ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: request.context,
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              message: { type: "string" },
              safetyStatus: { type: "string", enum: ["NORMAL", "MEDICAL_ATTENTION_RECOMMENDED"] },
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" }
                  },
                  required: ["title", "content"]
                }
              },
              traditionalGuidance: {
                type: "object",
                properties: {
                  enabled: { type: "boolean" },
                  disclaimer: { type: "string" },
                  suggestions: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["enabled", "disclaimer", "suggestions"]
              }
            },
            required: ["message", "safetyStatus"]
          }
        }
      })

      // We need to inject history into the chat if available
      if (request.history && request.history.length > 0) {
        // GenAI chat sessions handle history internally but if we are passing history, 
        // we might want to just send it as context or manually create the history array.
        // For simplicity since SDK expects format, let's prepend history to the message context
        // if not natively supported by this basic call.
      }

      // We'll format the history into the prompt itself for simplicity in a stateless call, 
      // or we can just send the current message.
      let prompt = request.message
      if (request.history && request.history.length > 0) {
        prompt = "Conversation History:\n" + request.history.map(m => `${m.role}: ${m.content}`).join("\n") + "\n\nUser: " + request.message
      }

      const response = await chat.sendMessage({ message: prompt })
      const text = response.text
      
      if (!text) {
        throw new Error("Empty response from Gemini")
      }

      const parsed: AIResponse = JSON.parse(text)
      return parsed

    } catch (error: any) {
      console.error("Gemini Provider Error:", error)
      return {
        message: "I apologize, but I am currently experiencing technical difficulties processing your request. Please try again later.",
        safetyStatus: "NORMAL"
      }
    }
  }
}
