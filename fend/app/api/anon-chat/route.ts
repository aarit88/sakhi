import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  const message: string | undefined = body?.message

  // Here you could:
  // - store the message in a database
  // - forward it to another user via WebSocket
  // - send notifications, etc.

  console.log("Anonymous message received:", message)

  return NextResponse.json({
    status: "ok",
    received: true,
    message: "Anonymous reply stored/forwarded successfully.",
  })
}
