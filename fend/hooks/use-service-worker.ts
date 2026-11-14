"use client"

import { useEffect } from "react"

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    if (process.env.NODE_ENV !== "production") {
      // Prevent stale Next.js dev chunks from being cached by SW
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          reg.unregister().catch(() => {})
        }
      })
      return
    }

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }
    window.addEventListener("load", onLoad)
    return () => window.removeEventListener("load", onLoad)
  }, [])
}
