import { NextRequest, NextResponse } from "next/server"
import { setAuthSession, AuthUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { email, password, name } = body

    if (!email || typeof email !== "string" || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const displayName = (name && typeof name === "string" && name.trim()) ? name.trim() : (cleanEmail.split("@")[0] || "Member")

    const user: AuthUser = {
      id: `user-${Date.now().toString(36)}`,
      email: cleanEmail,
      name: displayName,
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
