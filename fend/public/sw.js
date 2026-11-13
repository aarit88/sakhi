// SAKHI Native Service Worker (PWA)
const CACHE_NAME = "sakhi-static-v1"
const OFFLINE_URL = "/offline"

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/favicon.ico",
  "/sakhi-chat-avatar.png"
]

// Install event: Pre-cache core offline assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// Activate event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event: Network-First for API / Private data; Stale-While-Revalidate for static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // 🔴 STRICT SECURITY RULE:
  // NEVER cache ANY /api/* routes (Auth, Health, Clinical Reports, AI, Anonymous Chat, Users, etc.)
  // All API requests MUST use NetworkOnly strategy to prevent sensitive medical/personal data caching.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request))
    return
  }

  // Navigation requests (HTML page loads): Try network first, fallback to /offline page
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME)
        const cachedOffline = await cache.match(OFFLINE_URL)
        return cachedOffline || fetch(event.request)
      })
    )
    return
  }

  // Static assets (_next/static, images, fonts): StaleWhileRevalidate strategy
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".svg")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request)
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone())
          }
          return networkResponse
        }).catch(() => null)

        return cachedResponse || fetchPromise || fetch(event.request)
      })
    )
    return
  }

  // Default fallback for other requests: Network only
  event.respondWith(fetch(event.request))
})
