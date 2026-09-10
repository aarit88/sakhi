import { NextRequest, NextResponse } from "next/server"
import { setAuthSession, AuthUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = body.email || "newuser@example.com"
    const name = body.name || email.split("@")[0] || "Sakhi Member"

    const user: AuthUser = {
      id: `user-${Date.now().toString(36)}`,
      email,
      name,
      role: "USER",
    }

    await setAuthSession(user)

    return NextResponse.json(
      {
        success: true,
        user,
        message: "Registration successful",
      },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json({ message: "Registration failed" }, { status: 500 })
  }
}
