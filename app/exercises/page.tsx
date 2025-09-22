"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, Clock, Target, Heart, Zap, Moon, Flower2, Timer } from "lucide-react"

export default function ExercisesPage() {
  const [selectedCategory, setSelectedCategory] = useState("pain-relief")
  const [activeExercise, setActiveExercise] = useState<string | null>(null)
  const [exerciseTimer, setExerciseTimer] = useState(0)

  const categories = [
    { id: "pain-relief", name: "Pain Relief", icon: Heart, color: "text-red-500" },
    { id: "energy-boost", name: "Energy Boost", icon: Zap, color: "text-yellow-500" },
    { id: "relaxation", name: "Relaxation", icon: Moon, color: "text-blue-500" },
    { id: "hormonal-balance", name: "Hormonal Balance", icon: Flower2, color: "text-purple-500" },
  ]

  const exercises = {
    "pain-relief": [
      {
        id: "childs-pose",
        name: "Child's Pose (Balasana)",
        duration: "3-5 minutes",
        difficulty: "Beginner",
        benefits: ["Relieves lower back pain", "Calms the nervous system", "Reduces stress"],
        instructions: [
          "Kneel on the floor with your big toes touching",
          "Sit back on your heels and separate your knees hip-width apart",
          "Fold forward, extending your arms in front of you",
          "Rest your forehead on the mat and breathe deeply",
          "Hold for 3-5 minutes, focusing on your breath",
        ],
        image: "/woman-doing-child-pose-yoga.jpg",
      },
      {
        id: "gentle-pelvic-tilts",
        name: "Gentle Pelvic Tilts",
        duration: "5-10 minutes",
        difficulty: "Beginner",
        benefits: ["Relieves lower back tension", "Strengthens core", "Improves posture"],
        instructions: [
          "Lie on your back with knees bent, feet flat on floor",
          "Place hands on your lower ribs",
          "Gently tilt your pelvis, pressing lower back into floor",
          "Hold for 5 seconds, then release",
          "Repeat 10-15 times slowly",
        ],
        image: "/woman-doing-pelvic-tilts-exercise.jpg",
      },
      {
        id: "cat-cow-stretch",
        name: "Cat-Cow Stretch",
        duration: "5 minutes",
        difficulty: "Beginner",
        benefits: ["Relieves back pain", "Improves spinal flexibility", "Reduces tension"],
        instructions: [
          "Start on hands and knees in tabletop position",
          "Inhale, arch your back and look up (Cow pose)",
          "Exhale, round your spine and tuck chin (Cat pose)",
          "Move slowly between poses with your breath",
          "Continue for 5-10 breaths",
        ],
        image: "/woman-doing-cat-cow-yoga-stretch.jpg",
      },
    ],
    "energy-boost": [
      {
        id: "sun-salutation",
        name: "Sun Salutation (Surya Namaskara)",
        duration: "10-15 minutes",
        difficulty: "Intermediate",
        benefits: ["Increases energy", "Improves circulation", "Strengthens entire body"],
        instructions: [
          "Start in Mountain Pose with palms together",
          "Inhale, sweep arms overhead",
          "Exhale, fold forward into Forward Fold",
          "Step back into Downward Dog",
          "Flow through the complete sequence 5-8 times",
        ],
        image: "/woman-doing-sun-salutation-yoga-sequence.jpg",
      },
      {
        id: "warrior-poses",
        name: "Warrior Pose Sequence",
        duration: "8-12 minutes",
        difficulty: "Intermediate",
        benefits: ["Builds strength", "Improves balance", "Boosts confidence"],
        instructions: [
          "Start in Warrior I with front knee bent",
          "Hold for 30 seconds, breathing deeply",
          "Transition to Warrior II, opening hips",
          "Move to Warrior III for balance challenge",
          "Repeat on both sides",
        ],
        image: "/woman-doing-warrior-yoga-poses.jpg",
      },
    ],
    relaxation: [
      {
        id: "legs-up-wall",
        name: "Legs Up the Wall (Viparita Karani)",
        duration: "10-15 minutes",
        difficulty: "Beginner",
        benefits: ["Reduces anxiety", "Improves circulation", "Calms nervous system"],
        instructions: [
          "Lie on your back near a wall",
          "Extend legs up the wall, arms relaxed at sides",
          "Close your eyes and focus on breathing",
          "Stay for 10-15 minutes",
          "Come out slowly by rolling to one side",
        ],
        image: "/woman-doing-legs-up-wall-yoga-pose.jpg",
      },
      {
        id: "corpse-pose",
        name: "Corpse Pose (Savasana)",
        duration: "10-20 minutes",
        difficulty: "Beginner",
        benefits: ["Deep relaxation", "Reduces stress", "Improves sleep quality"],
        instructions: [
          "Lie flat on your back, arms at sides",
          "Let your feet fall open naturally",
          "Close your eyes and breathe naturally",
          "Scan your body from head to toe, releasing tension",
          "Rest for 10-20 minutes in complete stillness",
        ],
        image: "/woman-in-corpse-pose-savasana-relaxation.jpg",
      },
    ],
    "hormonal-balance": [
      {
        id: "butterfly-pose",
        name: "Butterfly Pose (Baddha Konasana)",
        duration: "5-8 minutes",
        difficulty: "Beginner",
        benefits: ["Stimulates reproductive organs", "Improves hip flexibility", "Balances hormones"],
        instructions: [
          "Sit with soles of feet together, knees bent out",
          "Hold your feet with your hands",
          "Gently draw heels toward your pelvis",
          "Breathe deeply and hold for 5-8 minutes",
          "Optional: gently fold forward for deeper stretch",
        ],
        image: "/woman-doing-butterfly-pose-yoga.jpg",
      },
      {
        id: "goddess-pose",
        name: "Goddess Pose (Utkata Konasana)",
        duration: "3-5 minutes",
        difficulty: "Intermediate",
        benefits: ["Strengthens pelvic floor", "Improves circulation", "Balances hormones"],
        instructions: [
          "Stand with feet wide, toes turned out",
          "Bend knees and lower into a squat",
          "Keep spine straight, arms can be on hips or overhead",
          "Hold for 30 seconds to 1 minute",
          "Repeat 3-5 times with rest between",
        ],
        image: "/woman-doing-goddess-pose-yoga-squat.jpg",
      },
    ],
  }

  const currentExercises = exercises[selectedCategory as keyof typeof exercises]

  const startExercise = (exerciseId: string) => {
    setActiveExercise(exerciseId)
    setExerciseTimer(0)
  }

  const stopExercise = () => {
    setActiveExercise(null)
    setExerciseTimer(0)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Exercise & Wellness Hub</h1>
          <p className="text-muted-foreground">
            Personalized yoga and exercises for menstrual health and overall wellness
          </p>
        </div>

        {/* Category Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Choose Your Focus</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all ${
                  selectedCategory === category.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="flex flex-col items-center gap-3 p-4">
                  <div className={`p-3 bg-muted rounded-full ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-center text-sm">{category.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentExercises.map((exercise) => (
            <Card key={exercise.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={exercise.image || "/placeholder.svg"}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={exercise.difficulty === "Beginner" ? "secondary" : "default"}>
                    {exercise.difficulty}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-lg">{exercise.name}</CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {exercise.duration}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Benefits
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {exercise.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  {activeExercise === exercise.id ? (
                    <>
                      <Button size="sm" variant="outline" onClick={stopExercise} className="flex-1 bg-transparent">
                        <Pause className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                      <Button size="sm" variant="outline">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => startExercise(exercise.id)} className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Start Exercise
                    </Button>
                  )}
                </div>

                {activeExercise === exercise.id && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">In Progress</span>
                      <span className="text-sm text-primary">
                        <Timer className="h-3 w-3 inline mr-1" />
                        {Math.floor(exerciseTimer / 60)}:{(exerciseTimer % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <Progress value={(exerciseTimer / 300) * 100} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Exercise Instructions Modal/Detailed View */}
        <div className="mt-12">
          <Tabs defaultValue="instructions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="progress">My Progress</TabsTrigger>
              <TabsTrigger value="routines">Custom Routines</TabsTrigger>
            </TabsList>

            <TabsContent value="instructions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exercise Instructions</CardTitle>
                  <CardDescription>Detailed step-by-step guidance for safe and effective practice</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentExercises.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">{currentExercises[0].name}</h3>
                      <ol className="space-y-2">
                        {currentExercises[0].instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-sm">{instruction}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Exercise Progress</CardTitle>
                  <CardDescription>Track your wellness journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">12</div>
                      <p className="text-sm text-muted-foreground">Sessions This Week</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-secondary">45</div>
                      <p className="text-sm text-muted-foreground">Minutes Today</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-accent">7</div>
                      <p className="text-sm text-muted-foreground">Day Streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="routines" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Routines</CardTitle>
                  <CardDescription>Create personalized exercise sequences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Create New Routine
                    </Button>
                    <div className="text-center text-muted-foreground">
                      <p>No custom routines yet. Create your first routine to get started!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
