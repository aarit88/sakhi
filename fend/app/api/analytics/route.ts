import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get("metric")
    const period = searchParams.get("period") || "30"

    // Mock analytics data
    const analyticsData = {
      cycle: [
        { day: 1, mood: 3, energy: 2, symptoms: 4 },
        { day: 5, mood: 4, energy: 3, symptoms: 2 },
        { day: 10, mood: 7, energy: 6, symptoms: 1 },
        { day: 14, mood: 8, energy: 8, symptoms: 1 },
        { day: 18, mood: 6, energy: 5, symptoms: 2 },
        { day: 22, mood: 4, energy: 4, symptoms: 3 },
        { day: 26, mood: 3, energy: 3, symptoms: 4 },
        { day: 28, mood: 4, energy: 4, symptoms: 3 },
      ],
      sleep: [
        { date: "Mon", hours: 7.5, quality: 85 },
        { date: "Tue", hours: 8.2, quality: 92 },
        { date: "Wed", hours: 6.8, quality: 78 },
        { date: "Thu", hours: 7.9, quality: 88 },
        { date: "Fri", hours: 7.2, quality: 82 },
        { date: "Sat", hours: 8.5, quality: 95 },
        { date: "Sun", hours: 8.1, quality: 90 },
      ],
      hydration: [
        { time: "6AM", intake: 0.2 },
        { time: "9AM", intake: 0.5 },
        { time: "12PM", intake: 1.2 },
        { time: "3PM", intake: 1.8 },
        { time: "6PM", intake: 2.3 },
        { time: "9PM", intake: 2.5 },
      ],
      devices: [
        { name: "Heat Pack", usage: 35, efficiency: 94 },
        { name: "Water Bottle", usage: 40, efficiency: 98 },
        { name: "Mood Light", usage: 25, efficiency: 91 },
      ],
      monthly: [
        { month: "Jan", wellness: 78, symptoms: 3.2, mood: 6.5 },
        { month: "Feb", wellness: 82, symptoms: 2.8, mood: 7.1 },
        { month: "Mar", wellness: 85, symptoms: 2.5, mood: 7.4 },
        { month: "Apr", wellness: 88, symptoms: 2.2, mood: 7.8 },
        { month: "May", wellness: 91, symptoms: 1.9, mood: 8.2 },
        { month: "Jun", wellness: 89, symptoms: 2.1, mood: 7.9 },
      ],
    }

    let responseData = analyticsData

    // Filter by metric if specified
    if (metric && metric !== "all") {
      responseData = {
        [metric]: analyticsData[metric as keyof typeof analyticsData],
      } as any
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      period: `${period} days`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 })
  }
}
