"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Heart, Zap } from "lucide-react"

const cycleData = [
  { day: 1, phase: "menstrual", intensity: "high", symptoms: ["cramps", "fatigue"] },
  { day: 2, phase: "menstrual", intensity: "high", symptoms: ["cramps", "mood"] },
  { day: 3, phase: "menstrual", intensity: "medium", symptoms: ["fatigue"] },
  { day: 4, phase: "menstrual", intensity: "low", symptoms: [] },
  { day: 5, phase: "follicular", intensity: "none", symptoms: [] },
  { day: 6, phase: "follicular", intensity: "none", symptoms: [] },
  { day: 7, phase: "follicular", intensity: "none", symptoms: [] },
  { day: 8, phase: "follicular", intensity: "none", symptoms: [] },
  { day: 9, phase: "follicular", intensity: "none", symptoms: [] },
  { day: 10, phase: "follicular", intensity: "none", symptoms: [] },
  { day: 11, phase: "ovulation", intensity: "none", symptoms: ["energy"] },
  { day: 12, phase: "ovulation", intensity: "none", symptoms: ["energy"] },
  { day: 13, phase: "ovulation", intensity: "none", symptoms: ["energy"] },
  { day: 14, phase: "ovulation", intensity: "none", symptoms: ["energy"] },
  { day: 15, phase: "luteal", intensity: "none", symptoms: [] },
  { day: 16, phase: "luteal", intensity: "none", symptoms: [] },
  { day: 17, phase: "luteal", intensity: "none", symptoms: [] },
  { day: 18, phase: "luteal", intensity: "none", symptoms: [] },
  { day: 19, phase: "luteal", intensity: "none", symptoms: [] },
  { day: 20, phase: "luteal", intensity: "none", symptoms: [] },
  { day: 21, phase: "luteal", intensity: "low", symptoms: ["mood"] },
  { day: 22, phase: "luteal", intensity: "low", symptoms: ["mood", "fatigue"] },
  { day: 23, phase: "luteal", intensity: "medium", symptoms: ["mood", "cramps"] },
  { day: 24, phase: "luteal", intensity: "medium", symptoms: ["mood", "cramps"] },
  { day: 25, phase: "luteal", intensity: "high", symptoms: ["mood", "cramps", "fatigue"] },
  { day: 26, phase: "luteal", intensity: "high", symptoms: ["mood", "cramps", "fatigue"] },
  { day: 27, phase: "luteal", intensity: "high", symptoms: ["mood", "cramps", "fatigue"] },
  { day: 28, phase: "luteal", intensity: "high", symptoms: ["mood", "cramps", "fatigue"] },
]

const getPhaseColor = (phase: string) => {
  switch (phase) {
    case "menstrual":
      return "bg-red-100 border-red-300 text-red-800"
    case "follicular":
      return "bg-green-100 border-green-300 text-green-800"
    case "ovulation":
      return "bg-blue-100 border-blue-300 text-blue-800"
    case "luteal":
      return "bg-yellow-100 border-yellow-300 text-yellow-800"
    default:
      return "bg-gray-100 border-gray-300 text-gray-800"
  }
}

const getIntensityOpacity = (intensity: string) => {
  switch (intensity) {
    case "high":
      return "opacity-100"
    case "medium":
      return "opacity-70"
    case "low":
      return "opacity-40"
    default:
      return "opacity-20"
  }
}

export function CycleCalendarChart() {
  const currentDay = 23 // Current day in cycle

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Cycle Calendar
        </CardTitle>
        <CardDescription>Visual representation of your menstrual cycle and symptoms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-6">
          {cycleData.map((day) => (
            <div
              key={day.day}
              className={`
                relative p-2 rounded-lg border-2 text-center text-sm font-medium
                ${getPhaseColor(day.phase)} ${getIntensityOpacity(day.intensity)}
                ${day.day === currentDay ? "ring-2 ring-primary ring-offset-2" : ""}
              `}
            >
              <div className="text-xs font-bold">{day.day}</div>
              {day.symptoms.length > 0 && (
                <div className="flex justify-center gap-1 mt-1">
                  {day.symptoms.includes("cramps") && <Heart className="h-2 w-2" />}
                  {day.symptoms.includes("fatigue") && <Zap className="h-2 w-2" />}
                  {day.symptoms.includes("mood") && <div className="w-2 h-2 bg-current rounded-full" />}
                  {day.symptoms.includes("energy") && <Zap className="h-2 w-2 text-green-600" />}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Cycle Phases</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-red-100 border-red-300 text-red-800">
                Menstrual (Days 1-4)
              </Badge>
              <Badge variant="outline" className="bg-green-100 border-green-300 text-green-800">
                Follicular (Days 5-10)
              </Badge>
              <Badge variant="outline" className="bg-blue-100 border-blue-300 text-blue-800">
                Ovulation (Days 11-14)
              </Badge>
              <Badge variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-800">
                Luteal (Days 15-28)
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Symptoms</h4>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-500" />
                <span>Cramps</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-orange-500" />
                <span>Fatigue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span>Mood Changes</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-green-500" />
                <span>High Energy</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
