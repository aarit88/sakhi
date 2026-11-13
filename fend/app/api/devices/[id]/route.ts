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

type DeviceRouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: DeviceRouteContext) {
  try {
    const { id } = await params
    const device = devices.find((d) => d.id === id)

    if (!device) {
      return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: device,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch device" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: DeviceRouteContext) {
  try {
    const { id } = await params
    const body = await request.json()
    const deviceIndex = devices.findIndex((d) => d.id === id)

    if (deviceIndex === -1) {
      return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 })
    }

    devices[deviceIndex] = {
      ...devices[deviceIndex],
      ...body,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: devices[deviceIndex],
      message: "Device updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update device" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: DeviceRouteContext) {
  try {
    const { id } = await params
    const deviceIndex = devices.findIndex((d) => d.id === id)

    if (deviceIndex === -1) {
      return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 })
    }

    devices.splice(deviceIndex, 1)

    return NextResponse.json({
      success: true,
      message: "Device deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete device" }, { status: 500 })
  }
}
