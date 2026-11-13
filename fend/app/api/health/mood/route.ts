import { NextRequest, NextResponse } from "next/server"
import { initialHealthData } from "@/lib/healthStore"

export async function GET() {
  return NextResponse.json({ success: true, data: initialHealthData.mood })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const newEntry = {
    id: `m-${Date.now().toString(36)}`,
    mood: body.mood || "Balanced",
    note: body.note || "",
    date: new Date().toISOString(),
  }
  initialHealthData.mood.unshift(newEntry)
  return NextResponse.json({ success: true, data: newEntry }, { status: 201 })
}
