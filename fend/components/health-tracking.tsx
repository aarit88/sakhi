"use client"

import { useState, useMemo } from "react"
import { useHealthSummary, useSymptomData } from "@/hooks/use-health-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComicStripViewer } from "@/components/comic-strip-viewer"
import { HealthLoggingModal } from "@/components/health-logging-modal"
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
  Image as ImageIcon,
} from "lucide-react"

export function HealthTracking() {
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const [isLoggingOpen, setIsLoggingOpen] = useState(false)

  const { data: summaryData, loading, fetchSummary } = useHealthSummary()

  const healthMetrics = useMemo(() => {
    if (!summaryData) return []
    const summary = summaryData?.summary || { avgSleep: "0", avgHydration: "0", avgSteps: 0 }
    const cycle = summaryData?.currentCycle || { day: 1, phase: "Unknown", nextPeriod: "Unknown", cycleLength: 28 }
    
    return [
      {
        id: "cycle",
        name: "Menstrual Cycle",
        icon: Calendar,
        value: `Day ${cycle.day}`,
        status: cycle.phase,
        color: "from-pink-500 to-rose-500",
        bgColor: "from-pink-50 to-rose-50",
        progress: Math.min((cycle.day / (cycle.cycleLength || 28)) * 100, 100),
        insight: `Next period: ${cycle.nextPeriod}`,
      },
      {
        id: "sleep",
        name: "Sleep Average",
        icon: Moon,
        value: `${summary.avgSleep}h`,
        status: parseFloat(summary.avgSleep) >= 7 ? "good" : "needs attention",
        color: "from-indigo-500 to-purple-500",
        bgColor: "from-indigo-50 to-purple-50",
        progress: Math.min((parseFloat(summary.avgSleep) / 8) * 100, 100),
        insight: "14-day average sleep duration",
      },
      {
        id: "activity",
        name: "Physical Activity",
        icon: Activity,
        value: summary.avgSteps.toString(),
        status: summary.avgSteps >= 5000 ? "active" : "low",
        color: "from-green-500 to-emerald-500",
        bgColor: "from-green-50 to-emerald-50",
        progress: Math.min((summary.avgSteps / 10000) * 100, 100),
        insight: "14-day average steps",
      },
      {
        id: "hydration",
        name: "Hydration",
        icon: Droplets,
        value: `${summary.avgHydration}ml`,
        status: parseFloat(summary.avgHydration) >= 2000 ? "optimal" : "low",
        color: "from-blue-500 to-cyan-500",
        bgColor: "from-blue-50 to-cyan-50",
        progress: Math.min((parseFloat(summary.avgHydration) / 3000) * 100, 100),
        insight: "14-day average hydration",
      },
    ]
  }, [summaryData])

  const symptoms = useMemo(() => {
    if (!summaryData || !summaryData.symptoms) return []
    // Get unique recent symptoms
    const recent = summaryData.symptoms.slice(-4)
    return recent.map((s: any) => ({
      name: s.type,
      severity: s.severity,
      color: "gray"
    }))
  }, [summaryData])

  const recommendations = useMemo(() => {
    if (!summaryData) return []
    const recs = []
    const summary = summaryData.summary
    const cycle = summaryData.currentCycle

    if (parseFloat(summary.avgHydration) < 2000) {
      recs.push({
        type: "hydration",
        title: "Hydration Focus",
        description: "Your average hydration is low. Try to drink at least 2 liters of water daily.",
        priority: "high",
        icon: Droplets,
      })
    }

    if (parseFloat(summary.avgSleep) < 7) {
      recs.push({
        type: "wellness",
        title: "Prioritize Rest",
        description: "You're averaging under 7 hours of sleep. A consistent bedtime routine can help.",
        priority: parseFloat(summary.avgSleep) < 5 ? "high" : "medium",
        icon: Moon,
      })
    }

    if (summary.avgSteps < 5000) {
      recs.push({
        type: "activity",
        title: "Increase Movement",
        description: "Try adding a 15-minute walk to your daily routine to boost your energy.",
        priority: "medium",
        icon: Activity,
      })
    }

    if (cycle && (cycle.phase === "Menstrual" || cycle.phase === "Luteal")) {
      recs.push({
        type: "nutrition",
        title: "Iron & Comfort Foods",
        description: "During this phase, warm, nourishing foods and iron-rich meals (like spinach) are beneficial.",
        priority: "medium",
        icon: Target,
      })
    }

    if (recs.length === 0) {
      recs.push({
        type: "wellness",
        title: "Keep it up!",
        description: "Your vitals look great. Maintain your current healthy habits.",
        priority: "low",
        icon: CheckCircle,
      })
    }
    return recs
  }, [summaryData])

  const summaryDetails = useMemo(() => {
    if (!summaryData) return { achievements: [], reminders: [], score: 0, status: "Unknown" }
    
    const achievements: string[] = []
    const reminders: string[] = []
    let score = 50

    if (parseFloat(summaryData.summary.avgHydration) >= 2000) {
      achievements.push("Optimal hydration reached")
      score += 15
    } else {
      reminders.push("Drink more water today")
    }

    if (parseFloat(summaryData.summary.avgSleep) >= 7) {
      achievements.push("7+ hours average sleep")
      score += 15
    } else {
      reminders.push("Try to get to bed earlier")
    }

    if (summaryData.summary.avgSteps >= 5000) {
      achievements.push("Active lifestyle maintained")
      score += 15
    } else {
      reminders.push("Take a short walk")
    }

    if (summaryData.symptoms?.length > 0) {
      achievements.push("Symptom tracking active")
      score += 5
    } else {
      reminders.push("Log today's symptoms")
    }

    score = Math.min(Math.max(score, 0), 100)
    let status = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Attention"

    return { achievements, reminders, score, status }
  }, [summaryData])

  const insights = useMemo(() => {
    if (!summaryData) return null
    const cycle = summaryData.currentCycle

    let pattern = "We need more data to recognize distinct patterns."
    let prediction = "Keep logging your data to get predictive insights."
    let correlation = "Your holistic wellness is connected across sleep, hydration, and activity."

    if (cycle && cycle.phase !== "Unknown") {
      if (cycle.phase === "Menstrual") {
         pattern = `You are currently in your Menstrual phase. Your average sleep is ${summaryData.summary.avgSleep}h.`
         prediction = "Expect energy levels to gradually rise as you enter the Follicular phase soon."
      } else if (cycle.phase === "Follicular") {
         pattern = `You are in your Follicular phase. Typically, this brings higher energy. Your average steps are ${summaryData.summary.avgSteps}.`
         prediction = "You might feel at your most energetic in the coming days."
      } else if (cycle.phase === "Ovulation") {
         pattern = "You are currently in your Ovulatory window."
         prediction = `Your next period is projected to start on ${cycle.nextPeriod}.`
      } else if (cycle.phase === "Luteal") {
         pattern = `You are in the Luteal phase. If you experience PMS, your current hydration (${summaryData.summary.avgHydration}ml) might affect bloating.`
         prediction = `Your period is expected around ${cycle.nextPeriod}. Plan for rest if needed.`
      }
    }

    if (parseFloat(summaryData.summary.avgHydration) >= 2000 && parseFloat(summaryData.summary.avgSleep) >= 7) {
      correlation = "Your optimal hydration and sleep patterns are setting a strong foundation for your overall health."
    } else if (parseFloat(summaryData.summary.avgHydration) < 1500) {
      correlation = "Low hydration often correlates with increased fatigue and headaches. Increasing water intake might improve how you feel."
    }

    return { pattern, prediction, correlation }
  }, [summaryData])

  if (loading) {
    return (
      <section id="health" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <p className="text-xl text-gray-500">Loading your health data...</p>
        </div>
      </section>
    )
  }

  const isEmpty = !summaryData || (
    (!summaryData.mood || summaryData.mood.length === 0) &&
    (!summaryData.sleep || summaryData.sleep.length === 0) &&
    (!summaryData.hydration || summaryData.hydration.length === 0) &&
    (!summaryData.activity || summaryData.activity.length === 0) &&
    (!summaryData.symptoms || summaryData.symptoms.length === 0)
  )

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
          <div className="overflow-x-auto pb-1 max-w-full -mx-2 px-2 sm:mx-0 sm:px-0">
            <TabsList className="flex w-max sm:w-full sm:grid sm:grid-cols-4 lg:w-fit mx-auto gap-1">
              <TabsTrigger value="overview" className="px-4 py-2 text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="cycle" className="px-4 py-2 text-xs sm:text-sm">Cycle</TabsTrigger>
              <TabsTrigger value="symptoms" className="px-4 py-2 text-xs sm:text-sm">Symptoms</TabsTrigger>
              <TabsTrigger value="insights" className="px-4 py-2 text-xs sm:text-sm">Insights</TabsTrigger>
            </TabsList>
          </div>

          {isEmpty ? (
            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-pink-100 shadow-sm mt-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Health Data Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">Start logging your health data (sleep, hydration, activity, and mood) to see your personalized trends and AI insights.</p>
              <Button onClick={() => setIsLoggingOpen(true)} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-lg">Start Logging</Button>
            </div>
          ) : (
            <>
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
                      {summaryDetails.achievements.length > 0 ? (
                        summaryDetails.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            {achievement}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400 italic">No achievements yet</li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Reminders</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {summaryDetails.reminders.length > 0 ? (
                        summaryDetails.reminders.map((reminder, idx) => (
                          <li key={idx} className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-orange-500" />
                            {reminder}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400 italic">All caught up!</li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Wellness Score</h4>
                    <div className="flex items-center space-x-3">
                      <div className={`text-3xl font-bold ${summaryDetails.score >= 80 ? 'text-green-600' : summaryDetails.score >= 60 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {summaryDetails.score}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>{summaryDetails.status}</div>
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
                    <div className="text-3xl font-bold text-pink-600 mb-2">Day {summaryData?.currentCycle?.day || 1}</div>
                    <div className="text-sm text-gray-600">Current Cycle Day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{summaryData?.currentCycle?.phase || "Unknown"}</div>
                    <div className="text-sm text-gray-600">Phase</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{summaryData?.currentCycle?.nextPeriod || "Unknown"}</div>
                    <div className="text-sm text-gray-600">Next Period</div>
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
                <Button onClick={() => setIsLoggingOpen(true)} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
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
                      {insights?.pattern}
                    </p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Predictive Analysis</h4>
                    <p className="text-sm text-gray-600">
                      {insights?.prediction}
                    </p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Wellness Correlation</h4>
                    <p className="text-sm text-gray-600">
                      {insights?.correlation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-pink-500" />
                    Visual Wellness Guides
                  </h3>
                  <p className="text-gray-600 mt-1">Simple, comic-style guides available in multiple languages</p>
                </div>
              </div>
              <ComicStripViewer 
                category="menstrual-health" 
                title="Understanding Your Cycle" 
              />
            </div>
          </TabsContent>
          </>
          )}
        </Tabs>
      </div>

      <HealthLoggingModal 
        isOpen={isLoggingOpen} 
        onClose={() => setIsLoggingOpen(false)} 
        onSuccess={() => {
          setIsLoggingOpen(false)
          fetchSummary()
        }} 
      />
    </section>
  )
}
