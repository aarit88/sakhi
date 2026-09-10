import { NextRequest, NextResponse } from "next/server"
import { reportsStore } from "@/lib/reportsStore"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const index = reportsStore.findIndex((r) => r.id === id)
    if (index !== -1) {
      reportsStore.splice(index, 1)
    }
    return NextResponse.json({ success: true, message: "Report deleted successfully" })
  } catch (err) {
    return NextResponse.json({ message: "Failed to delete report" }, { status: 500 })
  }
}
