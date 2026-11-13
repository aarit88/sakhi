"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

// A generic hook factory to avoid repetitive code
function createHealthHook<T>(endpoint: string) {
  return function useHealthHook() {
    const [data, setData] = useState<T[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async (startDate?: string, endDate?: string) => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        
        const url = params.toString() ? `${endpoint}?${params}` : endpoint
        const result = await apiClient.get(url)

        if (result.success) {
          setData(result.data)
          setError(null)
        } else {
          setError(result.error || "Failed to fetch data")
        }
      } catch (err: any) {
        setError(err.message || "Network error occurred")
      } finally {
        setLoading(false)
      }
    }, [])

    const addData = async (payload: any) => {
      try {
        const result = await apiClient.post(endpoint, payload)
        if (result.success) {
          await fetchData()
          return result.data
        } else {
          throw new Error(result.error)
        }
      } catch (err: any) {
        setError(err.message || "Add data failed")
        throw err
      }
    }

    useEffect(() => {
      fetchData()
    }, [fetchData])

    return { data, loading, error, fetchData, addData }
  }
}

// Specific hooks
export const useMoodData = createHealthHook<any>("/api/health/mood")
export const useSleepData = createHealthHook<any>("/api/health/sleep")
export const useHydrationData = createHealthHook<any>("/api/health/hydration")
export const useActivityData = createHealthHook<any>("/api/health/activity")
export const useSymptomData = createHealthHook<any>("/api/health/symptoms")
export const useCycleData = createHealthHook<any>("/api/health/cycle")

// Summary hook
export function useHealthSummary() {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true)
      const result = await apiClient.get("/api/health")
      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError(result.error || "Failed to fetch health summary")
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return { data, loading, error, fetchSummary }
}
