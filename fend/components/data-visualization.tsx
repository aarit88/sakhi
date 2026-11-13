"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Calendar, Activity, Heart, Droplets, Moon, Brain, Download, Share, Filter } from "lucide-react"

export function DataVisualization() {
  const [healthData, setHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const result = await apiClient.get('/api/health')
        // API returns: { success: true, data: { mood, sleep, ..., currentCycle, vitals, summary } }
        if (result.success) {
          setHealthData(result.data)
        } else {
          setError("Failed to load health data")
        }
      } catch (err) {
        console.error("Failed to load health data", err)
        setError("Could not reach the health service")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // ── Derive display values from real data only ─────────────────────────────
  // Wellness score: average mood × 10. Null when no mood data.
  const moods = healthData?.mood ?? []
  const avgMoodRaw = moods.length > 0
    ? moods.reduce((acc: number, m: any) => acc + m.score, 0) / moods.length
    : null
  const wellnessScore = avgMoodRaw !== null ? Math.round((avgMoodRaw / 10) * 100) : null

  // Avg sleep: null when no sleep data.
  const sleepLogs = healthData?.sleep ?? []
  const avgSleepRaw = sleepLogs.length > 0
    ? sleepLogs.reduce((acc: number, s: any) => acc + s.hours, 0) / sleepLogs.length
    : null
  const avgSleepDisplay = avgSleepRaw !== null ? avgSleepRaw.toFixed(1) : null

  // Avg steps: null when no activity data.
  const activities = healthData?.activity ?? []
  const avgStepsRaw = activities.length > 0
    ? activities.reduce((acc: number, a: any) => acc + a.steps, 0) / activities.length
    : null
  const avgStepsDisplay = avgStepsRaw !== null
    ? avgStepsRaw >= 1000 ? `${(avgStepsRaw / 1000).toFixed(1)}K` : Math.round(avgStepsRaw).toString()
    : null

  // Avg mood display: null when no mood data.
  const avgMoodDisplay = avgMoodRaw !== null ? avgMoodRaw.toFixed(1) : null

  // Current cycle day from API.
  const cycleDay = healthData?.currentCycle?.day ?? null
  
  const sleepData = sleepLogs.length > 0
    ? sleepLogs.slice(-7).map((s: any) => ({
        date: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: s.hours,
        quality: s.quality * 10
      }))
    : []

  const cycleData = moods.length > 0
    ? moods.slice(-14).map((m: any, idx: number) => ({
        day: idx + 1,
        mood: m.score,
        energy: m.score,
        symptoms: (healthData?.symptoms?.length ?? 0) > idx ? 3 : 0
      }))
    : []

  const hydrationLogs = healthData?.hydration ?? []
  const hydrationData = hydrationLogs.length > 0
    ? hydrationLogs.slice(-7).map((h: any) => ({
        time: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }),
        intake: (h.intake / 1000).toFixed(1)
      }))
    : []

  const deviceUsageData = [
    { name: "Heat Pack", value: 35, color: "#ec4899" },
    { name: "Water Bottle", value: 40, color: "#3b82f6" },
    { name: "Mood Light", value: 25, color: "#8b5cf6" },
  ]

  // Monthly trends from real mood data
  const monthlyTrends = moods.length > 0
    ? moods.slice(-7).map((m: any) => ({
        month: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
        wellness: m.score * 10,
        mood: m.score,
        symptoms: 2
      }))
    : []

  return (
    <section id="dashboard" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Visual{" "}
            <span className="bg-linear-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Health Analytics
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your health data into actionable insights with beautiful, interactive visualizations that reveal
            patterns and trends over time.
          </p>
        </div>

        {/* Control Bar */}
        <div className="flex flex-wrap items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Badge variant="secondary">Last 30 days</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="overflow-x-auto pb-1 max-w-full -mx-2 px-2 sm:mx-0 sm:px-0">
            <TabsList className="flex w-max sm:w-full sm:grid sm:grid-cols-5 lg:w-fit mx-auto gap-1">
              <TabsTrigger value="overview" className="px-4 py-2 text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="cycle" className="px-4 py-2 text-xs sm:text-sm">Cycle</TabsTrigger>
              <TabsTrigger value="sleep" className="px-4 py-2 text-xs sm:text-sm">Sleep</TabsTrigger>
              <TabsTrigger value="activity" className="px-4 py-2 text-xs sm:text-sm">Activity</TabsTrigger>
              <TabsTrigger value="devices" className="px-4 py-2 text-xs sm:text-sm">Devices</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Wellness Score</p>
                      {wellnessScore !== null ? (
                        <p className="text-3xl font-bold text-pink-600">{wellnessScore}</p>
                      ) : (
                        <p className="text-xl font-semibold text-gray-400">—</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {wellnessScore !== null ? "Based on your mood logs" : "Log mood to calculate"}
                      </p>
                    </div>
                    <Heart className="w-8 h-8 text-pink-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Sleep</p>
                      {avgSleepDisplay !== null ? (
                        <p className="text-3xl font-bold text-blue-600">{avgSleepDisplay}h</p>
                      ) : (
                        <p className="text-xl font-semibold text-gray-400">—</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {avgSleepDisplay !== null ? "30-day average" : "Log sleep to calculate"}
                      </p>
                    </div>
                    <Moon className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Daily Steps</p>
                      {avgStepsDisplay !== null ? (
                        <p className="text-3xl font-bold text-green-600">{avgStepsDisplay}</p>
                      ) : (
                        <p className="text-xl font-semibold text-gray-400">—</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {avgStepsDisplay !== null ? "30-day average" : "Log activity to calculate"}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Mood Score</p>
                      {avgMoodDisplay !== null ? (
                        <p className="text-3xl font-bold text-purple-600">{avgMoodDisplay}</p>
                      ) : (
                        <p className="text-xl font-semibold text-gray-400">—</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {avgMoodDisplay !== null ? "30-day average" : "Log mood to calculate"}
                      </p>
                    </div>
                    <Brain className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trends Chart */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  6-Month Wellness Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyTrends.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="wellness"
                          stroke="#ec4899"
                          fill="url(#wellnessGradient)"
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="wellnessGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-center text-gray-500">
                    <TrendingUp className="w-12 h-12 mb-4 text-gray-300" />
                    <p>Not enough mood data yet.</p>
                    <p className="text-sm">Log your mood for a few days to see trends here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cycle" className="space-y-8">
            <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Calendar className="w-5 h-5 mr-2 text-pink-500" />
                  Menstrual Cycle Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cycleData.length > 0 ? (
                  <>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cycleData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="mood"
                            stroke="#ec4899"
                            strokeWidth={3}
                            dot={{ fill: "#ec4899", strokeWidth: 2, r: 4 }}
                            name="Mood"
                          />
                          <Line
                            type="monotone"
                            dataKey="energy"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                            name="Energy"
                          />
                          <Line
                            type="monotone"
                            dataKey="symptoms"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                            name="Symptoms"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center space-x-6 mt-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Mood</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Energy</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Symptoms</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-center text-gray-500">
                    <Calendar className="w-12 h-12 mb-4 text-gray-300" />
                    <p>Not enough cycle data yet.</p>
                    <p className="text-sm">Log your moods and symptoms to see cycle patterns here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sleep" className="space-y-8">
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Moon className="w-5 h-5 mr-2 text-indigo-500" />
                  Sleep Quality Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sleepData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sleepData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="hours" fill="url(#sleepGradient)" radius={[4, 4, 0, 0]} name="Sleep Hours" />
                        <defs>
                          <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.6} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-center text-gray-500">
                    <Moon className="w-12 h-12 mb-4 text-gray-300" />
                    <p>Not enough sleep data yet.</p>
                    <p className="text-sm">Log your sleep to see your analysis here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-8">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Droplets className="w-5 h-5 mr-2 text-blue-500" />
                  Daily Hydration Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hydrationData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hydrationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="time" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="intake"
                          stroke="#3b82f6"
                          fill="url(#hydrationGradient)"
                          strokeWidth={3}
                        />
                        <defs>
                          <linearGradient id="hydrationGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-center text-gray-500">
                    <Droplets className="w-12 h-12 mb-4 text-gray-300" />
                    <p>Not enough hydration data yet.</p>
                    <p className="text-sm">Log your water intake to see your daily tracking here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <Activity className="w-5 h-5 mr-2 text-green-500" />
                    Device Usage Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceUsageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {deviceUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center space-x-6 mt-4">
                    {deviceUsageData.map((device, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: device.color }}></div>
                        <span className="text-sm text-gray-600">{device.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Device Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Heat Pack Efficiency</span>
                      <span className="text-sm text-gray-600">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-pink-500 h-2 rounded-full" style={{ width: "94%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Water Bottle Accuracy</span>
                      <span className="text-sm text-gray-600">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "98%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Mood Light Response</span>
                      <span className="text-sm text-gray-600">91%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: "91%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
