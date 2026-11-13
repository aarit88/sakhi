export type MarkerStatus = "low" | "normal" | "high" | "critical" | "unknown"

export type PatientContext = {
  age?: number
  pregnant?: boolean
}

export type ParsedMarker = {
  key: string
  label: string
  category: string
  value: number
  rawValue: string
  unit: string
  detectedUnit?: string
  status: MarkerStatus
  referenceRange: string
  finding: string
}

export type ReportAlert = {
  severity: "info" | "caution" | "urgent"
  title: string
  message: string
}

export type ClinicalReportResult = {
  markers: ParsedMarker[]
  alerts: ReportAlert[]
  summary: string
  possibleFocusAreas: string[]
  suggestedQuestions: string[]
  rawTextPreview: string
  disclaimer: string
}

type MarkerDefinition = {
  key: string
  label: string
  category: string
  aliases: string[]
  unit: string
  unitPattern?: string
  min?: number
  max?: number
  criticalLow?: number
  criticalHigh?: number
  lowFinding?: string
  highFinding?: string
  normalFinding: string
  normalize?: (value: number, unit?: string) => number
}

const numberPattern = "([-+]?\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?|[-+]?\\d+(?:\\.\\d+)?)"
const defaultUnitPattern = "[a-zA-Z%/\\^0-9.uLmcgdl-]+"

const markerDefinitions: MarkerDefinition[] = [
  {
    key: "hemoglobin",
    label: "Hemoglobin",
    category: "CBC",
    aliases: ["hemoglobin", "haemoglobin", "hb"],
    unit: "g/dL",
    unitPattern: "g\\s*/?\\s*dL|gm\\s*%|g%",
    min: 12,
    max: 15.5,
    criticalLow: 7,
    criticalHigh: 18,
    lowFinding: "Low hemoglobin can fit anemia and should be interpreted with ferritin, B12, folate, and bleeding history.",
    highFinding: "High hemoglobin can happen with dehydration or other medical causes and needs clinician review if persistent.",
    normalFinding: "Hemoglobin is within a typical adult female range.",
  },
  {
    key: "rbc",
    label: "RBC Count",
    category: "CBC",
    aliases: ["rbc count", "red blood cell count", "rbc"],
    unit: "million/uL",
    min: 3.8,
    max: 5.1,
    lowFinding: "Low RBC count may support anemia when hemoglobin or hematocrit are also low.",
    highFinding: "High RBC count may need review with hydration status, oxygen levels, and hemoglobin.",
    normalFinding: "RBC count is within a typical adult female range.",
  },
  {
    key: "wbc",
    label: "WBC Count",
    category: "CBC",
    aliases: ["total leukocyte count", "total leucocyte count", "white blood cell count", "wbc count", "tlc", "wbc"],
    unit: "10^3/uL",
    min: 4,
    max: 11,
    criticalLow: 2,
    criticalHigh: 30,
    normalize: (value) => (value > 1000 ? value / 1000 : value),
    lowFinding: "Low WBC can increase infection risk and should be reviewed with the differential count.",
    highFinding: "High WBC can occur with infection, inflammation, stress, steroids, or other causes.",
    normalFinding: "WBC count is within a typical adult range.",
  },
  {
    key: "platelets",
    label: "Platelet Count",
    category: "CBC",
    aliases: ["platelet count", "platelets", "plt"],
    unit: "10^3/uL",
    min: 150,
    max: 450,
    criticalLow: 50,
    criticalHigh: 1000,
    normalize: (value) => (value > 1000 ? value / 1000 : value),
    lowFinding: "Low platelets can increase bleeding risk and should be discussed promptly, especially with bruising or bleeding.",
    highFinding: "High platelets can be reactive to inflammation, iron deficiency, or other conditions and needs context.",
    normalFinding: "Platelet count is within a typical adult range.",
  },
  {
    key: "neutrophils",
    label: "Neutrophils",
    category: "CBC Differential",
    aliases: ["neutrophils", "neutrophil"],
    unit: "%",
    unitPattern: "%",
    min: 40,
    max: 75,
    lowFinding: "Low neutrophil percentage should be interpreted with the absolute neutrophil count and infection history.",
    highFinding: "High neutrophil percentage can occur with infection, inflammation, stress, or steroid use.",
    normalFinding: "Neutrophil percentage is within a typical range.",
  },
  {
    key: "lymphocytes",
    label: "Lymphocytes",
    category: "CBC Differential",
    aliases: ["lymphocytes", "lymphocyte"],
    unit: "%",
    unitPattern: "%",
    min: 20,
    max: 45,
    lowFinding: "Low lymphocyte percentage can occur with stress, steroid use, or some infections.",
    highFinding: "High lymphocyte percentage can occur with viral infections or other immune responses.",
    normalFinding: "Lymphocyte percentage is within a typical range.",
  },
  {
    key: "esr",
    label: "ESR",
    category: "Inflammation",
    aliases: ["erythrocyte sedimentation rate", "esr"],
    unit: "mm/hr",
    unitPattern: "mm\\s*/?\\s*hr|mm\\s*1st\\s*hr",
    min: 0,
    max: 20,
    highFinding: "High ESR is a nonspecific inflammation marker and needs symptom context.",
    normalFinding: "ESR is within a typical adult female range.",
  },
  {
    key: "tsh",
    label: "TSH",
    category: "Thyroid",
    aliases: ["thyroid stimulating hormone", "serum tsh", "tsh"],
    unit: "mIU/L",
    unitPattern: "mIU\\s*/?\\s*L|uIU\\s*/?\\s*mL|microIU\\s*/?\\s*mL",
    min: 0.4,
    max: 4,
    criticalLow: 0.05,
    criticalHigh: 10,
    lowFinding: "Low TSH can fit hyperthyroid patterns or over-replacement and should be checked with free T4/T3.",
    highFinding: "High TSH can fit hypothyroid patterns and should be reviewed with free T4 and symptoms.",
    normalFinding: "TSH is within a common adult reference range.",
  },
  {
    key: "fasting_glucose",
    label: "Fasting Glucose",
    category: "Glucose",
    aliases: ["fasting blood sugar", "fasting plasma glucose", "fasting glucose", "fbs"],
    unit: "mg/dL",
    unitPattern: "mg\\s*/?\\s*dL",
    min: 70,
    max: 99,
    criticalLow: 54,
    criticalHigh: 300,
    lowFinding: "Low fasting glucose can cause shakiness, sweating, confusion, or faintness and should be reviewed if symptomatic.",
    highFinding: "High fasting glucose can suggest impaired glucose regulation and should be confirmed by a clinician.",
    normalFinding: "Fasting glucose is within a typical target range.",
  },
  {
    key: "random_glucose",
    label: "Random Glucose",
    category: "Glucose",
    aliases: ["random blood sugar", "random plasma glucose", "random glucose", "rbs"],
    unit: "mg/dL",
    unitPattern: "mg\\s*/?\\s*dL",
    min: 70,
    max: 140,
    criticalLow: 54,
    criticalHigh: 300,
    lowFinding: "Low random glucose may need urgent attention if symptoms are present.",
    highFinding: "High random glucose should be interpreted with meal timing and HbA1c.",
    normalFinding: "Random glucose is within a common non-fasting range.",
  },
  {
    key: "hba1c",
    label: "HbA1c",
    category: "Glucose",
    aliases: ["glycated hemoglobin", "glycosylated hemoglobin", "hba1c", "hb a1c"],
    unit: "%",
    unitPattern: "%",
    min: 4,
    max: 5.6,
    highFinding: "High HbA1c can suggest prediabetes or diabetes depending on the level and clinical context.",
    normalFinding: "HbA1c is within a typical non-diabetic range.",
  },
  {
    key: "vitamin_d",
    label: "Vitamin D",
    category: "Vitamins",
    aliases: ["25 hydroxy vitamin d", "25-oh vitamin d", "vitamin d3", "vitamin d"],
    unit: "ng/mL",
    unitPattern: "ng\\s*/?\\s*mL",
    min: 30,
    max: 100,
    lowFinding: "Low vitamin D is common and should be discussed for supplementation and sunlight/diet planning.",
    highFinding: "High vitamin D can be unsafe and should be reviewed with supplement intake and calcium levels.",
    normalFinding: "Vitamin D is within a common target range.",
  },
  {
    key: "vitamin_b12",
    label: "Vitamin B12",
    category: "Vitamins",
    aliases: ["vitamin b12", "b12"],
    unit: "pg/mL",
    unitPattern: "pg\\s*/?\\s*mL",
    min: 200,
    max: 900,
    lowFinding: "Low B12 can contribute to fatigue, nerve symptoms, anemia, or brain fog.",
    highFinding: "High B12 is often supplement-related but should be interpreted clinically if unexplained.",
    normalFinding: "Vitamin B12 is within a common reference range.",
  },
  {
    key: "ferritin",
    label: "Ferritin",
    category: "Iron",
    aliases: ["serum ferritin", "ferritin"],
    unit: "ng/mL",
    unitPattern: "ng\\s*/?\\s*mL",
    min: 15,
    max: 150,
    lowFinding: "Low ferritin suggests low iron stores and is relevant with heavy periods, fatigue, hair fall, or anemia.",
    highFinding: "High ferritin can rise with inflammation, liver disease, iron overload, or infection.",
    normalFinding: "Ferritin is within a typical adult female range.",
  },
  {
    key: "creatinine",
    label: "Creatinine",
    category: "Kidney",
    aliases: ["serum creatinine", "creatinine"],
    unit: "mg/dL",
    unitPattern: "mg\\s*/?\\s*dL",
    min: 0.6,
    max: 1.1,
    criticalHigh: 2,
    lowFinding: "Low creatinine can reflect lower muscle mass and is usually interpreted with overall context.",
    highFinding: "High creatinine can suggest reduced kidney filtering and should be reviewed with eGFR and urine findings.",
    normalFinding: "Creatinine is within a typical adult female range.",
  },
  {
    key: "alt",
    label: "ALT/SGPT",
    category: "Liver",
    aliases: ["sgpt", "alt"],
    unit: "U/L",
    unitPattern: "U\\s*/?\\s*L|IU\\s*/?\\s*L",
    min: 7,
    max: 35,
    criticalHigh: 200,
    lowFinding: "Low ALT is usually not clinically important by itself.",
    highFinding: "High ALT can reflect liver irritation and should be reviewed with AST, bilirubin, medicines, alcohol, and viral markers.",
    normalFinding: "ALT is within a typical adult female range.",
  },
  {
    key: "ast",
    label: "AST/SGOT",
    category: "Liver",
    aliases: ["sgot", "ast"],
    unit: "U/L",
    unitPattern: "U\\s*/?\\s*L|IU\\s*/?\\s*L",
    min: 8,
    max: 40,
    criticalHigh: 200,
    lowFinding: "Low AST is usually not clinically important by itself.",
    highFinding: "High AST can reflect liver, muscle, or other tissue irritation and should be interpreted with ALT.",
    normalFinding: "AST is within a typical adult range.",
  },
  {
    key: "total_cholesterol",
    label: "Total Cholesterol",
    category: "Lipids",
    aliases: ["total cholesterol", "cholesterol total"],
    unit: "mg/dL",
    unitPattern: "mg\\s*/?\\s*dL",
    max: 199,
    highFinding: "High total cholesterol should be reviewed with LDL, HDL, triglycerides, family history, and overall risk.",
    normalFinding: "Total cholesterol is within a common desirable range.",
  },
  {
    key: "ldl",
    label: "LDL Cholesterol",
    category: "Lipids",
    aliases: ["ldl cholesterol", "ldl-c", "ldl"],
    unit: "mg/dL",
    unitPattern: "mg\\s*/?\\s*dL",
    max: 100,
    highFinding: "High LDL can increase long-term cardiovascular risk and should be discussed with a clinician.",
    normalFinding: "LDL is within a common target range.",
  },
  {
    key: "hdl",
    label: "HDL Cholesterol",
    category: "Lipids",
    aliases: ["hdl cholesterol", "hdl-c", "hdl"],
    unit: "mg/dL",
    unitPattern: "mg\\s*/?\\s*dL",
    min: 50,
    lowFinding: "Low HDL can increase cardiovascular risk and is interpreted with the full lipid profile.",
    normalFinding: "HDL is at or above a common protective target for women.",
  },
  {
    key: "triglycerides",
    label: "Triglycerides",
    category: "Lipids",
    aliases: ["triglycerides", "tg"],
    unit: "mg/dL",
    unitPattern: "mg\\s*/?\\s*dL",
    max: 150,
    criticalHigh: 500,
    highFinding: "High triglycerides can be affected by diet, insulin resistance, thyroid status, alcohol, or genetics.",
    normalFinding: "Triglycerides are within a common target range.",
  },
]

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function aliasToPattern(alias: string) {
  return escapeRegExp(alias).replace(/\s+/g, "\\s+").replace(/-/g, "[-\\s]?")
}

function parseNumber(rawValue: string) {
  return Number(rawValue.replace(/,/g, ""))
}

function findMarkerValue(text: string, definition: MarkerDefinition) {
  for (const alias of definition.aliases) {
    const aliasPattern = aliasToPattern(alias)
    const unitPattern = definition.unitPattern ?? defaultUnitPattern
    const pattern = new RegExp(`(?:^|[^A-Za-z0-9])${aliasPattern}[^\\d\\n-]{0,45}${numberPattern}\\s*(${unitPattern})?`, "im")
    const match = text.match(pattern)
    if (!match) continue

    const rawValue = match[1]
    const detectedUnit = match[2]?.trim()
    const parsedValue = parseNumber(rawValue)
    if (!Number.isFinite(parsedValue)) continue

    const normalizedValue = definition.normalize ? definition.normalize(parsedValue, detectedUnit) : parsedValue
    return {
      rawValue,
      value: Number(normalizedValue.toFixed(2)),
      detectedUnit,
    }
  }

  return null
}

function statusFor(value: number, definition: MarkerDefinition): MarkerStatus {
  if (definition.criticalLow !== undefined && value <= definition.criticalLow) return "critical"
  if (definition.criticalHigh !== undefined && value >= definition.criticalHigh) return "critical"
  if (definition.min !== undefined && value < definition.min) return "low"
  if (definition.max !== undefined && value > definition.max) return "high"
  return "normal"
}

function referenceRange(definition: MarkerDefinition) {
  if (definition.min !== undefined && definition.max !== undefined) {
    return `${definition.min}-${definition.max} ${definition.unit}`
  }
  if (definition.min !== undefined) return `>= ${definition.min} ${definition.unit}`
  if (definition.max !== undefined) return `<= ${definition.max} ${definition.unit}`
  return `See lab range (${definition.unit})`
}

function findingFor(status: MarkerStatus, definition: MarkerDefinition) {
  if (status === "low") return definition.lowFinding ?? `${definition.label} is below the expected range.`
  if (status === "high") return definition.highFinding ?? `${definition.label} is above the expected range.`
  if (status === "critical") {
    if (definition.criticalLow !== undefined && definition.lowFinding) return `Critical low range. ${definition.lowFinding}`
    if (definition.criticalHigh !== undefined && definition.highFinding) return `Critical high range. ${definition.highFinding}`
    return `${definition.label} is in a critical range and should be reviewed urgently.`
  }
  return definition.normalFinding
}

function buildFocusAreas(markers: ParsedMarker[]) {
  const abnormal = markers.filter((marker) => marker.status !== "normal")
  const focus = new Set<string>()

  if (abnormal.some((marker) => ["hemoglobin", "rbc", "ferritin", "vitamin_b12"].includes(marker.key))) {
    focus.add("Anemia, iron stores, or B12 status")
  }
  if (abnormal.some((marker) => marker.category === "Thyroid")) {
    focus.add("Thyroid function")
  }
  if (abnormal.some((marker) => marker.category === "Glucose")) {
    focus.add("Glucose regulation")
  }
  if (abnormal.some((marker) => marker.category === "Lipids")) {
    focus.add("Cardiometabolic risk")
  }
  if (abnormal.some((marker) => marker.category === "Liver")) {
    focus.add("Liver enzymes")
  }
  if (abnormal.some((marker) => marker.category === "Kidney")) {
    focus.add("Kidney function")
  }
  if (abnormal.some((marker) => ["wbc", "neutrophils", "lymphocytes", "esr"].includes(marker.key))) {
    focus.add("Infection or inflammation context")
  }
  if (abnormal.some((marker) => marker.category === "Vitamins")) {
    focus.add("Vitamin status and supplementation plan")
  }

  return Array.from(focus)
}

function buildAlerts(markers: ParsedMarker[], context?: PatientContext): ReportAlert[] {
  const alerts: ReportAlert[] = []
  const critical = markers.filter((marker) => marker.status === "critical")
  const abnormal = markers.filter((marker) => marker.status === "low" || marker.status === "high")

  if (critical.length > 0) {
    alerts.push({
      severity: "urgent",
      title: "Urgent review recommended",
      message: `${critical.map((marker) => marker.label).join(", ")} reached a critical threshold in this parser. Please contact a clinician urgently, especially if symptoms are present.`,
    })
  }

  if (abnormal.length > 0) {
    alerts.push({
      severity: "caution",
      title: "Abnormal values found",
      message: `${abnormal.length} marker${abnormal.length === 1 ? "" : "s"} are outside typical adult female ranges. Compare with the printed lab reference range and symptoms.`,
    })
  }

  if (context?.pregnant) {
    alerts.push({
      severity: "info",
      title: "Pregnancy context",
      message: "Pregnancy changes several reference ranges. Please interpret this report with an obstetrician or qualified clinician.",
    })
  }

  if (markers.length === 0) {
    alerts.push({
      severity: "info",
      title: "No markers detected",
      message: "The parser could not detect supported lab values. Try a clearer OCR scan or paste the report text manually.",
    })
  }

  return alerts
}

function buildQuestions(markers: ParsedMarker[], focusAreas: string[]) {
  const questions = [
    "Which values are most important for my symptoms and age?",
    "Should any of these tests be repeated or confirmed with another test?",
    "Do my lab's printed reference ranges differ from the typical ranges used here?",
  ]

  if (focusAreas.includes("Anemia, iron stores, or B12 status")) {
    questions.push("Could heavy periods, ferritin, B12, or diet be contributing to anemia-like symptoms?")
  }
  if (focusAreas.includes("Thyroid function")) {
    questions.push("Should I check free T4, free T3, thyroid antibodies, or adjust thyroid medication?")
  }
  if (focusAreas.includes("Glucose regulation")) {
    questions.push("Do these glucose values require HbA1c, fasting repeat testing, or lifestyle/medicine changes?")
  }
  if (focusAreas.includes("Cardiometabolic risk")) {
    questions.push("What lipid target is appropriate for my family history and overall risk?")
  }
  if (markers.some((marker) => marker.status === "critical")) {
    questions.push("Does any value require same-day care or urgent treatment?")
  }

  return questions
}

export function parseClinicalReport(rawText: string, context?: PatientContext): ClinicalReportResult {
  const normalizedText = rawText
    .replace(/\r/g, "\n")
    .replace(/[|]/g, " ")
    .replace(/[ \t]+/g, " ")
    .slice(0, 20_000)

  const markers = markerDefinitions
    .map((definition) => {
      const detected = findMarkerValue(normalizedText, definition)
      if (!detected) return null

      const status = statusFor(detected.value, definition)
      const marker: ParsedMarker = {
        key: definition.key,
        label: definition.label,
        category: definition.category,
        value: detected.value,
        rawValue: detected.rawValue,
        unit: definition.unit,
        detectedUnit: detected.detectedUnit,
        status,
        referenceRange: referenceRange(definition),
        finding: findingFor(status, definition),
      }
      return marker
    })
    .filter((marker): marker is ParsedMarker => marker !== null)

  const possibleFocusAreas = buildFocusAreas(markers)
  const alerts = buildAlerts(markers, context)
  const abnormalCount = markers.filter((marker) => marker.status !== "normal").length
  const summary =
    markers.length === 0
      ? "No supported lab markers were detected from the supplied OCR text."
      : `Detected ${markers.length} supported marker${markers.length === 1 ? "" : "s"}; ${abnormalCount} ${abnormalCount === 1 ? "is" : "are"} outside typical adult female ranges.`

  return {
    markers,
    alerts,
    summary,
    possibleFocusAreas,
    suggestedQuestions: buildQuestions(markers, possibleFocusAreas),
    rawTextPreview: normalizedText.slice(0, 800),
    disclaimer:
      "Automated report parsing can miss OCR errors and does not diagnose disease. Always compare with your lab's printed range and review abnormal or symptomatic results with a qualified clinician.",
  }
}

export function getSupportedMarkers() {
  return markerDefinitions.map((definition) => ({
    key: definition.key,
    label: definition.label,
    category: definition.category,
    unit: definition.unit,
    referenceRange: referenceRange(definition),
  }))
}
