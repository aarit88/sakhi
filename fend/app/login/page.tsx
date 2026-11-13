"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/AuthContext"
import toast from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await apiClient.post("/api/auth/login", { email, password })
      await refreshUser()
      toast.success("Login successful! Welcome back 😊")
      router.push("/")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-white px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-pink-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back to <span className="text-pink-500">SAKHI</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-pink-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-pink-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white"
              placeholder="••••••••"
            />
          </div>



          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-pink-600 font-medium hover:underline"
          >
            Create one
          </button>
        </div>
      </div>
    </div>
  )
}
