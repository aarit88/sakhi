"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Moon,
  Activity,
  Droplets,
  Brain,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react"

export function HealthTracking() {
  const [selectedPeriod, setSelectedPeriod] = useState("week")

  const healthMetrics = [
    {
      id: "cycle",
      name: "Menstrual Cycle",
      icon: Calendar,
      value: "Day 14",
      status: "ovulation",
      color: "from-pink-500 to-rose-500",
      bgColor: "from-pink-50 to-rose-50",
      progress: 50,
      insight: "Ovulation predicted in 2 days",
    },
    {
      id: "sleep",
      name: "Sleep Quality",
      icon: Moon,
      value: "7.5h",
      status: "good",
      color: "from-indigo-500 to-purple-500",
      bgColor: "from-indigo-50 to-purple-50",
      progress: 85,
      insight: "Consistent sleep pattern this week",
    },
    {
      id: "activity",
      name: "Physical Activity",
      icon: Activity,
      value: "8,432",
      status: "active",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      progress: 75,
      insight: "Goal achieved 5/7 days",
    },
    {
      id: "hydration",
      name: "Hydration",
      icon: Droplets,
      value: "2.1L",
      status: "optimal",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      progress: 90,
      insight: "Excellent hydration levels",
    },
  ]

  const symptoms = [
    { name: "Cramps", severity: "mild", color: "yellow" },
    { name: "Mood Changes", severity: "moderate", color: "orange" },
    { name: "Fatigue", severity: "low", color: "green" },
    { name: "Headache", severity: "none", color: "gray" },
  ]

  const recommendations = [
    {
      type: "nutrition",
      title: "Iron-Rich Foods",
      description: "Consider adding spinach and lean meats to your diet",
      priority: "high",
      icon: Target,
    },
    {
      type: "activity",
      title: "Gentle Exercise",
      description: "Light yoga or walking can help with cramps",
      priority: "medium",
      icon: Activity,
    },
    {
      type: "wellness",
      title: "Stress Management",
      description: "Try meditation or deep breathing exercises",
      priority: "medium",
      icon: Brain,
    },
  ]

  return (
    <section id="health" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Comprehensive{" "}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Health Insights
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Track your wellness journey with AI-powered insights that understand your unique patterns and provide
            personalized recommendations for optimal health.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cycle">Cycle</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Health Metrics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {healthMetrics.map((metric, index) => {
                const IconComponent = metric.icon
                return (
                  <Card
                    key={metric.id}
                    className={`relative overflow-hidden border-0 bg-gradient-to-br ${metric.bgColor} animate-slide-up hover:shadow-lg transition-all duration-300`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}
                        >
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${
                            metric.status === "good" || metric.status === "optimal" || metric.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {metric.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-medium text-gray-700">{metric.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                      <Progress value={metric.progress} className="h-2" />
                      <p className="text-xs text-gray-600">{metric.insight}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Today's Summary */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Achievements</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Hydration goal met
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        8+ hours sleep
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Mood tracking logged
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Reminders</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-orange-500" />
                        Take evening vitamins
                      </li>
                      <li className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-orange-500" />
                        Log symptoms
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Wellness Score</h4>
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl font-bold text-green-600">92</div>
                      <div className="text-sm text-gray-600">
                        <div>Excellent</div>
                        <div className="text-xs">+5 from yesterday</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cycle" className="space-y-8">
            <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <Calendar className="w-5 h-5 mr-2 text-pink-500" />
                  Menstrual Cycle Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-600 mb-2">Day 14</div>
                    <div className="text-sm text-gray-600">Current Cycle Day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">2 days</div>
                    <div className="text-sm text-gray-600">Until Ovulation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">14 days</div>
                    <div className="text-sm text-gray-600">Until Next Period</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Cycle Phases</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-3 bg-red-100 rounded-lg">
                      <div className="text-xs font-medium text-red-700">Menstrual</div>
                      <div className="text-xs text-red-600">Days 1-5</div>
                    </div>
                    <div className="text-center p-3 bg-green-100 rounded-lg">
                      <div className="text-xs font-medium text-green-700">Follicular</div>
                      <div className="text-xs text-green-600">Days 6-13</div>
                    </div>
                    <div className="text-center p-3 bg-purple-100 rounded-lg border-2 border-purple-300">
                      <div className="text-xs font-medium text-purple-700">Ovulation</div>
                      <div className="text-xs text-purple-600">Days 14-16</div>
                    </div>
                    <div className="text-center p-3 bg-blue-100 rounded-lg">
                      <div className="text-xs font-medium text-blue-700">Luteal</div>
                      <div className="text-xs text-blue-600">Days 17-28</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="symptoms" className="space-y-8">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                  Symptom Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {symptoms.map((symptom, index) => (
                    <div key={symptom.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{symptom.name}</span>
                      <Badge
                        variant="secondary"
                        className={`${
                          symptom.severity === "none"
                            ? "bg-gray-100 text-gray-600"
                            : symptom.severity === "low"
                              ? "bg-green-100 text-green-700"
                              : symptom.severity === "mild"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {symptom.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
                  Log Today's Symptoms
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.map((rec, index) => {
                    const IconComponent = rec.icon
                    return (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            rec.priority === "high" ? "bg-red-100" : "bg-blue-100"
                          }`}
                        >
                          <IconComponent
                            className={`w-4 h-4 ${rec.priority === "high" ? "text-red-600" : "text-blue-600"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={rec.priority === "high" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <Brain className="w-5 h-5 mr-2 text-purple-500" />
                    AI Health Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Pattern Recognition</h4>
                    <p className="text-sm text-gray-600">
                      Your sleep quality tends to improve 3 days before your period. Consider maintaining your current
                      bedtime routine.
                    </p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Predictive Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Based on your patterns, you may experience mild fatigue in 2-3 days. Plan lighter activities and
                      prioritize rest.
                    </p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Wellness Correlation</h4>
                    <p className="text-sm text-gray-600">
                      Your mood tracking shows improvement when hydration levels are optimal. Keep up the great work!
                    </p>
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
