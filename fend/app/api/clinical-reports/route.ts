import { NextResponse } from "next/server"
import { reportsStore } from "@/lib/reportsStore"

export async function GET() {
  return NextResponse.json({
    success: true,
    reports: reportsStore,
  })
}
