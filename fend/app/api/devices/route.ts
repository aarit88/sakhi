import { type NextRequest, NextResponse } from "next/server"

// Mock database - In production, use a real database
const devices = [
  {
    id: "heat-pack-001",
    name: "Smart Heat Pack",
    type: "heat-pack",
    status: "active",
    battery: 85,
    temperature: 38,
    lastUpdated: new Date().toISOString(),
    settings: {
      targetTemp: 38,
      duration: 30,
      autoShutoff: true,
    },
  },
  {
    id: "water-bottle-001",
    name: "Smart Water Bottle",
    type: "water-bottle",
    status: "active",
    battery: 92,
    hydrationLevel: 75,
    lastUpdated: new Date().toISOString(),
    settings: {
      reminderInterval: 60,
      targetIntake: 2500,
      glowEnabled: true,
    },
  },
  {
    id: "mood-light-001",
    name: "AURA Mood Light",
    type: "mood-light",
    status: "active",
    battery: 78,
    currentMood: "calm",
    lastUpdated: new Date().toISOString(),
    settings: {
      brightness: 75,
      autoMode: true,
      colorTheme: "warm",
    },
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: devices,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch devices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, settings } = body

    const newDevice = {
      id: `${type}-${Date.now()}`,
      name,
      type,
      status: "active",
      battery: 100,
      lastUpdated: new Date().toISOString(),
      settings: settings || {},
      ...getDefaultDeviceProps(type),
    }

    devices.push(newDevice)

    return NextResponse.json({
      success: true,
      data: newDevice,
      message: "Device added successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to add device" }, { status: 500 })
  }
}

function getDefaultDeviceProps(type: string) {
  switch (type) {
    case "heat-pack":
      return { temperature: 36 }
    case "water-bottle":
      return { hydrationLevel: 0 }
    case "mood-light":
      return { currentMood: "neutral" }
    default:
      return {}
  }
}
