import { NextRequest, NextResponse } from "next/server"
import { initialHealthData } from "@/lib/healthStore"

export async function GET() {
  return NextResponse.json({ success: true, data: initialHealthData.hydration })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const newEntry = {
    id: `h-${Date.now().toString(36)}`,
    amount: Number(body.amount) || 250,
    date: new Date().toISOString(),
  }
  initialHealthData.hydration.unshift(newEntry)
  return NextResponse.json({ success: true, data: newEntry }, { status: 201 })
}
