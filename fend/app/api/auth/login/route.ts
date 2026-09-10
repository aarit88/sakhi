import { NextRequest, NextResponse } from "next/server"
import { setAuthSession, AuthUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = body.email || "priya.sharma@example.com"
    const name = email.split("@")[0] || "Sakhi Member"

    const user: AuthUser = {
      id: `user-${Date.now().toString(36)}`,
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      role: "USER",
    }

    await setAuthSession(user)

    return NextResponse.json({
      success: true,
      user,
      message: "Login successful",
    })
  } catch (err: any) {
    return NextResponse.json({ message: "Login failed" }, { status: 500 })
  }
}
