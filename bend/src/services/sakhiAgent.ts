export type ChatIntent =
  | "cycle"
  | "pregnancy"
  | "mental-health"
  | "infection"
  | "nutrition"
  | "report"
  | "emergency"
  | "general"

export type SafetyLevel = "normal" | "caution" | "urgent"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type ChatAgentResult = {
  reply: string
  intent: ChatIntent
  safetyLevel: SafetyLevel
  suggestions: string[]
  resources: string[]
  disclaimer: string
}

const disclaimer =
  "Sakhi gives education and triage support, not a diagnosis. Please consult a qualified clinician for medical decisions."

const emergencyPatterns = [
  /suicid|self[-\s]?harm|kill myself|end my life/i,
  /chest pain|can't breathe|cannot breathe|shortness of breath/i,
  /faint(?:ed|ing)?|unconscious|seizure/i,
  /heavy bleeding|soak(?:ing)? (?:a )?pad|bleeding through/i,
  /severe (?:abdominal|pelvic|stomach) pain/i,
  /pregnan(?:t|cy).*(bleeding|severe pain|dizziness)/i,
  /fever.*(stiff neck|confusion|rash)/i,
]

const intentRules: Array<{ intent: ChatIntent; patterns: RegExp[] }> = [
  {
    intent: "cycle",
    patterns: [/period|menstrual|cycle|cramp|pcos|pms|flow|spotting|ovulat/i],
  },
  {
    intent: "pregnancy",
    patterns: [/pregnan|missed period|morning sickness|positive test|contracept|emergency pill/i],
  },
  {
    intent: "mental-health",
    patterns: [/anxiety|panic|stress|depress|mood|sleep|overwhelm|lonely/i],
  },
  {
    intent: "infection",
    patterns: [/itch|burning|discharge|uti|urine|odor|infection|yeast|rash/i],
  },
  {
    intent: "nutrition",
    patterns: [/diet|nutrition|weight|iron|protein|vitamin|meal|deficien|anemia/i],
  },
  {
    intent: "report",
    patterns: [/report|blood test|cbc|thyroid|hemoglobin|hba1c|glucose|cholesterol|scan/i],
  },
]

const redactions: Array<[RegExp, string]> = [
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email removed]"],
  [/\b(?:\+?\d[\s-]?){8,14}\b/g, "[phone removed]"],
]

export function redactSensitiveText(text: string) {
  return redactions.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), text)
}

function detectIntent(message: string): ChatIntent {
  if (emergencyPatterns.some((pattern) => pattern.test(message))) return "emergency"

  const match = intentRules.find((rule) => rule.patterns.some((pattern) => pattern.test(message)))
  return match?.intent ?? "general"
}

function buildReply(intent: ChatIntent, message: string): Pick<ChatAgentResult, "reply" | "safetyLevel" | "suggestions" | "resources"> {
  if (intent === "emergency") {
    return {
      safetyLevel: "urgent",
      reply:
        "This may need urgent care. Please contact local emergency services or go to the nearest emergency department now. If you are with someone you trust, ask them to stay with you while you get help.",
      suggestions: [
        "Share your symptoms, when they started, and any medicines taken with the clinician.",
        "If bleeding is heavy, note how many pads are soaked per hour.",
        "Do not drive yourself if you feel faint, confused, or unsafe.",
      ],
      resources: ["Emergency department", "Local emergency number", "Trusted family member or friend"],
    }
  }

  if (intent === "cycle") {
    return {
      safetyLevel: "normal",
      reply:
        "Cycle changes can happen because of stress, illness, weight change, PCOS, thyroid imbalance, contraception, or pregnancy. Track the start date, flow, pain level, clots, and any new symptoms for this cycle. If pain is severe, bleeding is very heavy, or periods stop for 3 months without a clear reason, it is worth seeing a gynecologist.",
      suggestions: [
        "Log your last period start date and usual cycle length.",
        "Use heat, hydration, gentle movement, and clinician-approved pain relief for cramps.",
        "Take a pregnancy test if your period is late and pregnancy is possible.",
      ],
      resources: ["Gynecologist", "Cycle tracker", "Clinical report parser for CBC/thyroid markers"],
    }
  }

  if (intent === "pregnancy") {
    return {
      safetyLevel: "caution",
      reply:
        "If pregnancy is possible, a home urine test is usually most helpful after a missed period, and a blood beta-hCG can detect pregnancy earlier. Bleeding, one-sided pelvic pain, shoulder pain, fainting, or severe dizziness during possible pregnancy needs urgent medical review.",
      suggestions: [
        "Note the first day of your last period.",
        "Repeat a urine pregnancy test in 48 hours if the first result is unclear.",
        "Avoid starting medicines or supplements in pregnancy without clinical advice.",
      ],
      resources: ["Gynecologist", "Pregnancy test", "Emergency care for bleeding or severe pain"],
    }
  }

  if (intent === "mental-health") {
    return {
      safetyLevel: /suicid|self[-\s]?harm|hopeless/i.test(message) ? "urgent" : "caution",
      reply:
        "I am glad you said this out loud. For the next few minutes, try one small stabilizing step: slow breathing, drink water, sit somewhere safer, or message one trusted person. If you might harm yourself or cannot stay safe, please contact emergency services or a crisis helpline right now.",
      suggestions: [
        "Try 4 slow breaths: inhale for 4 counts, exhale for 6 counts.",
        "Write down what changed today and what support you need in one sentence.",
        "Reach out to a counselor, doctor, or trusted person if this keeps coming back.",
      ],
      resources: ["Local crisis helpline", "Counselor", "Trusted contact"],
    }
  }

  if (intent === "infection") {
    return {
      safetyLevel: "caution",
      reply:
        "Burning urine, itching, unusual discharge, odor, pelvic pain, or fever can point to different infections, and treatment depends on the cause. Avoid self-medicating with antibiotics. A urine test or vaginal swab may be needed, especially if symptoms are new, recurrent, or painful.",
      suggestions: [
        "Track fever, pelvic pain, discharge color, odor, and burning while urinating.",
        "Drink water and avoid irritants such as scented washes.",
        "Seek care quickly for fever, back pain, pregnancy, or blood in urine.",
      ],
      resources: ["Gynecologist", "Urine routine/culture", "Local clinic"],
    }
  }

  if (intent === "nutrition") {
    return {
      safetyLevel: "normal",
      reply:
        "Nutrition support depends on your goal and labs. For many women, iron, vitamin D, B12, protein, hydration, and regular meals are common focus areas. If you have fatigue, hair fall, heavy periods, dizziness, or cravings for ice/clay, a CBC, ferritin, B12, vitamin D, and thyroid check can be useful.",
      suggestions: [
        "Pair iron-rich foods with vitamin C and avoid tea/coffee right with iron-heavy meals.",
        "Aim for protein in each meal: dal, eggs, paneer, curd, fish, chicken, tofu, or sprouts.",
        "Upload or paste lab values in the report parser for a structured summary.",
      ],
      resources: ["Dietitian", "CBC/ferritin test", "Vitamin D and B12 testing"],
    }
  }

  if (intent === "report") {
    return {
      safetyLevel: "normal",
      reply:
        "You can use the Clinical Report Parser to extract values from CBC, thyroid, glucose, lipid, liver, kidney, vitamin, and iron reports. It flags values against typical adult female reference ranges and gives questions to discuss with a clinician.",
      suggestions: [
        "Upload a clear image or paste the OCR text from your report.",
        "Check whether the lab has its own reference range printed next to each value.",
        "Do not change medication based only on an automated parser.",
      ],
      resources: ["Clinical report parser", "Doctor review", "Original lab reference ranges"],
    }
  }

  return {
    safetyLevel: "normal",
    reply:
      "Tell me a little more about what is happening: when it started, your age range, whether pregnancy is possible, pain or fever level, medicines taken, and any report values you have. I will help you sort what may be routine, what should be watched, and what needs a clinician.",
    suggestions: [
      "Share symptoms in a timeline.",
      "Mention any red flags like severe pain, fever, fainting, or heavy bleeding.",
      "Use the report parser if you have blood test values.",
    ],
    resources: ["Sakhi chat", "Clinical report parser", "Qualified clinician"],
  }
}

export function createSakhiAgentReply(message: string, history: ChatMessage[] = []): ChatAgentResult {
  const cleanMessage = redactSensitiveText(message).trim()
  const intent = detectIntent(cleanMessage)
  const result = buildReply(intent, cleanMessage)

  const historyContext =
    history.length > 0
      ? " I am keeping this anonymous and using only the context you shared in this chat."
      : ""

  return {
    intent,
    safetyLevel: result.safetyLevel,
    reply: `${result.reply}${historyContext}`,
    suggestions: result.suggestions,
    resources: result.resources,
    disclaimer,
  }
}
