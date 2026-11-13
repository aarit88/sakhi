import { NextRequest, NextResponse } from "next/server"
import { initialHealthData } from "@/lib/healthStore"

export async function GET() {
  return NextResponse.json({ success: true, data: initialHealthData.symptoms })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  
  // Standardized contract: type & severity are required
  const type = body.type || body.symptom
  const severity = body.severity

  if (!type || typeof type !== "string" || !type.trim()) {
    return NextResponse.json(
      { success: false, message: "Validation error: 'type' is required and cannot be empty." },
      { status: 400 }
    )
  }

  if (!severity || typeof severity !== "string" || !severity.trim()) {
    return NextResponse.json(
      { success: false, message: "Validation error: 'severity' is required and cannot be empty." },
      { status: 400 }
    )
  }

  const newEntry = {
    id: `sym-${Date.now().toString(36)}`,
    type: type.trim(),
    symptom: type.trim(), // backward-compatibility alias for legacy UI readers
    severity: severity.trim(),
    date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
    notes: body.notes || undefined,
  }

  initialHealthData.symptoms.unshift(newEntry)
  return NextResponse.json({ success: true, data: newEntry }, { status: 201 })
}
