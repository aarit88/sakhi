import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30"

    // Mock AI-generated insights
    const insights = {
      wellnessScore: 92,
      trends: {
        sleep: {
          average: 7.8,
          trend: "improving",
          change: "+0.3h",
        },
        mood: {
          average: 8.2,
          trend: "stable",
          change: "+0.1",
        },
        activity: {
          average: 8432,
          trend: "improving",
          change: "+12%",
        },
        hydration: {
          average: 2.3,
          trend: "excellent",
          change: "+0.2L",
        },
      },
      predictions: [
        {
          type: "cycle",
          prediction: "Next period expected in 14 days",
          confidence: 95,
          recommendations: ["Track symptoms", "Prepare comfort items"],
        },
        {
          type: "mood",
          prediction: "Mood may dip slightly in 2-3 days",
          confidence: 78,
          recommendations: ["Plan relaxing activities", "Ensure adequate sleep"],
        },
        {
          type: "energy",
          prediction: "Energy levels expected to remain high",
          confidence: 88,
          recommendations: ["Maintain current routine", "Consider light exercise"],
        },
      ],
      recommendations: [
        {
          category: "nutrition",
          title: "Iron-Rich Foods",
          description: "Consider adding spinach and lean meats to your diet",
          priority: "high",
          reason: "Approaching menstrual phase",
        },
        {
          category: "activity",
          title: "Gentle Exercise",
          description: "Light yoga or walking can help with upcoming symptoms",
          priority: "medium",
          reason: "Historical pattern analysis",
        },
        {
          category: "wellness",
          title: "Stress Management",
          description: "Try meditation or deep breathing exercises",
          priority: "medium",
          reason: "Mood optimization",
        },
      ],
      patterns: [
        {
          pattern: "Sleep quality improves 3 days before period",
          confidence: 92,
          actionable: "Maintain current bedtime routine",
        },
        {
          pattern: "Hydration correlates with mood scores",
          confidence: 87,
          actionable: "Continue excellent hydration habits",
        },
        {
          pattern: "Activity levels peak mid-cycle",
          confidence: 84,
          actionable: "Plan intensive workouts for days 12-16",
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: insights,
      period: `${period} days`,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to generate insights" }, { status: 500 })
  }
}
