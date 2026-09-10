export type SafetyStatus = "NORMAL" | "MEDICAL_ATTENTION_RECOMMENDED"

export interface AIRequest {
  message: string
  context: string
  history?: Array<{ role: "user" | "assistant"; content: string }>
}

export interface AIResponse {
  message: string
  safetyStatus: SafetyStatus
  sections?: Array<{
    title: string
    content: string
  }>
  traditionalGuidance?: {
    enabled: boolean
    disclaimer: string
    suggestions: string[]
  }
  urgent?: boolean
}

export interface AIProvider {
  generateResponse(request: AIRequest): Promise<AIResponse>
}
