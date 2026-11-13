import { AIResponse, AIRequest } from "./types"
import { getAIProvider } from "./provider"
import { evaluateSafety } from "./safety/redFlags"
import { buildUserContext } from "./tools/contextTools"
import { SAKHI_SYSTEM_PROMPT } from "./prompts/system"

export class AIOrchestrator {
  /**
   * Processes a user chat message.
   * Enforces safety first, fetches authorized scoped context, then generates response.
   */
  static async processChat(userId: string, message: string): Promise<AIResponse> {
    // 1. Deterministic Safety Check on Input
    const safetyResult = evaluateSafety(message)
    if (safetyResult.urgent && safetyResult.triggerMessage) {
      return {
        message: safetyResult.triggerMessage,
        safetyStatus: safetyResult.status,
        urgent: true
      }
    }

    // 2. Build Authorized Context (Scoped to userId)
    const context = await buildUserContext(userId)

    // 3. Prepare AI Request
    const request: AIRequest = {
      message: message,
      context: `${SAKHI_SYSTEM_PROMPT}\n\n${context}`
    }

    // 4. Generate Response via Provider
    const aiProvider = getAIProvider()
    let response: AIResponse
    try {
      response = await aiProvider.generateResponse(request)
    } catch (error) {
      return {
        message: "I'm having trouble connecting to my knowledge base right now. Please try again later.",
        safetyStatus: "NORMAL"
      }
    }

    // 5. Deterministic Safety Check on Output (Double guard)
    const outputSafety = evaluateSafety(response.message)
    if (outputSafety.urgent && outputSafety.triggerMessage) {
        return {
          message: "I apologize, but I must advise you to consult a healthcare professional regarding your symptoms.",
          safetyStatus: "MEDICAL_ATTENTION_RECOMMENDED",
          urgent: true
        }
    }

    return response
  }
}
