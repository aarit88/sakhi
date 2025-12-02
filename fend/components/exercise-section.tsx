"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Target,
  Flame,
  Heart,
  Zap,
  Flower2,
  Sun,
  Moon,
  Activity,
  Award,
  Calendar,
  TrendingUp,
} from "lucide-react"

export function ExerciseSection() {
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null)
  const [workoutTimer, setWorkoutTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([])
  const [weeklyProgress, setWeeklyProgress] = useState(65)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && activeWorkout) {
      interval = setInterval(() => {
        setWorkoutTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, activeWorkout])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startWorkout = (workoutId: string) => {
    setActiveWorkout(workoutId)
    setWorkoutTimer(0)
    setIsTimerRunning(true)
  }

  const pauseWorkout = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const completeWorkout = () => {
    if (activeWorkout) {
      setCompletedWorkouts((prev) => [...prev, activeWorkout])
      setActiveWorkout(null)
      setIsTimerRunning(false)
      setWorkoutTimer(0)
      setWeeklyProgress((prev) => Math.min(100, prev + 10))
    }
  }

  const yogaWorkouts = [
    {
      id: "morning-flow",
      name: "Morning Flow",
      duration: "15 min",
      difficulty: "Beginner",
      calories: "45-60",
      description: "Gentle morning yoga to energize your day",
      poses: ["Sun Salutation", "Warrior I", "Tree Pose", "Child's Pose"],
      benefits: ["Flexibility", "Energy", "Focus"],
      icon: Sun,
      color: "from-orange-400 to-yellow-500",
    },
    {
      id: "evening-relax",
      name: "Evening Relaxation",
      duration: "20 min",
      difficulty: "Beginner",
      calories: "30-45",
      description: "Calming yoga sequence for better sleep",
      poses: ["Cat-Cow", "Pigeon Pose", "Legs Up Wall", "Savasana"],
      benefits: ["Relaxation", "Sleep", "Stress Relief"],
      icon: Moon,
      color: "from-purple-400 to-indigo-500",
    },
    {
      id: "cycle-support",
      name: "Menstrual Support",
      duration: "12 min",
      difficulty: "Gentle",
      calories: "25-35",
      description: "Gentle poses to ease menstrual discomfort",
      poses: ["Butterfly Pose", "Supine Twist", "Happy Baby", "Restorative Child's Pose"],
      benefits: ["Pain Relief", "Comfort", "Relaxation"],
      icon: Flower2,
      color: "from-pink-400 to-rose-500",
    },
  ]

  const fitnessWorkouts = [
    {
      id: "cardio-burst",
      name: "Cardio Burst",
      duration: "10 min",
      difficulty: "Intermediate",
      calories: "80-120",
      description: "High-intensity interval training",
      exercises: ["Jumping Jacks", "Burpees", "Mountain Climbers", "High Knees"],
      benefits: ["Cardio", "Fat Burn", "Endurance"],
      icon: Zap,
      color: "from-red-400 to-pink-500",
    },
    {
      id: "strength-basics",
      name: "Strength Basics",
      duration: "18 min",
      difficulty: "Beginner",
      calories: "60-90",
      description: "Build foundational strength",
      exercises: ["Squats", "Push-ups", "Planks", "Lunges"],
      benefits: ["Strength", "Muscle Tone", "Bone Health"],
      icon: Target,
      color: "from-green-400 to-emerald-500",
    },
    {
      id: "core-power",
      name: "Core Power",
      duration: "8 min",
      difficulty: "Intermediate",
      calories: "40-60",
      description: "Strengthen your core muscles",
      exercises: ["Bicycle Crunches", "Russian Twists", "Dead Bug", "Bird Dog"],
      benefits: ["Core Strength", "Posture", "Stability"],
      icon: Activity,
      color: "from-blue-400 to-cyan-500",
    },
  ]

  const renderWorkoutCard = (workout: any, type: string) => {
    const IconComponent = workout.icon
    const isActive = activeWorkout === workout.id
    const isCompleted = completedWorkouts.includes(workout.id)

    return (
      <Card
        key={workout.id}
        className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg card-hover ${
          isActive ? "ring-2 ring-pink-500 bg-pink-50" : ""
        } ${isCompleted ? "bg-green-50 border-green-200" : ""}`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${workout.color} flex items-center justify-center`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {workout.difficulty}
              </Badge>
              {isCompleted && (
                <Badge className="bg-green-100 text-green-700">
                  <Award className="w-3 h-3 mr-1" />
                  Done
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-lg font-semibold">{workout.name}</CardTitle>
          <p className="text-sm text-gray-600">{workout.description}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-1">
                <Timer className="w-4 h-4 text-gray-500" />
              </div>
              <div className="text-sm font-medium">{workout.duration}</div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-sm font-medium">{workout.calories}</div>
              <div className="text-xs text-gray-500">Calories</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Heart className="w-4 h-4 text-pink-500" />
              </div>
              <div className="text-sm font-medium">{workout.benefits.length}</div>
              <div className="text-xs text-gray-500">Benefits</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">{type === "yoga" ? "Key Poses:" : "Exercises:"}</div>
            <div className="flex flex-wrap gap-1">
              {(workout.poses || workout.exercises).slice(0, 3).map((item: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
              {(workout.poses || workout.exercises).length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{(workout.poses || workout.exercises).length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Benefits:</div>
            <div className="flex flex-wrap gap-1">
              {workout.benefits.map((benefit: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>

          {isActive && (
            <div className="bg-pink-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-pink-700">Workout Timer</span>
                <span className="text-2xl font-bold text-pink-600">{formatTime(workoutTimer)}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={pauseWorkout}
                  className="flex-1"
                  variant={isTimerRunning ? "outline" : "default"}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                  {isTimerRunning ? "Pause" : "Resume"}
                </Button>
                <Button size="sm" onClick={completeWorkout} className="flex-1 bg-green-500 hover:bg-green-600">
                  Complete
                </Button>
              </div>
            </div>
          )}

          {!isActive && !isCompleted && (
            <Button
              onClick={() => startWorkout(workout.id)}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Workout
            </Button>
          )}

          {isCompleted && (
            <Button onClick={() => startWorkout(workout.id)} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Do Again
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <section id="exercise" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Wellness{" "}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Exercise Hub
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Personalized workouts designed for women's health. From gentle yoga flows to energizing fitness routines,
            find the perfect exercise for every phase of your cycle.
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-12 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-pink-500" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Weekly Goal</span>
                  <span className="text-sm text-gray-600">{weeklyProgress}%</span>
                </div>
                <Progress value={weeklyProgress} className="h-2" />
                <div className="text-xs text-gray-500">4 of 6 workouts completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{completedWorkouts.length}</div>
                <div className="text-sm text-gray-600">Workouts This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">245</div>
                <div className="text-sm text-gray-600">Calories Burned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workout Tabs */}
        <Tabs defaultValue="yoga" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="yoga" className="flex items-center space-x-2">
              <Flower2 className="w-4 h-4" />
              <span>Yoga & Mindfulness</span>
            </TabsTrigger>
            <TabsTrigger value="fitness" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Fitness & Strength</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yoga" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {yogaWorkouts.map((workout) => renderWorkoutCard(workout, "yoga"))}
            </div>
          </TabsContent>

          <TabsContent value="fitness" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fitnessWorkouts.map((workout) => renderWorkoutCard(workout, "fitness"))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <Card className="mt-12 bg-gradient-to-r from-pink-100 to-rose-100 border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center text-pink-800">
              <Calendar className="w-5 h-5 mr-2" />
              This Month's Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-pink-700">12</div>
                <div className="text-sm text-pink-600">Workouts</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-orange-700">890</div>
                <div className="text-sm text-orange-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Timer className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-green-700">3.2</div>
                <div className="text-sm text-green-600">Hours</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg font-bold text-purple-700">5</div>
                <div className="text-sm text-purple-600">Streak Days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
