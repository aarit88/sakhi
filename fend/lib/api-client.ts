const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

export class ApiError extends Error {
  public status: number
  public data: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

export const apiClient = {
  async fetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`
    
    const headers = new Headers(options.headers || {})
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json")
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include",
    }

    try {
      const response = await fetch(url, config)
      
      const isJson = response.headers.get("content-type")?.includes("application/json")
      const data = isJson ? await response.json() : await response.text()

      if (!response.ok) {
        throw new ApiError(
          data.message || data.error || "An error occurred",
          response.status,
          data
        )
      }

      return data as T
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new Error(error instanceof Error ? error.message : "Network error")
    }
  },

  async get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.fetch(endpoint, { ...options, method: "GET" })
  },

  async post<T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.fetch(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  async put<T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.fetch(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.fetch(endpoint, { ...options, method: "DELETE" })
  }
}
