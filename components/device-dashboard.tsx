"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Power, Thermometer, Droplets, Lightbulb, Wifi, Smartphone } from "lucide-react"


// Hook to handle magnetic button effects
function useMagneticEffect(ref: React.RefObject<HTMLButtonElement>, strength = 40) {
  const [transform, setTransform] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = e.clientX - (rect.left + rect.width / 2)
      const y = e.clientY - (rect.top + rect.height / 2)
      setTransform({ x: x / strength, y: y / strength })
    }

    const handleMouseLeave = () => {
      setTransform({ x: 0, y: 0 })
    }

    const node = ref.current
    if (node) {
      node.addEventListener("mousemove", handleMouseMove)
      node.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (node) {
        node.removeEventListener("mousemove", handleMouseMove)
        node.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [ref, strength])

  return {
    transform,
    handlers: {},
  }
}

export default function DeviceDashboard() {
  const [devices, setDevices] = useState([
    { id: "1", name: "Temperature Sensor", icon: Thermometer, status: "active" },
    { id: "2", name: "Humidity Sensor", icon: Droplets, status: "inactive" },
    { id: "3", name: "Light Sensor", icon: Lightbulb, status: "active" },
    { id: "4", name: "WiFi Module", icon: Wifi, status: "active" },
    { id: "5", name: "Control App", icon: Smartphone, status: "inactive" },
  ])

  const [isConnecting, setIsConnecting] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])

  const syncButtonRef = useRef<HTMLButtonElement>(null)
  const { transform: syncTransform, handlers: syncHandlers } = useMagneticEffect(syncButtonRef, 30)

  // ✅ Toggle single device
  const handleDeviceToggle = (deviceId: string) => {
    setIsConnecting(true)
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((device) => {
          if (device.id === deviceId) {
            const newStatus = device.status === "active" ? "inactive" : "active"
            addNotification(`${device.name} ${newStatus === "active" ? "activated" : "deactivated"}`)
            return { ...device, status: newStatus }
          }
          return device
        }),
      )
      setIsConnecting(false)
    }, 1000)
  }

  // ✅ Toggle all devices at once
  const handleSyncAll = () => {
    setIsConnecting(true)
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((device) => ({
          ...device,
          status: device.status === "active" ? "inactive" : "active",
        })),
      )
      setIsConnecting(false)
      addNotification("All devices synchronized")
    }, 1000)
  }

  // ✅ Notifications with auto-dismiss
  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, message])
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1))
    }, 3000)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((note, index) => (
          <div
            key={index}
            className="bg-pink-100 border border-pink-300 text-pink-800 px-4 py-2 rounded-lg shadow-lg animate-fade-in"
          >
            {note}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Device Dashboard</h1>
        <Button
          ref={syncButtonRef}
          variant="outline"
          className="flex flex-col items-center p-6 h-auto bg-transparent magnetic-strong transition-all duration-300 hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 group"
          style={{ transform: `translate(${syncTransform.x}px, ${syncTransform.y}px)` }}
          {...syncHandlers}
          onClick={handleSyncAll}
        >
          <Power className="w-6 h-6 mb-2 text-gray-600 group-hover:text-pink-500 transition-colors group-hover:animate-pulse" />
          <span className="text-sm font-medium">Sync All</span>
        </Button>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <Card
            key={device.id}
            className="group relative overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="relative">
                {device.icon ? (
                  <device.icon
                    className={`w-12 h-12 mb-4 transition-colors ${
                      device.status === "active"
                        ? "text-pink-500"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                ) : (
                  <span className="text-gray-400">⚠️</span>
                )}
                <span
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    device.status === "active" ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{device.name}</h3>
              <p
                className={`text-sm mb-4 ${
                  device.status === "active" ? "text-green-600" : "text-gray-500"
                }`}
              >
                {device.status === "active" ? "Active" : "Inactive"}
              </p>
              <Button
                variant={device.status === "active" ? "destructive" : "default"}
                onClick={() => handleDeviceToggle(device.id)}
                disabled={isConnecting}
                className="w-full"
              >
                {device.status === "active" ? "Deactivate" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
