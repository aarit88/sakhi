"use client"

import { useEffect } from "react"

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            if (process.env.NODE_ENV === "development") {
              console.log("[SAKHI PWA] ServiceWorker registered with scope:", registration.scope)
            }
          })
          .catch((error) => {
            if (process.env.NODE_ENV === "development") {
              console.error("[SAKHI PWA] ServiceWorker registration failed:", error)
            }
          })
      })
    }
  }, [])
}
