import { NextRequest, NextResponse } from "next/server"
import { initialHealthData } from "@/lib/healthStore"

export async function GET() {
  return NextResponse.json({ success: true, data: initialHealthData.cycle })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const newEntry = {
    id: `c-${Date.now().toString(36)}`,
    phase: body.phase || "Follicular Phase",
    day: Number(body.day) || 1,
    flow: body.flow || "Medium",
    symptoms: Array.isArray(body.symptoms) ? body.symptoms : [],
    date: new Date().toISOString(),
  }
  initialHealthData.cycle.unshift(newEntry)
  return NextResponse.json({ success: true, data: newEntry }, { status: 201 })
}
