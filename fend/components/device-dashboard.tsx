"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Power, Thermometer, Droplets, Lightbulb, Wifi, Smartphone } from "lucide-react"

// Hook to handle magnetic button effects
function useMagneticEffect(ref: React.RefObject<HTMLButtonElement>, strength = 40) {
  const [transform, setTransform] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = e.clientX - (rect.left + rect.width / 2)
      const y = e.clientY - (rect.top + rect.height / 2)
      setTransform({ x: x / strength, y: y / strength })
    },
    [ref, strength],
  )

  const handleMouseLeave = useCallback(() => {
    setTransform({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
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
  }, [ref, handleMouseMove, handleMouseLeave])

  return transform
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
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null) // 🔋 which device is being toggled

  const syncButtonRef = useRef<HTMLButtonElement>(null)
  const syncTransform = useMagneticEffect(syncButtonRef, 3)

  // Toggle single device with small "loading" animation on that button
  const handleDeviceToggle = (deviceId: string) => {
    setIsConnecting(true)
    setActiveDeviceId(deviceId)
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
      setActiveDeviceId(null)
    }, 800)
  }

  // Toggles all devices to a single, unified state.
  const handleSyncAll = () => {
    setIsConnecting(true)
    setActiveDeviceId(null)
    setTimeout(() => {
      const areAllDevicesActive = devices.every((d) => d.status === "active")
      const newStatus = areAllDevicesActive ? "inactive" : "active"

      setDevices((prev) =>
        prev.map((device) => ({
          ...device,
          status: newStatus,
        })),
      )

      setIsConnecting(false)
      addNotification(`All devices ${newStatus === "active" ? "activated" : "deactivated"}`)
    }, 800)
  }

  // Notifications with auto-dismiss
  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, message])
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1))
    }, 3000)
  }

  return (
    // ✅ this id lets navbar links like href="#devices" scroll to this section
    <div id="devices" className="container mx-auto p-6 space-y-6">
      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
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
          className="flex flex-col items-center p-6 h-auto bg-transparent transition-all duration-300 hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 group disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ transform: `translate(${syncTransform.x}px, ${syncTransform.y}px)` }}
          onClick={handleSyncAll}
          disabled={isConnecting}
        >
          <Power className="w-6 h-6 mb-2 text-gray-600 group-hover:text-pink-500 transition-colors group-hover:animate-pulse" />
          <span className="text-sm font-medium">
            {isConnecting ? "Syncing..." : "Sync All"}
          </span>
        </Button>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => {
          const IconComponent = device.icon
          const isActive = device.status === "active"
          const isUpdating = isConnecting && activeDeviceId === device.id

          return (
            <Card
              key={device.id}
              className={`group relative overflow-hidden border border-gray-200 rounded-xl transition-all duration-300 ${
                isActive ? "shadow-md shadow-pink-100" : "shadow-sm"
              } hover:shadow-xl hover:-translate-y-1`}
            >
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  {IconComponent ? (
                    <IconComponent
                      className={`w-12 h-12 mb-4 transition-colors duration-300 ${
                        isActive
                          ? "text-pink-500 group-hover:text-pink-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                  ) : (
                    <span className="text-gray-400">⚠️</span>
                  )}
                  <span
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white transition-colors duration-300 ${
                      isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </div>

                <h3 className="font-semibold text-lg text-gray-800">{device.name}</h3>
                <p
                  className={`text-sm font-medium ${
                    isActive ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </p>

                {/* Animated Activate / Deactivate button */}
                <Button
                  onClick={() => handleDeviceToggle(device.id)}
                  disabled={isConnecting}
                  className={`w-full rounded-full relative overflow-hidden group/button transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                      : "bg-white text-pink-600 border border-pink-200 shadow-sm"
                  } ${isConnecting ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:-translate-y-0.5"}`}
                >
                  {/* subtle moving shine on hover */}
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300">
                    <span className="absolute -left-8 top-0 h-full w-16 bg-white/20 rotate-12 animate-[shine_1.2s_linear_infinite]" />
                  </span>

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isUpdating && (
                      <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                    )}
                    {!isUpdating && (
                      <Power
                        className={`w-4 h-4 ${
                          isActive ? "text-white" : "text-pink-500"
                        }`}
                      />
                    )}
                    <span className="text-sm font-semibold">
                      {isUpdating
                        ? isActive
                          ? "Deactivating..."
                          : "Activating..."
                        : isActive
                        ? "Deactivate"
                        : "Activate"}
                    </span>
                  </span>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
