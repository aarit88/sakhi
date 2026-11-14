'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHealthSummary } from '@/hooks/use-health-data';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Brain, Calendar, Download, Droplets, Heart, Moon, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

export function DataVisualization() {
  const { data: healthData } = useHealthSummary();

  const moods = healthData?.mood ?? [];
  const sleepLogs = healthData?.sleep ?? [];
  const hydrationLogs = healthData?.hydration ?? [];
  const activities = healthData?.activity ?? [];

  const avgMoodRaw = moods.length
    ? moods.reduce((acc: number, m: any) => acc + Number(m.score || 0), 0) / moods.length
    : null;
  const wellnessScore = avgMoodRaw !== null ? Math.round((avgMoodRaw / 10) * 100) : null;
  const avgSleepDisplay = sleepLogs.length
    ? (sleepLogs.reduce((acc: number, s: any) => acc + Number(s.hours || 0), 0) / sleepLogs.length).toFixed(1)
    : null;
  const avgStepsRaw = activities.length
    ? activities.reduce((acc: number, a: any) => acc + Number(a.steps || 0), 0) / activities.length
    : null;

  const sleepData = sleepLogs
    .slice(0, 14)
    .reverse()
    .map((s: any) => ({
      date: new Date(s.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: s.hours,
    }));

  const moodChartData = moods
    .slice(0, 14)
    .reverse()
    .map((m: any) => ({
      date: new Date(m.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: m.score,
      energy: m.energyLevel ?? m.score,
    }));

  const hydrationData = hydrationLogs
    .slice(0, 14)
    .reverse()
    .map((h: any) => ({
      date: new Date(h.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      intake: h.intake,
    }));

  const handleExportJson = async () => {
    try {
      const payload = await apiClient.get('/api/user/profile?export=1');
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sakhi-health-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Health data exported');
    } catch {
      toast.error('Failed to export records');
    }
  };

  return (
    <section id="dashboard" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Trends & Visual Analytics</h2>
            <p className="text-sm text-slate-600 mt-1">Longitudinal sleep, mood, energy, and hydration trends from PostgreSQL.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportJson}>
            <Download className="h-4 w-4 mr-1.5" /> Export JSON Records
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <Card className="border-rose-100 bg-rose-50/40">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Wellness Index</p>
                <p className="text-2xl font-bold text-rose-700">{wellnessScore ?? '—'}</p>
              </div>
              <Heart className="h-7 w-7 text-rose-500" />
            </CardContent>
          </Card>
          <Card className="border-indigo-100 bg-indigo-50/40">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Avg Sleep</p>
                <p className="text-2xl font-bold text-indigo-700">{avgSleepDisplay ? `${avgSleepDisplay}h` : '—'}</p>
              </div>
              <Moon className="h-7 w-7 text-indigo-500" />
            </CardContent>
          </Card>
          <Card className="border-emerald-100 bg-emerald-50/40">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Avg Daily Steps</p>
                <p className="text-2xl font-bold text-emerald-700">{avgStepsRaw !== null ? Math.round(avgStepsRaw) : '—'}</p>
              </div>
              <Activity className="h-7 w-7 text-emerald-500" />
            </CardContent>
          </Card>
          <Card className="border-sky-100 bg-sky-50/40">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Avg Mood</p>
                <p className="text-2xl font-bold text-sky-700">{avgMoodRaw !== null ? `${avgMoodRaw.toFixed(1)}/10` : '—'}</p>
              </div>
              <Brain className="h-7 w-7 text-sky-500" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mood" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="mood">Mood & Energy</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
            <TabsTrigger value="hydration">Hydration</TabsTrigger>
          </TabsList>

          <TabsContent value="mood">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-rose-500" /> Mood & Energy Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {moodChartData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis domain={[0, 10]} stroke="#64748b" fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="mood" stroke="#e11d48" strokeWidth={2.5} name="Mood" />
                        <Line type="monotone" dataKey="energy" stroke="#0d9488" strokeWidth={2.5} name="Energy" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 flex items-center justify-center text-sm text-slate-500">
                    <Calendar className="h-4 w-4 mr-2" /> Log mood & energy scores to chart your pattern.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sleep">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Moon className="h-4 w-4 text-indigo-500" /> Sleep Duration (Hours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sleepData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sleepData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} name="Hours" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 flex items-center justify-center text-sm text-slate-500">Log sleep entries to visualize duration trends.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hydration">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Droplets className="h-4 w-4 text-sky-500" /> Daily Hydration (Liters)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hydrationData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hydrationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip />
                        <Area type="monotone" dataKey="intake" stroke="#0284c7" fill="#bae6fd" strokeWidth={2} name="Liters" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 flex items-center justify-center text-sm text-slate-500">Log water intake to visualize daily hydration.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
