import { AIProvider, AIRequest, AIResponse } from "./types"
import { GeminiProvider } from "./providers/gemini"

class MockAIProvider implements AIProvider {
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simplistic echo or rule-based response for dev/testing
    if (request.message.toLowerCase().includes("headache")) {
      return {
        message: "I understand you're experiencing a headache. Ensure you stay hydrated and get adequate rest.",
        safetyStatus: "NORMAL",
        traditionalGuidance: {
          enabled: true,
          disclaimer: "This is traditional Ayurvedic knowledge for educational purposes.",
          suggestions: [
            "Rub a little warm sesame oil on your temples.",
            "Drink warm cumin or ginger tea."
          ]
        }
      }
    }
    
    return {
      message: "I am Sakhi, your wellness companion. I received your message: '" + request.message + "'. Based on your context, I'm here to support your health journey.",
      safetyStatus: "NORMAL"
    }
  }
}

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "mock"
  if (provider === "gemini") {
    try {
      return new GeminiProvider()
    } catch (e: any) {
      console.error("Failed to initialize GeminiProvider, falling back to Mock:", e.message)
      return new MockAIProvider()
    }
  }
  return new MockAIProvider()
}
