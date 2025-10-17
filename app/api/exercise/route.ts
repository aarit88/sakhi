import { NextResponse } from "next/server"

// Mock exercise data
const exercises = [
  {
    id: "morning-flow",
    name: "Morning Flow",
    type: "yoga",
    duration: 15,
    difficulty: "beginner",
    calories: 50,
    completed: false,
    lastCompleted: null,
  },
  {
    id: "cardio-burst",
    name: "Cardio Burst",
    type: "fitness",
    duration: 10,
    difficulty: "intermediate",
    calories: 100,
    completed: false,
    lastCompleted: null,
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: exercises,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch exercises" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { exerciseId, duration, caloriesBurned } = body

    // Mock completion logic
    const exercise = exercises.find((e) => e.id === exerciseId)
    if (exercise) {
      exercise.completed = true
      exercise.lastCompleted = new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: "Exercise completed successfully",
      data: {
        exerciseId,
        duration,
        caloriesBurned,
        completedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to complete exercise" }, { status: 500 })
  }
}
