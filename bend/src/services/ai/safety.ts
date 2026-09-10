export const checkSafety = async (query: string): Promise<boolean> => {
  // Simple keyword blocklist for now
  const blockedTerms = ["suicide", "harm myself", "kill myself", "illegal drugs"]
  const lowerQuery = query.toLowerCase()

  for (const term of blockedTerms) {
    if (lowerQuery.includes(term)) {
      return false
    }
  }

  return true
}

export const checkReportSafety = async (text: string): Promise<boolean> => {
  const redFlags = ["malignant", "carcinoma", "heart attack", "myocardial infarction", "stroke", "hemorrhage", "leukemia", "critical"]
  const lowerText = text.toLowerCase()
  
  for (const flag of redFlags) {
    if (lowerText.includes(flag)) {
      return false // Red flag found
    }
  }
  
  return true // Safe
}
