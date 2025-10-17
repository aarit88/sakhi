import { type NextRequest, NextResponse } from "next/server"

// Mock notifications data
const notifications = [
  {
    id: "notif-001",
    type: "reminder",
    title: "Hydration Reminder",
    message: "Time to drink some water! You're 200ml behind your goal.",
    priority: "medium",
    deviceId: "water-bottle-001",
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: "notif-002",
    type: "insight",
    title: "Sleep Pattern Detected",
    message: "Your sleep quality has improved by 15% this week. Great job!",
    priority: "low",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: "notif-003",
    type: "alert",
    title: "Device Battery Low",
    message: "Your mood light battery is at 15%. Please charge soon.",
    priority: "high",
    deviceId: "mood-light-001",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"
    const type = searchParams.get("type")

    let filteredNotifications = notifications

    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter((n) => !n.read)
    }

    if (type) {
      filteredNotifications = filteredNotifications.filter((n) => n.type === type)
    }

    // Sort by timestamp (newest first)
    filteredNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      data: filteredNotifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, priority = "medium", deviceId } = body

    const newNotification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      priority,
      deviceId,
      timestamp: new Date().toISOString(),
      read: false,
    }

    notifications.unshift(newNotification)

    return NextResponse.json({
      success: true,
      data: newNotification,
      message: "Notification created successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create notification" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, read } = body

    const notificationIndex = notifications.findIndex((n) => n.id === id)

    if (notificationIndex === -1) {
      return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 })
    }

    notifications[notificationIndex].read = read

    return NextResponse.json({
      success: true,
      data: notifications[notificationIndex],
      message: "Notification updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 })
  }
}
