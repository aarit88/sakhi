import { cookies } from "next/headers"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

// In-memory sessions mapped by opaque session IDs (no raw email in cookies)
const sessionsStore = new Map<string, AuthUser>()

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("sakhi_session_id")?.value
  if (sessionId && sessionsStore.has(sessionId)) {
    return sessionsStore.get(sessionId)!
  }
  return null
}

export async function setAuthSession(user: AuthUser) {
  const sessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`
  sessionsStore.set(sessionId, user)

  const cookieStore = await cookies()
  cookieStore.set("sakhi_session_id", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  })
}

export async function clearAuthSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("sakhi_session_id")?.value
  if (sessionId) {
    sessionsStore.delete(sessionId)
  }
  cookieStore.delete("sakhi_session_id")
  // Clear any legacy plain email cookie if present
  cookieStore.delete("sakhi_user_email")
}
