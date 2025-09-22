"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Thermometer,
  Droplets,
  Lightbulb,
  Wifi,
  WifiOff,
  Battery,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Palette,
} from "lucide-react"

export default function DevicesPage() {
  const [heatPackTemp, setHeatPackTemp] = useState([40])
  const [heatPackOn, setHeatPackOn] = useState(true)
  const [heatPackTimer, setHeatPackTimer] = useState([30])

  const [bottleTemp, setBottleTemp] = useState([65])
  const [bottleReminder, setBottleReminder] = useState(true)
  const [bottleInterval, setBottleInterval] = useState([60])

  const [lightBrightness, setLightBrightness] = useState([75])
  const [lightOn, setLightOn] = useState(true)
  const [lightColor, setLightColor] = useState("soft-blue")

  const devices = [
    {
      id: "heat-pack",
      name: "Smart Heat Pack",
      icon: Thermometer,
      status: "connected",
      battery: 85,
      description: "Wearable heat therapy with precise temperature control",
    },
    {
      id: "smart-bottle",
      name: "Smart Water Bottle",
      icon: Droplets,
      status: "connected",
      battery: 92,
      description: "Hydration tracking with warming function",
    },
    {
      id: "aura-light",
      name: "AURA Mood Light",
      icon: Lightbulb,
      status: "connected",
      battery: 78,
      description: "Ambient lighting for mood enhancement",
    },
  ]

  const lightColors = [
    { id: "soft-blue", name: "Soft Blue", color: "bg-blue-400", description: "Calming and peaceful" },
    { id: "warm-orange", name: "Warm Orange", color: "bg-orange-400", description: "Energizing and uplifting" },
    { id: "gentle-pink", name: "Gentle Pink", color: "bg-pink-400", description: "Soothing and nurturing" },
    { id: "forest-green", name: "Forest Green", color: "bg-green-400", description: "Grounding and balanced" },
    { id: "lavender", name: "Lavender", color: "bg-purple-400", description: "Relaxing and meditative" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Connected Devices</h1>
          <p className="text-muted-foreground">
            Control your smart health devices for personalized comfort and wellness
          </p>
        </div>

        {/* Device Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {devices.map((device) => (
            <Card key={device.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <device.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{device.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {device.status === "connected" ? (
                          <>
                            <Wifi className="h-3 w-3 text-green-500" />
                            <Badge variant="default" className="text-xs">
                              Connected
                            </Badge>
                          </>
                        ) : (
                          <>
                            <WifiOff className="h-3 w-3 text-red-500" />
                            <Badge variant="destructive" className="text-xs">
                              Offline
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Battery className="h-3 w-3" />
                    {device.battery}%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{device.description}</p>
                <Progress value={device.battery} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Device Controls */}
        <Tabs defaultValue="heat-pack" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="heat-pack" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Heat Pack
            </TabsTrigger>
            <TabsTrigger value="smart-bottle" className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Smart Bottle
            </TabsTrigger>
            <TabsTrigger value="aura-light" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              AURA Light
            </TabsTrigger>
          </TabsList>

          {/* Heat Pack Controls */}
          <TabsContent value="heat-pack" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-primary" />
                    Temperature Control
                  </CardTitle>
                  <CardDescription>Adjust heat intensity for optimal comfort</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Power</span>
                    <Switch checked={heatPackOn} onCheckedChange={setHeatPackOn} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Temperature</span>
                      <span className="text-2xl font-bold text-primary">{heatPackTemp[0]}°C</span>
                    </div>
                    <Slider
                      value={heatPackTemp}
                      onValueChange={setHeatPackTemp}
                      max={50}
                      min={30}
                      step={1}
                      className="w-full"
                      disabled={!heatPackOn}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>30°C (Cool)</span>
                      <span>50°C (Hot)</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Timer</span>
                      <span className="text-lg font-semibold">{heatPackTimer[0]} min</span>
                    </div>
                    <Slider
                      value={heatPackTimer}
                      onValueChange={setHeatPackTimer}
                      max={120}
                      min={10}
                      step={5}
                      className="w-full"
                      disabled={!heatPackOn}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10 min</span>
                      <span>2 hours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-secondary" />
                    Quick Presets
                  </CardTitle>
                  <CardDescription>Pre-configured settings for different needs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      setHeatPackTemp([35])
                      setHeatPackTimer([60])
                      setHeatPackOn(true)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <div className="text-left">
                        <div className="font-medium">Gentle Relief</div>
                        <div className="text-xs text-muted-foreground">35°C for 1 hour</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      setHeatPackTemp([42])
                      setHeatPackTimer([30])
                      setHeatPackOn(true)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                      <div className="text-left">
                        <div className="font-medium">Moderate Relief</div>
                        <div className="text-xs text-muted-foreground">42°C for 30 min</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      setHeatPackTemp([48])
                      setHeatPackTimer([20])
                      setHeatPackOn(true)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="text-left">
                        <div className="font-medium">Intense Relief</div>
                        <div className="text-xs text-muted-foreground">48°C for 20 min</div>
                      </div>
                    </div>
                  </Button>

                  <div className="pt-4 border-t">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Smart Bottle Controls */}
          <TabsContent value="smart-bottle" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-secondary" />
                    Hydration Settings
                  </CardTitle>
                  <CardDescription>Stay hydrated with smart reminders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Hydration Reminders</span>
                    <Switch checked={bottleReminder} onCheckedChange={setBottleReminder} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Reminder Interval</span>
                      <span className="text-lg font-semibold">{bottleInterval[0]} min</span>
                    </div>
                    <Slider
                      value={bottleInterval}
                      onValueChange={setBottleInterval}
                      max={180}
                      min={15}
                      step={15}
                      className="w-full"
                      disabled={!bottleReminder}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>15 min</span>
                      <span>3 hours</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Warming Temperature</span>
                      <span className="text-lg font-semibold">{bottleTemp[0]}°C</span>
                    </div>
                    <Slider
                      value={bottleTemp}
                      onValueChange={setBottleTemp}
                      max={80}
                      min={40}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>40°C (Warm)</span>
                      <span>80°C (Hot)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Hydration</CardTitle>
                  <CardDescription>Track your daily water intake</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary">1.2L</div>
                    <p className="text-sm text-muted-foreground">of 2.5L daily goal</p>
                  </div>
                  <Progress value={48} className="h-3" />

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold">6</div>
                      <p className="text-xs text-muted-foreground">Glasses today</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold">4</div>
                      <p className="text-xs text-muted-foreground">Reminders sent</p>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Droplets className="h-4 w-4 mr-2" />
                    Log Water Intake
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AURA Light Controls */}
          <TabsContent value="aura-light" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    Light Settings
                  </CardTitle>
                  <CardDescription>Adjust ambient lighting for mood enhancement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Power</span>
                    <Switch checked={lightOn} onCheckedChange={setLightOn} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Brightness</span>
                      <span className="text-lg font-semibold">{lightBrightness[0]}%</span>
                    </div>
                    <Slider
                      value={lightBrightness}
                      onValueChange={setLightBrightness}
                      max={100}
                      min={10}
                      step={5}
                      className="w-full"
                      disabled={!lightOn}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-accent" />
                    Color Therapy
                  </CardTitle>
                  <CardDescription>Choose colors based on your current mood</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lightColors.map((color) => (
                    <Button
                      key={color.id}
                      variant={lightColor === color.id ? "default" : "outline"}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => setLightColor(color.id)}
                      disabled={!lightOn}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${color.color}`}></div>
                        <div className="text-left">
                          <div className="font-medium">{color.name}</div>
                          <div className="text-xs text-muted-foreground">{color.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full bg-transparent">
                      <Timer className="h-4 w-4 mr-2" />
                      Set Auto Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
