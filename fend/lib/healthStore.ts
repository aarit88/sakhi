export interface MoodEntry {
  id: string
  mood: string
  note?: string
  date: string
}

export interface SleepEntry {
  id: string
  duration: number
  quality: string
  date: string
}

export interface HydrationEntry {
  id: string
  amount: number
  date: string
}

export interface ActivityEntry {
  id: string
  steps: number
  type: string
  duration: number
  date: string
}

export interface SymptomEntry {
  id: string
  symptom: string
  severity: "mild" | "moderate" | "severe"
  date: string
}

export interface CycleEntry {
  id: string
  phase: string
  day: number
  flow?: string
  symptoms?: string[]
  date: string
}

export const initialHealthData = {
  mood: [
    { id: "m1", mood: "Energetic", note: "Felt motivated after morning yoga", date: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: "m2", mood: "Calm", note: "Productive working session", date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: "m3", mood: "Happy", note: "Met with friends", date: new Date(Date.now() - 3 * 86400000).toISOString() },
  ],
  sleep: [
    { id: "s1", duration: 7.5, quality: "Deep", date: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: "s2", duration: 7.0, quality: "Restful", date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: "s3", duration: 8.2, quality: "Excellent", date: new Date(Date.now() - 3 * 86400000).toISOString() },
  ],
  hydration: [
    { id: "h1", amount: 2200, date: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: "h2", amount: 2400, date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: "h3", amount: 1900, date: new Date(Date.now() - 3 * 86400000).toISOString() },
  ],
  activity: [
    { id: "a1", steps: 8420, type: "Walking & Pilates", duration: 45, date: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: "a2", steps: 6900, type: "Surya Namaskar", duration: 30, date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: "a3", steps: 7800, type: "Brisk Walk", duration: 40, date: new Date(Date.now() - 3 * 86400000).toISOString() },
  ],
  symptoms: [
    { id: "sym1", symptom: "Mild Cramps", severity: "mild", date: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: "sym2", symptom: "Bloating", severity: "mild", date: new Date(Date.now() - 2 * 86400000).toISOString() },
  ],
  cycle: [
    { id: "c1", phase: "Ovulatory Phase", day: 14, flow: "None", symptoms: ["Mild pelvic twinges"], date: new Date().toISOString() },
  ]
}
