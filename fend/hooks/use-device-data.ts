"use client"

import { useState, useEffect } from "react"

interface Device {
  id: string
  name: string
  type: string
  status: string
  battery: number
  lastUpdated: string
  settings: Record<string, any>
  [key: string]: any
}

export function useDeviceData() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/devices")
      const result = await response.json()

      if (result.success) {
        setDevices(result.data)
        setError(null)
      } else {
        setError(result.error || "Failed to fetch devices")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const updateDevice = async (deviceId: string, updates: Partial<Device>) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      const result = await response.json()

      if (result.success) {
        setDevices((prev) => prev.map((device) => (device.id === deviceId ? result.data : device)))
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
      throw err
    }
  }

  const addDevice = async (deviceData: Omit<Device, "id" | "lastUpdated">) => {
    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deviceData),
      })

      const result = await response.json()

      if (result.success) {
        setDevices((prev) => [...prev, result.data])
        return result.data
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add device failed")
      throw err
    }
  }

  return {
    devices,
    loading,
    error,
    fetchDevices,
    updateDevice,
    addDevice,
  }
}
