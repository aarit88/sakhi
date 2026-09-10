import { NextRequest, NextResponse } from "next/server"
import { initialHealthData } from "@/lib/healthStore"

export async function GET() {
  return NextResponse.json({ success: true, data: initialHealthData.sleep })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const newEntry = {
    id: `s-${Date.now().toString(36)}`,
    duration: Number(body.duration) || 7,
    quality: body.quality || "Good",
    date: new Date().toISOString(),
  }
  initialHealthData.sleep.unshift(newEntry)
  return NextResponse.json({ success: true, data: newEntry }, { status: 201 })
}
