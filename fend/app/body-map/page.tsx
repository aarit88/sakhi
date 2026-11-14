'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AlertTriangle, Box, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { BodyMap3D, BodyRegionMeta, BodyViewSide } from '@/components/BodyMap3D';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

const QUICK_REGIONS: BodyRegionMeta[] = [
  { id: 'pelvis_uterus', label: 'Deep Pelvic & Uterine Region', defaultSide: 'front' },
  { id: 'lower_abdomen', label: 'Lower Abdomen & Pelvic Anterior', defaultSide: 'front' },
  { id: 'lower_back', label: 'Lower Back (Lumbar)', defaultSide: 'back' },
  { id: 'upper_abdomen', label: 'Upper Abdomen & Stomach', defaultSide: 'front' },
  { id: 'chest_breast', label: 'Chest & Breast Tissue', defaultSide: 'front' },
  { id: 'head', label: 'Head & Temples', defaultSide: 'front' },
  { id: 'left_hip', label: 'Left Hip / Ovary Side', defaultSide: 'left' },
  { id: 'right_hip', label: 'Right Hip / Ovary Side', defaultSide: 'right' },
];

export default function BodyMapPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [viewSide, setViewSide] = useState<BodyViewSide>('front');
  const [selectedRegion, setSelectedRegion] = useState<BodyRegionMeta>(QUICK_REGIONS[0]);
  const [symptom, setSymptom] = useState('Cramping');
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState('2 hours');
  const [frequency, setFrequency] = useState('Intermittent');
  const [onset, setOnset] = useState('Gradual');
  const [cycleContext, setCycleContext] = useState('Menstrual Days 1-3');
  const [associated, setAssociated] = useState<string[]>(['Fatigue']);
  const [notes, setNotes] = useState('');

  const [logs, setLogs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      const res = await apiClient.get('/api/body-map');
      if (res?.success) setLogs(res.logs || []);
    } catch {
      // handled cleanly
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) loadLogs();
  }, [isAuthenticated, isLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSafetyAlert(null);
    try {
      const res = await apiClient.post('/api/body-map', {
        regionId: selectedRegion.id,
        regionLabel: selectedRegion.label,
        viewSide: viewSide === 'pelvis' ? 'front' : viewSide,
        symptom,
        severity,
        duration,
        frequency,
        onset,
        associatedSymptoms: associated,
        cycleContext,
        notes,
      });

      if (res.safety?.triggered) {
        setSafetyAlert(res.safety.urgentGuidance);
      }
      toast.success(`Saved ${selectedRegion.label} entry`);
      setNotes('');
      await loadLogs();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/body-map?id=${id}`);
      toast.success('Entry deleted');
      await loadLogs();
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleAssociated = (item: string) => {
    setAssociated((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Box className="h-6 w-6 text-rose-600" /> Interactive 3D Body Map
            </h1>
            <p className="text-sm text-slate-600">
              Rotate, zoom, and tap any anatomical region to log localized pain or symptoms synced to your clinical profile.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-white p-1">
            {(['front', 'back', 'left', 'right', 'pelvis'] as BodyViewSide[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setViewSide(v)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  viewSide === v ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {v === 'pelvis' ? 'Pelvis Focus' : v}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setViewSide('front')}
              className="rounded-md px-2 py-1.5 text-slate-500 hover:bg-slate-100"
              title="Reset camera"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {safetyAlert && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Medical Safety Notice</p>
              <p className="mt-1">{safetyAlert}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-4">
            <BodyMap3D
              selectedRegionId={selectedRegion.id}
              viewSide={viewSide}
              logs={logs.map((l) => ({ id: l.id, regionId: l.regionId, severity: l.severity, symptom: l.symptom }))}
              onSelectRegion={(r) => {
                setSelectedRegion(r);
                toast.success(`Selected ${r.label}`);
              }}
            />
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold text-slate-500 mb-2">Quick Anatomical Region Jump</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REGIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(r);
                      setViewSide(r.defaultSide);
                    }}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                      selectedRegion.id === r.id
                        ? 'border-rose-300 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-base">
                  Capture Symptom — <span className="text-rose-600">{selectedRegion.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Symptom / Sensation</Label>
                      <Input value={symptom} onChange={(e) => setSymptom(e.target.value)} required placeholder="e.g. Sharp ache, Cramping" />
                    </div>
                    <div className="space-y-1">
                      <Label>Severity: {severity}/10</Label>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={severity}
                        onChange={(e) => setSeverity(Number(e.target.value))}
                        className="w-full accent-rose-600 mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Duration</Label>
                      <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 2 hours" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Frequency</Label>
                      <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                      >
                        <option value="First time">First time</option>
                        <option value="Intermittent">Intermittent</option>
                        <option value="Constant">Constant</option>
                        <option value="Recurring monthly">Recurring monthly</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Onset</Label>
                      <select
                        value={onset}
                        onChange={(e) => setOnset(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-xs"
                      >
                        <option value="Gradual">Gradual</option>
                        <option value="Sudden">Sudden</option>
                        <option value="Post-activity">Post-activity</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Cycle / Health Context</Label>
                    <Input value={cycleContext} onChange={(e) => setCycleContext(e.target.value)} placeholder="e.g. Luteal Day 24, After meal" />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Associated Symptoms</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Fatigue', 'Nausea', 'Bloating', 'Dizziness', 'Heavy Flow', 'Fever'].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleAssociated(item)}
                          className={`rounded-md border px-2 py-1 text-xs ${
                            associated.includes(item)
                              ? 'border-rose-300 bg-rose-50 text-rose-700 font-medium'
                              : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Notes</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="What relieves or worsens it?" />
                  </div>

                  <Button type="submit" disabled={saving} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {saving ? 'Saving to Profile...' : 'Save Body-Map Symptom'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-base">Recent Localized History ({logs.length})</CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No localized entries recorded yet.</p>
                ) : (
                  logs.map((l) => (
                    <div key={l.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {l.regionLabel} · <span className="text-rose-700">{l.symptom} ({l.severity}/10)</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {l.duration || 'N/A'} · {l.frequency || 'N/A'} · {new Date(l.recordedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(l.id)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
