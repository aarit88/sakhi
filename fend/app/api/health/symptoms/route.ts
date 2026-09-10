import { NextRequest, NextResponse } from "next/server"
import { initialHealthData } from "@/lib/healthStore"

export async function GET() {
  return NextResponse.json({ success: true, data: initialHealthData.symptoms })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const newEntry = {
    id: `sym-${Date.now().toString(36)}`,
    symptom: body.symptom || "General Fatigue",
    severity: body.severity || "mild",
    date: new Date().toISOString(),
  }
  initialHealthData.symptoms.unshift(newEntry)
  return NextResponse.json({ success: true, data: newEntry }, { status: 201 })
}
