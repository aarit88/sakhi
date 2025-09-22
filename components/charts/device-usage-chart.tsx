"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { name: "Smart Heat Pack", value: 45, color: "hsl(var(--chart-1))" },
  { name: "AURA Light", value: 30, color: "hsl(var(--chart-2))" },
  { name: "Smart Bottle", value: 25, color: "hsl(var(--chart-3))" },
]

export function DeviceUsageChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Usage</CardTitle>
        <CardDescription>How you're using your connected devices this week</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--card-foreground))",
              }}
              formatter={(value) => [`${value}%`, "Usage"]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-4 text-sm">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span>{entry.name}</span>
              <span className="font-medium">{entry.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
