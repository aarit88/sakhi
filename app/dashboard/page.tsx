"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  Activity,
  Brain,
  Thermometer,
  Droplets,
  Moon,
  Calendar,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from "lucide-react"
import { SymptomTrendsChart } from "@/components/charts/symptom-trends-chart"
import { CycleCalendarChart } from "@/components/charts/cycle-calendar-chart"
import { WellnessMetricsChart } from "@/components/charts/wellness-metrics-chart"
import { DeviceUsageChart } from "@/components/charts/device-usage-chart"

export default function DashboardPage() {
  const [currentSymptoms] = useState([
    { name: "Heavy Stomach Ache", severity: "Severe", icon: Heart, color: "text-red-500" },
    { name: "Body Pain", severity: "Moderate", icon: Activity, color: "text-orange-500" },
    { name: "Mood Swings", severity: "High", icon: Brain, color: "text-yellow-500" },
  ])

  const [quickSolutions] = useState([
    { name: "Heat Pack Control", icon: Thermometer, status: "active" },
    { name: "Hydration Reminder", icon: Droplets, status: "pending" },
    { name: "Mood Light", icon: Lightbulb, status: "active" },
    { name: "Sleep Tracker", icon: Moon, status: "inactive" },
  ])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Dashboard</h1>
          <p className="text-muted-foreground">Track your symptoms and get personalized insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Symptoms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Current Symptoms
                </CardTitle>
                <CardDescription>Your logged symptoms for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentSymptoms.map((symptom, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-background ${symptom.color}`}>
                          <symptom.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{symptom.name}</p>
                          <Badge
                            variant={
                              symptom.severity === "Severe"
                                ? "destructive"
                                : symptom.severity === "High"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {symptom.severity}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">Log New Symptom</Button>
              </CardContent>
            </Card>

            {/* Insight of the Day */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-secondary" />
                  Insight of the Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <p className="text-sm text-foreground mb-2">
                    Your sleep quality tends to dip 2 days before your period. Try a calming magnesium-rich snack this
                    evening.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Moon className="h-3 w-3" />
                    <span>Based on 3 months of data</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Solutions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Solutions</CardTitle>
                <CardDescription>Instant relief options based on your current symptoms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickSolutions.map((solution, index) => (
                    <div key={index} className="text-center">
                      <Button
                        variant={solution.status === "active" ? "default" : "outline"}
                        size="lg"
                        className="w-full h-20 flex-col gap-2"
                      >
                        <solution.icon className="h-6 w-6" />
                        <span className="text-xs">{solution.name}</span>
                      </Button>
                      <div className="mt-2">
                        <Badge
                          variant={
                            solution.status === "active"
                              ? "default"
                              : solution.status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {solution.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cycle Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Cycle Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-primary">Day 23</div>
                  <p className="text-sm text-muted-foreground">of your cycle</p>
                </div>
                <Progress value={76} className="mb-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Next period:</span>
                    <span className="font-medium">5 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fertility window:</span>
                    <span className="font-medium">Ended</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-secondary" />
                  Today's Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Drink ginger tea</p>
                      <p className="text-xs text-muted-foreground">For stomach ache relief</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Child's pose yoga</p>
                      <p className="text-xs text-muted-foreground">5 minutes for pain relief</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Magnesium supplement</p>
                      <p className="text-xs text-muted-foreground">Before bedtime</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connected Devices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  Connected Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-primary" />
                      <span className="text-sm">Smart Heat Pack</span>
                    </div>
                    <Badge variant="default">On, 40°C</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-secondary" />
                      <span className="text-sm">AURA Light</span>
                    </div>
                    <Badge variant="secondary">Soft Blue</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-accent" />
                      <span className="text-sm">Smart Bottle</span>
                    </div>
                    <Badge variant="outline">Offline</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Navigation Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Home</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="smp">SMP</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>Your health summary and key metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">85%</div>
                      <p className="text-sm text-muted-foreground">Overall Wellness</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-secondary">12</div>
                      <p className="text-sm text-muted-foreground">Days Tracked</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-accent">3</div>
                      <p className="text-sm text-muted-foreground">Active Devices</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SymptomTrendsChart />
                  <WellnessMetricsChart />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CycleCalendarChart />
                  <DeviceUsageChart />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="logs" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Symptom Logs</CardTitle>
                  <CardDescription>Your complete symptom history</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Detailed logging interface will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
