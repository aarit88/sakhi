'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Activity,
  Box,
  Calendar,
  CheckCircle,
  Droplets,
  Moon,
  Plus,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import { useHealthSummary } from '@/hooks/use-health-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealthLoggingModal } from '@/components/health-logging-modal';
import { apiClient } from '@/lib/api-client';

export function HealthTracking() {
  const [isLoggingOpen, setIsLoggingOpen] = useState(false);
  const { data: summaryData, loading, fetchSummary } = useHealthSummary();

  const cycle = summaryData?.cycleInfo || {
    day: 0,
    phase: 'Unknown',
    nextPeriod: 'Log a period',
    cycleLength: 28,
    predictionNote: '',
  };

  const healthMetrics = useMemo(() => {
    const summary = summaryData?.summary || { avgSleep: '0', avgHydration: '0', avgSteps: 0 };
    return [
      {
        id: 'cycle',
        name: 'Cycle Day',
        icon: Calendar,
        value: cycle.day > 0 ? `Day ${cycle.day}` : 'Not started',
        status: cycle.phase,
        progress: cycle.day > 0 ? Math.min((cycle.day / (cycle.cycleLength || 28)) * 100, 100) : 0,
        insight: cycle.day > 0 ? `Next est: ${cycle.nextPeriod}` : 'Log a period to estimate',
      },
      {
        id: 'sleep',
        name: 'Sleep Average',
        icon: Moon,
        value: `${summary.avgSleep}h`,
        status: parseFloat(summary.avgSleep) >= 7 ? 'Rested' : 'Needs focus',
        progress: Math.min((parseFloat(summary.avgSleep) / 8) * 100, 100),
        insight: '14-day sleep average',
      },
      {
        id: 'activity',
        name: 'Daily Steps',
        icon: Activity,
        value: String(summary.avgSteps || 0),
        status: summary.avgSteps >= 5000 ? 'Active' : 'Light',
        progress: Math.min((summary.avgSteps / 10000) * 100, 100),
        insight: '14-day step average',
      },
      {
        id: 'hydration',
        name: 'Hydration',
        icon: Droplets,
        value: `${summary.avgHydration} ml`,
        status: parseFloat(summary.avgHydration) >= 2000 ? 'Optimal' : 'Low',
        progress: Math.min((parseFloat(summary.avgHydration) / 2500) * 100, 100),
        insight: 'Target 2,500 ml/day',
      },
    ];
  }, [summaryData, cycle]);

  const handleDeleteCycle = async (id: number) => {
    try {
      await apiClient.delete(`/api/health/cycle?id=${id}`);
      toast.success('Cycle entry deleted');
      await fetchSummary();
    } catch {
      toast.error('Failed to delete cycle entry');
    }
  };

  if (loading) {
    return (
      <section id="health" className="py-16 px-4 text-center">
        <p className="text-slate-500">Loading your wellness records...</p>
      </section>
    );
  }

  const periods = summaryData?.periods || [];
  const symptoms = summaryData?.symptoms || [];
  const bodyMaps = summaryData?.bodyMaps || [];
  const insights = summaryData?.insights || [];

  return (
    <section id="health" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Personalized Health & Cycle Hub</h2>
            <p className="text-sm text-slate-600 mt-1">
              Live PostgreSQL wellness overview combining cycle tracking, daily habits, 3D body-map logs, and lab reports.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsLoggingOpen(true)} className="bg-rose-600 hover:bg-rose-700 text-white">
              <Plus className="h-4 w-4 mr-1.5" /> Log Health Data
            </Button>
            <Link href="/body-map">
              <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">
                <Box className="h-4 w-4 mr-1.5" /> 3D Body Map
              </Button>
            </Link>
            <Link href="/doctor-portal">
              <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                <Stethoscope className="h-4 w-4 mr-1.5" /> Share with Doctor
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {healthMetrics.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.id} className="border-slate-200 bg-white">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{m.status}</span>
                  </div>
                  <CardTitle className="text-sm font-medium text-slate-600 mt-2">{m.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold text-slate-900">{m.value}</div>
                  <Progress value={m.progress} className="h-2" />
                  <p className="text-xs text-slate-500">{m.insight}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="cycle" className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="cycle">Cycle Calendar</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="bodymap">Body Map</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="cycle" className="space-y-4">
            <Card className="border-rose-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Cycle Estimate & Editable Period History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-rose-100 bg-rose-50/60 p-4 text-sm text-slate-700">
                  <div className="flex flex-wrap gap-6 font-medium">
                    <span>Current Phase: <strong className="text-rose-700">{cycle.phase}</strong></span>
                    <span>Avg Cycle: <strong>{cycle.cycleLength} days</strong></span>
                    {cycle.fertileWindowStart && (
                      <span>
                        Est. Fertile Window: <strong>{cycle.fertileWindowStart} → {cycle.fertileWindowEnd}</strong>
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-600">{cycle.predictionNote}</p>
                </div>

                {periods.length === 0 ? (
                  <p className="text-sm text-slate-500">No periods logged yet. Click &quot;Log Health Data&quot; to record a period.</p>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {periods.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {new Date(p.startDate).toLocaleDateString()}
                            {p.endDate ? ` — ${new Date(p.endDate).toLocaleDateString()}` : ''}
                          </p>
                          <p className="text-xs text-slate-500">
                            Flow: {p.flowIntensity || 'medium'}
                            {p.crampsSeverity !== null ? ` · Cramps: ${p.crampsSeverity}/10` : ''}
                            {p.spotting ? ' · Spotting noted' : ''}
                            {p.irregularities ? ` · ${p.irregularities}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCycle(p.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete cycle entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="symptoms">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Recent Symptoms, Pain & Medications</CardTitle>
              </CardHeader>
              <CardContent>
                {symptoms.length === 0 ? (
                  <p className="text-sm text-slate-500">No symptom entries recorded yet.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {symptoms.slice(0, 10).map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                        <div>
                          <p className="font-semibold text-slate-900">{s.type}</p>
                          <p className="text-xs text-slate-500">
                            {s.category} · {new Date(s.recordedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                          {s.severity}/10
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bodymap">
            <Card className="border-slate-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">3D Body Map Symptom Clusters</CardTitle>
                <Link href="/body-map" className="text-xs font-semibold text-rose-600 hover:underline">
                  Open Interactive 3D Map →
                </Link>
              </CardHeader>
              <CardContent>
                {bodyMaps.length === 0 ? (
                  <p className="text-sm text-slate-500">No anatomical regions logged yet. Tap regions on the 3D Body Map to capture localized pain.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {bodyMaps.slice(0, 8).map((b: any) => (
                      <div key={b.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span>{b.regionLabel} ({b.viewSide})</span>
                          <span className="text-rose-700">{b.severity}/10</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {b.symptom} {b.duration ? `· ${b.duration}` : ''} {b.cycleContext ? `· ${b.cycleContext}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Educational Wellness Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((line: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </div>
                ))}
                <p className="text-xs text-slate-500">
                  Insights are educational and summarize your own logged records. Discuss persistent concerns with a clinician.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <HealthLoggingModal
        isOpen={isLoggingOpen}
        onClose={() => setIsLoggingOpen(false)}
        onSuccess={() => {
          setIsLoggingOpen(false);
          fetchSummary();
        }}
      />
    </section>
  );
}
