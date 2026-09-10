import { NextRequest, NextResponse } from "next/server"
import { createSakhiAgentReply } from "@/lib/sakhiAgent"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { message, history } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ message: "Message is required" }, { status: 400 })
    }

    const reply = createSakhiAgentReply(message, Array.isArray(history) ? history : [])
    return NextResponse.json(reply)
  } catch (error: any) {
    return NextResponse.json({ message: "Chat triage failed" }, { status: 500 })
  }
}
