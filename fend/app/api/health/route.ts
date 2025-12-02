import { type NextRequest, NextResponse } from "next/server"

// Mock health data - In production, use a real database
const healthData = {
  userId: "user-001",
  currentCycle: {
    day: 14,
    phase: "ovulation",
    nextPeriod: "2024-01-15",
    cycleLength: 28,
  },
  vitals: {
    heartRate: 72,
    bloodPressure: "120/80",
    temperature: 98.6,
    weight: 65.5,
  },
  symptoms: [
    { date: "2024-01-01", type: "cramps", severity: "mild" },
    { date: "2024-01-01", type: "mood", severity: "moderate" },
    { date: "2024-01-02", type: "fatigue", severity: "low" },
  ],
  mood: [
    { date: "2024-01-01", score: 7, notes: "Feeling good" },
    { date: "2024-01-02", score: 8, notes: "Great energy" },
  ],
  sleep: [
    { date: "2024-01-01", hours: 7.5, quality: 85 },
    { date: "2024-01-02", hours: 8.2, quality: 92 },
  ],
  activity: [
    { date: "2024-01-01", steps: 8432, calories: 2100 },
    { date: "2024-01-02", steps: 9156, calories: 2250 },
  ],
  hydration: [
    { date: "2024-01-01", intake: 2.1, target: 2.5 },
    { date: "2024-01-02", intake: 2.4, target: 2.5 },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let responseData = healthData

    // Filter by type if specified
    if (type && type !== "all") {
      responseData = {
        ...healthData,
        [type]: healthData[type as keyof typeof healthData],
      }
    }

    // In a real app, you would filter by date range here

    return NextResponse.json({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch health data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ success: false, error: "Type and data are required" }, { status: 400 })
    }

    // Add timestamp to the data
    const timestampedData = {
      ...data,
      date: data.date || new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
    }

    // Add to the appropriate array
    if (Array.isArray(healthData[type as keyof typeof healthData])) {
      ;(healthData[type as keyof typeof healthData] as any[]).push(timestampedData)
    } else {
      // For non-array data like vitals or currentCycle
      healthData[type as keyof typeof healthData] = {
        ...healthData[type as keyof typeof healthData],
        ...timestampedData,
      }
    }

    return NextResponse.json({
      success: true,
      data: timestampedData,
      message: `${type} data added successfully`,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to add health data" }, { status: 500 })
  }
}
