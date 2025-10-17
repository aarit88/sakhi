"use client"

import { useState, useEffect } from "react"

interface HealthData {
  currentCycle: {
    day: number
    phase: string
    nextPeriod: string
    cycleLength: number
  }
  vitals: {
    heartRate: number
    bloodPressure: string
    temperature: number
    weight: number
  }
  symptoms: Array<{
    date: string
    type: string
    severity: string
  }>
  mood: Array<{
    date: string
    score: number
    notes: string
  }>
  sleep: Array<{
    date: string
    hours: number
    quality: number
  }>
  activity: Array<{
    date: string
    steps: number
    calories: number
  }>
  hydration: Array<{
    date: string
    intake: number
    target: number
  }>
}

export function useHealthData() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHealthData()
  }, [])

  const fetchHealthData = async (type?: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (type) params.append("type", type)
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const response = await fetch(`/api/health?${params}`)
      const result = await response.json()

      if (result.success) {
        setHealthData(result.data)
        setError(null)
      } else {
        setError(result.error || "Failed to fetch health data")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const addHealthData = async (type: string, data: any) => {
    try {
      const response = await fetch("/api/health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, data }),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh health data after adding
        await fetchHealthData()
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add data failed")
      throw err
    }
  }

  return {
    healthData,
    loading,
    error,
    fetchHealthData,
    addHealthData,
  }
}
