"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  { week: "Week 1", sleep: 7.2, exercise: 4, hydration: 85, stress: 3 },
  { week: "Week 2", sleep: 6.8, exercise: 5, hydration: 78, stress: 4 },
  { week: "Week 3", sleep: 7.5, exercise: 3, hydration: 92, stress: 2 },
  { week: "Week 4", sleep: 6.5, exercise: 6, hydration: 88, stress: 3 },
]

export function WellnessMetricsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wellness Metrics</CardTitle>
        <CardDescription>Your health metrics over the past month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="week" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
            <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--card-foreground))",
              }}
              formatter={(value, name) => {
                const formatters: { [key: string]: (val: number) => string } = {
                  sleep: (val) => `${val} hours`,
                  exercise: (val) => `${val} sessions`,
                  hydration: (val) => `${val}%`,
                  stress: (val) => `${val}/5`,
                }
                return [formatters[name] ? formatters[name](value as number) : value, name]
              }}
            />
            <Bar dataKey="sleep" fill="hsl(var(--chart-1))" name="Sleep (hours)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="exercise" fill="hsl(var(--chart-2))" name="Exercise (sessions)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="hydration" fill="hsl(var(--chart-3))" name="Hydration (%)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="stress" fill="hsl(var(--chart-4))" name="Stress Level" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1"></div>
            <span>Sleep</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-2"></div>
            <span>Exercise</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-3"></div>
            <span>Hydration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-4"></div>
            <span>Stress</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
