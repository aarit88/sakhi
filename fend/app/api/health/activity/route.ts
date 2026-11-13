import { NextRequest, NextResponse } from "next/server"
import { initialHealthData } from "@/lib/healthStore"

export async function GET() {
  return NextResponse.json({ success: true, data: initialHealthData.activity })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const newEntry = {
    id: `a-${Date.now().toString(36)}`,
    steps: Number(body.steps) || 5000,
    type: body.type || "Walking",
    duration: Number(body.duration) || 30,
    date: new Date().toISOString(),
  }
  initialHealthData.activity.unshift(newEntry)
  return NextResponse.json({ success: true, data: newEntry }, { status: 201 })
}
