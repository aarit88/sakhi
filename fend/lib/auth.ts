import { cookies } from "next/headers"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

const DEFAULT_USER: AuthUser = {
  id: "user-sakhi-001",
  email: "priya.sharma@example.com",
  name: "Priya Sharma",
  role: "USER"
}

// In-memory users for session persistence across hot calls
const usersStore = new Map<string, AuthUser>()
usersStore.set(DEFAULT_USER.email, DEFAULT_USER)

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const sessionEmail = cookieStore.get("sakhi_user_email")?.value
  if (sessionEmail && usersStore.has(sessionEmail)) {
    return usersStore.get(sessionEmail)!
  }
  // Default to demo user so the app is immediately usable in AI Studio
  return DEFAULT_USER
}

export async function setAuthSession(user: AuthUser) {
  usersStore.set(user.email, user)
  const cookieStore = await cookies()
  cookieStore.set("sakhi_user_email", user.email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  })
}

export async function clearAuthSession() {
  const cookieStore = await cookies()
  cookieStore.delete("sakhi_user_email")
}
