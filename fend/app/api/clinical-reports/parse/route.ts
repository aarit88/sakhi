import { NextRequest, NextResponse } from "next/server"
import { parseClinicalReport } from "@/lib/reportParser"
import { reportsStore } from "@/lib/reportsStore"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { rawText, sourceLabel, patientContext } = body

    if (!rawText || typeof rawText !== "string") {
      return NextResponse.json({ message: "rawText is required" }, { status: 400 })
    }

    const parsedData = parseClinicalReport(rawText, patientContext || {})
    const createdAt = new Date().toISOString()
    const reportId = `rep-${Date.now().toString(36)}`

    const newReport = {
      id: reportId,
      title: sourceLabel || "Manual Report Entry",
      createdAt,
      status: "COMPLETED",
      fileUrl: "",
      extractedData: JSON.stringify(parsedData),
    }

    reportsStore.unshift(newReport)

    return NextResponse.json(
      {
        parsedAt: createdAt,
        stored: true,
        privacy: "Private",
        ...parsedData,
      },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: "Failed to parse clinical report" }, { status: 500 })
  }
}
