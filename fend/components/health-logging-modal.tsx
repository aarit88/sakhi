"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"

interface HealthLoggingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function HealthLoggingModal({ isOpen, onClose, onSuccess }: HealthLoggingModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Forms state
  const [mood, setMood] = useState({ score: "8", notes: "" })
  const [sleep, setSleep] = useState({ hours: "8", quality: "4" })
  const [hydration, setHydration] = useState({ intake: "1500", target: "2500" })
  const [activity, setActivity] = useState({ steps: "5000", calories: "300" })
  const [symptoms, setSymptoms] = useState({ type: "Cramps", severity: "mild" })
  const [cycle, setCycle] = useState({ startDate: new Date().toISOString().split("T")[0], flowIntensity: "medium", notes: "" })

  const handleSubmit = async (endpoint: string, payload: any) => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiClient.post(endpoint, payload)
      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.error || "Failed to save data")
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit("/api/health/mood", { date: new Date().toISOString(), score: parseInt(mood.score), notes: mood.notes })
  }

  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit("/api/health/sleep", { date: new Date().toISOString(), hours: parseFloat(sleep.hours), quality: parseInt(sleep.quality) })
  }

  const handleHydrationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit("/api/health/hydration", { date: new Date().toISOString(), intake: parseFloat(hydration.intake), target: parseFloat(hydration.target) })
  }

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit("/api/health/activity", { date: new Date().toISOString(), steps: parseInt(activity.steps), calories: parseInt(activity.calories) })
  }

  const handleSymptomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit("/api/health/symptoms", { date: new Date().toISOString(), type: symptoms.type, severity: symptoms.severity })
  }

  const handleCycleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit("/api/health/cycle", { startDate: new Date(cycle.startDate).toISOString(), flowIntensity: cycle.flowIntensity, notes: cycle.notes })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white text-gray-900 border border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Log Health Data</DialogTitle>
          <DialogDescription>
            Record your daily health metrics to get personalized insights.
          </DialogDescription>
        </DialogHeader>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <Tabs defaultValue="mood" className="w-full">
          <div className="overflow-x-auto pb-1 max-w-full -mx-1 px-1">
            <TabsList className="flex w-max sm:w-full sm:grid sm:grid-cols-6 mb-4 h-auto py-1 gap-1">
              <TabsTrigger value="mood" className="px-3 py-1.5 text-xs sm:text-sm">Mood</TabsTrigger>
              <TabsTrigger value="sleep" className="px-3 py-1.5 text-xs sm:text-sm">Sleep</TabsTrigger>
              <TabsTrigger value="hydration" className="px-3 py-1.5 text-xs sm:text-sm">Hydration</TabsTrigger>
              <TabsTrigger value="activity" className="px-3 py-1.5 text-xs sm:text-sm">Activity</TabsTrigger>
              <TabsTrigger value="symptoms" className="px-3 py-1.5 text-xs sm:text-sm">Symptoms</TabsTrigger>
              <TabsTrigger value="cycle" className="px-3 py-1.5 text-xs sm:text-sm">Cycle</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="mood">
            <form onSubmit={handleMoodSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="score">Mood Score (1-10)</Label>
                <Input id="score" type="number" min="1" max="10" className="bg-white border-gray-300" value={mood.score} onChange={(e) => setMood({ ...mood, score: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="How are you feeling?" className="bg-white border-gray-300" value={mood.notes} onChange={(e) => setMood({ ...mood, notes: e.target.value })} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white">Save Mood</Button>
            </form>
          </TabsContent>

          <TabsContent value="sleep">
            <form onSubmit={handleSleepSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours Slept</Label>
                <Input id="hours" type="number" step="0.5" min="0" max="24" className="bg-white border-gray-300" value={sleep.hours} onChange={(e) => setSleep({ ...sleep, hours: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality">Sleep Quality (1-5)</Label>
                <Input id="quality" type="number" min="1" max="5" className="bg-white border-gray-300" value={sleep.quality} onChange={(e) => setSleep({ ...sleep, quality: e.target.value })} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">Save Sleep</Button>
            </form>
          </TabsContent>

          <TabsContent value="hydration">
            <form onSubmit={handleHydrationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="intake">Intake (ml)</Label>
                <Input id="intake" type="number" min="0" className="bg-white border-gray-300" value={hydration.intake} onChange={(e) => setHydration({ ...hydration, intake: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target (ml)</Label>
                <Input id="target" type="number" min="1" className="bg-white border-gray-300" value={hydration.target} onChange={(e) => setHydration({ ...hydration, target: e.target.value })} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">Save Hydration</Button>
            </form>
          </TabsContent>

          <TabsContent value="activity">
            <form onSubmit={handleActivitySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="steps">Steps</Label>
                <Input id="steps" type="number" min="0" className="bg-white border-gray-300" value={activity.steps} onChange={(e) => setActivity({ ...activity, steps: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calories">Calories</Label>
                <Input id="calories" type="number" min="0" className="bg-white border-gray-300" value={activity.calories} onChange={(e) => setActivity({ ...activity, calories: e.target.value })} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white">Save Activity</Button>
            </form>
          </TabsContent>

          <TabsContent value="symptoms">
            <form onSubmit={handleSymptomSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Symptom Type</Label>
                <Input id="type" type="text" className="bg-white border-gray-300" value={symptoms.type} onChange={(e) => setSymptoms({ ...symptoms, type: e.target.value })} placeholder="e.g. Headache, Cramps" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <select 
                  id="severity" 
                  value={symptoms.severity} 
                  onChange={(e) => setSymptoms({ ...symptoms, severity: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="mild">Mild</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white">Save Symptoms</Button>
            </form>
          </TabsContent>

          <TabsContent value="cycle">
            <form onSubmit={handleCycleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Period Start Date</Label>
                <Input id="startDate" type="date" className="bg-white border-gray-300" value={cycle.startDate} onChange={(e) => setCycle({ ...cycle, startDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flowIntensity">Flow Intensity</Label>
                <select 
                  id="flowIntensity" 
                  value={cycle.flowIntensity} 
                  onChange={(e) => setCycle({ ...cycle, flowIntensity: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Any cycle notes?" className="bg-white border-gray-300" value={cycle.notes} onChange={(e) => setCycle({ ...cycle, notes: e.target.value })} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Save Cycle</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
