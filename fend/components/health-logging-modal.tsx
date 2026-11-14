'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';

interface HealthLoggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function HealthLoggingModal({ isOpen, onClose, onSuccess }: HealthLoggingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mood, setMood] = useState({ score: '7', energyLevel: '7', moodTag: 'Calm', notes: '' });
  const [sleep, setSleep] = useState({ hours: '7.5', quality: 'good' });
  const [hydration, setHydration] = useState({ intakeLiters: '2.0', targetLiters: '2.5' });
  const [activity, setActivity] = useState({ steps: '6000', calories: '260', activeMinutes: '35', activityType: 'Walking' });
  const [symptoms, setSymptoms] = useState({ type: 'Cramping', severity: '5', category: 'pain', notes: '' });
  const [cycle, setCycle] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    flowIntensity: 'medium',
    crampsSeverity: '4',
    spotting: false,
    irregularities: '',
    notes: '',
  });

  const handleSubmit = async (endpoint: string, payload: any) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.post(endpoint, payload);
      if (res.success) {
        if (res.safety?.triggered) {
          toast.error(res.safety.urgentGuidance, { duration: 7000 });
        } else {
          toast.success('Health record saved to your profile');
        }
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to save data');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px] bg-white text-slate-900 border border-slate-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Log Health & Cycle Data</DialogTitle>
          <DialogDescription>
            Track cycle events, mood & energy, sleep, hydration, activity, symptoms, or medications.
          </DialogDescription>
        </DialogHeader>

        {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">{error}</div>}

        <Tabs defaultValue="cycle" className="w-full">
          <TabsList className="grid grid-cols-6 mb-4 h-auto py-1 gap-1">
            <TabsTrigger value="cycle" className="text-xs">Cycle</TabsTrigger>
            <TabsTrigger value="symptoms" className="text-xs">Symptom</TabsTrigger>
            <TabsTrigger value="mood" className="text-xs">Mood</TabsTrigger>
            <TabsTrigger value="sleep" className="text-xs">Sleep</TabsTrigger>
            <TabsTrigger value="hydration" className="text-xs">Water</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="cycle">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit('/api/health/cycle', {
                  startDate: cycle.startDate,
                  endDate: cycle.endDate || null,
                  flowIntensity: cycle.flowIntensity,
                  crampsSeverity: Number(cycle.crampsSeverity),
                  spotting: cycle.spotting,
                  irregularities: cycle.irregularities || null,
                  notes: cycle.notes,
                });
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Period Start Date</Label>
                  <Input type="date" value={cycle.startDate} onChange={(e) => setCycle({ ...cycle, startDate: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>End Date (optional)</Label>
                  <Input type="date" value={cycle.endDate} onChange={(e) => setCycle({ ...cycle, endDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Flow Intensity</Label>
                  <select
                    value={cycle.flowIntensity}
                    onChange={(e) => setCycle({ ...cycle, flowIntensity: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="spotting">Spotting</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Cramps Severity (0–10)</Label>
                  <Input type="number" min="0" max="10" value={cycle.crampsSeverity} onChange={(e) => setCycle({ ...cycle, crampsSeverity: e.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={cycle.spotting} onChange={(e) => setCycle({ ...cycle, spotting: e.target.checked })} />
                Spotting between cycles
              </label>
              <div className="space-y-1">
                <Label>Irregularities / Notes</Label>
                <Input placeholder="e.g., Delayed by 5 days, clots, fatigue" value={cycle.irregularities} onChange={(e) => setCycle({ ...cycle, irregularities: e.target.value })} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white">Save Period Log</Button>
            </form>
          </TabsContent>

          <TabsContent value="symptoms">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit('/api/health/symptoms', {
                  type: symptoms.type,
                  severity: Number(symptoms.severity),
                  category: symptoms.category,
                  notes: symptoms.notes,
                });
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Category</Label>
                  <select
                    value={symptoms.category}
                    onChange={(e) => setSymptoms({ ...symptoms, category: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="pain">Pain / Cramps</option>
                    <option value="hormonal">Hormonal / PMS</option>
                    <option value="digestive">Digestive / Bloating</option>
                    <option value="medication">Medication / Supplement</option>
                    <option value="event">Health Event</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Severity (1–10)</Label>
                  <Input type="number" min="1" max="10" value={symptoms.severity} onChange={(e) => setSymptoms({ ...symptoms, severity: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Symptom, Medication, or Event Name</Label>
                <Input value={symptoms.type} onChange={(e) => setSymptoms({ ...symptoms, type: e.target.value })} placeholder="e.g. Pelvic cramps, Iron tablet 65mg" required />
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea value={symptoms.notes} onChange={(e) => setSymptoms({ ...symptoms, notes: e.target.value })} placeholder="Triggers, timing, or relief noted..." />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white">Save Entry</Button>
            </form>
          </TabsContent>

          <TabsContent value="mood">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit('/api/health/mood', {
                  score: Number(mood.score),
                  energyLevel: Number(mood.energyLevel),
                  moodTag: mood.moodTag,
                  notes: mood.notes,
                });
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Mood Score (1–10)</Label>
                  <Input type="number" min="1" max="10" value={mood.score} onChange={(e) => setMood({ ...mood, score: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Energy Level (1–10)</Label>
                  <Input type="number" min="1" max="10" value={mood.energyLevel} onChange={(e) => setMood({ ...mood, energyLevel: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Mood State</Label>
                <Input value={mood.moodTag} onChange={(e) => setMood({ ...mood, moodTag: e.target.value })} placeholder="Calm, Anxious, Focused, Tired..." />
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea value={mood.notes} onChange={(e) => setMood({ ...mood, notes: e.target.value })} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white">Save Mood & Energy</Button>
            </form>
          </TabsContent>

          <TabsContent value="sleep">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit('/api/health/sleep', { hours: Number(sleep.hours), quality: sleep.quality });
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <Label>Hours Slept</Label>
                <Input type="number" step="0.5" min="0.5" max="24" value={sleep.hours} onChange={(e) => setSleep({ ...sleep, hours: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label>Sleep Quality</Label>
                <select
                  value={sleep.quality}
                  onChange={(e) => setSleep({ ...sleep, quality: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="poor">Poor</option>
                  <option value="fair">Fair</option>
                  <option value="good">Good</option>
                  <option value="excellent">Excellent</option>
                </select>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Save Sleep</Button>
            </form>
          </TabsContent>

          <TabsContent value="hydration">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit('/api/health/hydration', {
                  intake: Number(hydration.intakeLiters),
                  target: Number(hydration.targetLiters),
                });
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Water Intake (Liters)</Label>
                  <Input type="number" step="0.1" min="0.1" max="10" value={hydration.intakeLiters} onChange={(e) => setHydration({ ...hydration, intakeLiters: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Daily Target (Liters)</Label>
                  <Input type="number" step="0.1" min="0.5" max="8" value={hydration.targetLiters} onChange={(e) => setHydration({ ...hydration, targetLiters: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 text-white">Save Hydration</Button>
            </form>
          </TabsContent>

          <TabsContent value="activity">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit('/api/health/activity', {
                  steps: Number(activity.steps),
                  calories: Number(activity.calories),
                  activeMinutes: Number(activity.activeMinutes),
                  activityType: activity.activityType,
                });
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Steps</Label>
                  <Input type="number" min="0" value={activity.steps} onChange={(e) => setActivity({ ...activity, steps: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Active Minutes</Label>
                  <Input type="number" min="0" value={activity.activeMinutes} onChange={(e) => setActivity({ ...activity, activeMinutes: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Activity Type</Label>
                  <Input value={activity.activityType} onChange={(e) => setActivity({ ...activity, activityType: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Calories Burned</Label>
                  <Input type="number" min="0" value={activity.calories} onChange={(e) => setActivity({ ...activity, calories: e.target.value })} />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Save Activity</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
