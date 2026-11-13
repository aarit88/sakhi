export interface HistoricalReport {
  id: string
  title: string
  createdAt: string
  status: string
  fileUrl: string
  extractedData: string
}

// Initial demo reports so user sees historical comparisons immediately
export const reportsStore: HistoricalReport[] = [
  {
    id: "rep-demo-001",
    title: "Routine CBC & Thyroid Check",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: "COMPLETED",
    fileUrl: "",
    extractedData: JSON.stringify({
      markers: [
        {
          key: "hemoglobin",
          label: "Hemoglobin",
          category: "CBC",
          value: 11.2,
          unit: "g/dL",
          status: "low",
          referenceRange: "12 - 15.5 g/dL",
          finding: "Low hemoglobin can fit mild anemia. Suggest checking Ferritin and B12."
        },
        {
          key: "tsh",
          label: "TSH",
          category: "Thyroid",
          value: 3.4,
          unit: "mIU/L",
          status: "normal",
          referenceRange: "0.4 - 4.0 mIU/L",
          finding: "TSH is within normal target range."
        },
        {
          key: "ferritin",
          label: "Ferritin",
          category: "Iron",
          value: 12,
          unit: "ng/mL",
          status: "low",
          referenceRange: "15 - 150 ng/mL",
          finding: "Low iron stores. Dietary iron support or supplementation recommended under clinical guidance."
        }
      ],
      alerts: [
        {
          severity: "caution",
          title: "Borderline Iron Deficiency",
          message: "Hemoglobin and Ferritin are both below typical adult ranges. Discuss dietary adjustments with your clinician."
        }
      ],
      summary: "Mild iron deficiency anemia indicated by reduced hemoglobin and serum ferritin. Thyroid panel is within normal limits.",
      possibleFocusAreas: ["Iron-rich diet (spinach, lentils, beets)", "Vitamin C pairing", "Follow-up CBC in 8 weeks"],
      suggestedQuestions: [
        "Should I consider an oral iron supplement?",
        "Are heavy menstrual cycles contributing to my low ferritin?",
        "When should I repeat this blood test?"
      ],
      rawTextPreview: "Hemoglobin 11.2 g/dL\nTSH 3.4 mIU/L\nFerritin 12 ng/mL",
      disclaimer: "This automated parse is for educational reference only. Consult a doctor for diagnostic decisions."
    })
  }
]
