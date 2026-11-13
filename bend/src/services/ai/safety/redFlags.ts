import { SafetyStatus } from "../types"

// Deterministic keywords and phrases indicating potential medical emergencies
const EMERGENCY_KEYWORDS = [
  "severe pain", "suicide", "kill myself", "want to die", "heavy bleeding", 
  "fainting", "passed out", "can't breathe", "chest pain", "emergency",
  "loss of consciousness", "unconscious", "heart attack", "stroke",
  "fever with pelvic pain", "rapidly worsening"
]

export interface SafetyCheckResult {
  status: SafetyStatus
  urgent: boolean
  triggerMessage?: string
}

export function evaluateSafety(input: string): SafetyCheckResult {
  const lowerInput = input.toLowerCase()
  
  for (const keyword of EMERGENCY_KEYWORDS) {
    if (lowerInput.includes(keyword)) {
      return {
        status: "MEDICAL_ATTENTION_RECOMMENDED",
        urgent: true,
        triggerMessage: "If you are experiencing a medical emergency or severe symptoms, please seek immediate professional medical attention or contact local emergency services. SAKHI cannot diagnose or treat medical emergencies."
      }
    }
  }

  return {
    status: "NORMAL",
    urgent: false
  }
}
