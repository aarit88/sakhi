"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { day: "Day 1", pain: 2, mood: 3, energy: 4 },
  { day: "Day 2", pain: 3, mood: 2, energy: 3 },
  { day: "Day 3", pain: 4, mood: 2, energy: 2 },
  { day: "Day 4", pain: 5, mood: 1, energy: 2 },
  { day: "Day 5", pain: 4, mood: 2, energy: 3 },
  { day: "Day 6", pain: 3, mood: 3, energy: 4 },
  { day: "Day 7", pain: 2, mood: 4, energy: 4 },
  { day: "Day 8", pain: 1, mood: 4, energy: 5 },
  { day: "Day 9", pain: 1, mood: 5, energy: 5 },
  { day: "Day 10", pain: 2, mood: 4, energy: 4 },
  { day: "Day 11", pain: 3, mood: 3, energy: 3 },
  { day: "Day 12", pain: 4, mood: 2, energy: 2 },
  { day: "Day 13", pain: 5, mood: 1, energy: 1 },
  { day: "Day 14", pain: 4, mood: 2, energy: 2 },
]

export function SymptomTrendsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Symptom Trends</CardTitle>
        <CardDescription>Track your symptoms over the past 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="day" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 5]} className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--card-foreground))",
              }}
            />
            <Line
              type="monotone"
              dataKey="pain"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name="Pain Level"
              dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="Mood Score"
              dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="energy"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              name="Energy Level"
              dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1"></div>
            <span>Pain Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-2"></div>
            <span>Mood Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-3"></div>
            <span>Energy Level</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
