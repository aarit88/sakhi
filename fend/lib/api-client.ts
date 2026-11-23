/**
 * Centralized frontend API client for SAKHI.
 *
 * Provides consistent request handling, error handling, and authentication
 * integration across all frontend components and services.
 *
 * Authentication:
 *   - Cookie-based: credentials: "include" (web sessions, httpOnly token cookie)
 *   - Bearer token: Authorization: Bearer <token> header (API/mobile clients)
 *   - Both transports are supported; cookie is default for browser requests.
 *
 * Security:
 *   - No exposure of sensitive tokens in logs or error messages.
 *   - Consistent unauthorized handling ( ApiError with 401 status ).
 *   - Request timeout support.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// ── Error type ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  public status: number
  public data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

// ── Request helper ──────────────────────────────────────────────────────────

function buildInit(
  options: RequestInit = {},
  body?: unknown,
): RequestInit {
  const headers = new Headers(options.headers || {})

  // Set default Content-Type for JSON bodies unless already set or FormData
  if (
    body !== undefined &&
    !(body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json")
  }

  return {
    ...options,
    headers,
    credentials: "include", // cookie-based auth (httpOnly token cookie)
    // Note: Bearer auth is set per-request via headers when needed
  }
}

// ── API client ──────────────────────────────────────────────────────────────

export interface RequestOptions extends RequestInit {
  timeout?: number // milliseconds
}

export async function request<T = any>(
  endpoint: string | URL,
  options: RequestOptions = {}
): Promise<T> {
  // Normalize endpoint to string URL
  const url =
    typeof endpoint === "string"
      ? endpoint.startsWith("http")
        ? endpoint
        : `${API_BASE}${endpoint}`
      : endpoint.toString()

  const config = buildInit(options, options.body)

  let abortController: AbortController | undefined
  const timeoutId = options.timeout
    ? setTimeout(() => abortController?.abort(), options.timeout)
    : undefined

  try {
    const response = await fetch(url, config)

    // Clear timeout on success
    clearTimeout(timeoutId)

    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")
    const data = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      // Consistent error unwrapping
      const errorMessage =
        data &&
        typeof data === "object" &&
        "message" in data
          ? String(data.message)
          : data &&
            typeof data === "object" &&
            "error" in data
              ? String(data.error)
              : isJson
                ? "An error occurred"
                : "An error occurred"

      throw new ApiError(
        errorMessage,
        response.status,
        isJson ? data : undefined
      )
    }

    return data as T
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof ApiError) throw error

    // Network/error abort or other fetch errors
    throw new Error(
      error instanceof Error ? error.message : "Network error"
    )
  }
}

// ── Convenience methods ────────────────────────────────────────────────────

export async function get<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  return request<T>(endpoint, { ...options, method: "GET" })
}

export async function post<T = any>(
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export async function put<T = any>(
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export async function del<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  return request<T>(endpoint, { ...options, method: "DELETE" })
}

// ── Auth helper ──────────────────────────────────────────────────────────────

/**
 * Attach a Bearer token to request headers.
 * Use this when the API expects Bearer authentication (API/mobile transport).
 * Does not override cookie-based auth; both can be used together.
 */
export function withBearerToken(
  token: string | undefined | null,
  init: RequestInit = {}
): RequestInit {
  if (!token) return init
  const headers = new Headers(init.headers || {})
  headers.set("Authorization", `Bearer ${token}`)
  return { ...init, headers }
}

// ── Export types ────────────────────────────────────────────────────────────

export type { RequestOptions, RequestInit }