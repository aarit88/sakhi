'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileImage,
  FileText,
  FlaskConical,
  GitCompare,
  Loader2,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

type MarkerStatus = 'low' | 'normal' | 'high' | 'critical' | 'unknown';

type ParsedMarker = {
  key: string;
  label: string;
  category: string;
  value: number;
  unit: string;
  detectedUnit?: string;
  status: MarkerStatus;
  referenceRange: string;
  finding: string;
  confidence?: string;
};

type ReportAlert = {
  severity: 'info' | 'caution' | 'urgent';
  title: string;
  message: string;
};

const sampleReport = `Complete Blood Count
Hemoglobin 10.8 g/dL
RBC Count 3.7 million/uL
WBC Count 12800 /cumm
Platelet Count 410000 /cumm
ESR 32 mm/hr
Thyroid Profile
TSH 6.8 mIU/L
Vitamins and Iron
Vitamin D 18 ng/mL
Vitamin B12 260 pg/mL
Ferritin 8 ng/mL
Metabolic
Fasting Glucose 106 mg/dL
HbA1c 5.9 %`;

function statusClasses(status: MarkerStatus) {
  if (status === 'critical') return 'border-red-200 bg-red-50 text-red-700';
  if (status === 'high') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (status === 'low') return 'border-sky-200 bg-sky-50 text-sky-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

export default function ClinicalReportsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pregnant, setPregnant] = useState(false);
  const [parsing, setParsing] = useState(false);

  const [reports, setReports] = useState<any[]>([]);
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Compare state
  const [baseId, setBaseId] = useState<string>('');
  const [compareId, setCompareId] = useState<string>('');
  const [diffs, setDiffs] = useState<any[] | null>(null);

  const fetchReports = async () => {
    try {
      const data = await apiClient.get('/api/clinical-reports');
      const list = data.reports || [];
      setReports(list);
      if (list.length >= 2 && !baseId && !compareId) {
        setBaseId(String(list[1].id));
        setCompareId(String(list[0].id));
      }
    } catch {
      toast.error('Could not load saved reports');
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) fetchReports();
  }, [isAuthenticated, isLoading, router]);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));

    if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
      const text = await file.text();
      setRawText(text);
    } else {
      setRawText('');
    }
  };

  const handleParseOrUpload = async (e: FormEvent) => {
    e.preventDefault();
    setParsing(true);
    try {
      let res: any;
      const isBinary = selectedFile && !selectedFile.type.startsWith('text/') && !selectedFile.name.endsWith('.txt');
      if (isBinary && selectedFile) {
        const fd = new FormData();
        fd.append('file', selectedFile);
        if (title) fd.append('title', title);
        fd.append('pregnant', String(pregnant));
        res = await apiClient.fetch('/api/clinical-reports/upload', { method: 'POST', body: fd });
      } else {
        res = await apiClient.post('/api/clinical-reports/parse', {
          title: title || 'Lab Report',
          text: rawText,
          pregnant,
          save: true,
        });
      }

      if (res?.report) {
        setActiveReport(res.report);
        setEditingText(res.report.parsedText || rawText);
        toast.success(res.usedOcr ? 'OCR extracted & report saved' : 'Report parsed & saved');
        await fetchReports();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Report processing failed');
    } finally {
      setParsing(false);
    }
  };

  const handleVerifyCorrection = async () => {
    if (!activeReport?.id) return;
    try {
      const res = await apiClient.fetch(`/api/clinical-reports/${activeReport.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ correctedText: editingText, verifiedByUser: true }),
      });
      setActiveReport(res.report);
      toast.success('Readings verified & saved');
      await fetchReports();
    } catch {
      toast.error('Failed to update verification');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/clinical-reports/${id}`);
      if (activeReport?.id === id) setActiveReport(null);
      setConfirmDeleteId(null);
      toast.success('Report deleted');
      await fetchReports();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleCompare = async () => {
    if (!baseId || !compareId || baseId === compareId) {
      toast.error('Select two different reports to compare');
      return;
    }
    try {
      const res = await apiClient.get(`/api/clinical-reports/compare?baseId=${baseId}&compareId=${compareId}`);
      setDiffs(res.diffs || []);
    } catch {
      toast.error('Comparison failed');
    }
  };

  const extracted = activeReport?.extractedData;
  const abnormalCount = useMemo(
    () => (extracted?.markers || []).filter((m: ParsedMarker) => m.status !== 'normal').length,
    [extracted]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="h-6 w-6 text-teal-600" /> Medical Report OCR & Lab Comparison
            </h1>
            <p className="text-sm text-slate-600">
              Upload PDF/image lab reports for OCR extraction, verify uncertain readings, and compare longitudinal lab markers.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
          {/* Left Panel */}
          <div className="space-y-4">
            <form onSubmit={handleParseOrUpload} className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Report Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Thyroid & Iron Panel Nov 2026"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-teal-400 hover:bg-teal-50">
                <FileImage className="h-7 w-7 text-teal-700" />
                <span className="mt-2 text-sm font-semibold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Upload Lab PDF, JPG, PNG, or TXT'}
                </span>
                <input type="file" accept="image/*,.pdf,.txt,application/pdf,text/plain" onChange={handleFile} className="hidden" />
              </label>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-teal-700" /> Or Paste Report Text
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setTitle('Sample CBC & Metabolic Panel');
                    setRawText(sampleReport);
                  }}
                  className="rounded border border-slate-200 px-2 py-1 text-xs font-medium hover:bg-slate-100"
                >
                  Load sample
                </button>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={7}
                placeholder="Paste lab text (Hemoglobin, TSH, Ferritin, Glucose...)..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs leading-5"
              />

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input type="checkbox" checked={pregnant} onChange={(e) => setPregnant(e.target.checked)} />
                Apply pregnancy reference context note
              </label>

              <Button
                type="submit"
                disabled={parsing || (!selectedFile && rawText.trim().length < 10)}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white"
              >
                {parsing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {parsing ? 'Extracting & Analyzing...' : 'Analyze & Save Report'}
              </Button>
            </form>

            {/* Saved History */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900">Stored Reports ({reports.length})</h2>
              {reports.length === 0 ? (
                <p className="text-xs text-slate-500">No stored lab reports yet.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {reports.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setActiveReport(r);
                        setEditingText(r.parsedText || '');
                      }}
                      className={`cursor-pointer rounded-lg border p-3 text-xs transition-colors ${
                        activeReport?.id === r.id ? 'border-teal-400 bg-teal-50/50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{r.title}</p>
                          <p className="text-slate-500 mt-0.5">
                            {new Date(r.reportDate).toLocaleDateString()} · {r.verifiedByUser ? 'Verified' : 'Needs Review'}
                          </p>
                        </div>
                        {confirmDeleteId === r.id ? (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleDelete(r.id)}
                              className="rounded bg-red-600 px-2 py-1 text-[11px] text-white"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded border px-2 py-1 text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(r.id);
                            }}
                            className="text-slate-400 hover:text-red-600 p-1"
                            aria-label="Delete report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {reports.length >= 2 && (
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GitCompare className="h-4 w-4 text-teal-600" /> Historical Lab Comparison
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={baseId} onChange={(e) => setBaseId(e.target.value)} className="rounded border border-slate-300 px-2 py-1 text-xs">
                      {reports.map((r) => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))}
                    </select>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    <select value={compareId} onChange={(e) => setCompareId(e.target.value)} className="rounded border border-slate-300 px-2 py-1 text-xs">
                      {reports.map((r) => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))}
                    </select>
                    <Button size="sm" variant="outline" onClick={handleCompare}>
                      Compare
                    </Button>
                  </div>
                </div>

                {diffs && (
                  <div className="overflow-x-auto pt-2">
                    {diffs.length === 0 ? (
                      <p className="text-xs text-slate-500">No overlapping markers found between these two reports.</p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                          <tr>
                            <th className="px-3 py-2">Marker</th>
                            <th className="px-3 py-2">Previous</th>
                            <th className="px-3 py-2">Current</th>
                            <th className="px-3 py-2">Delta</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {diffs.map((d) => (
                            <tr key={d.key}>
                              <td className="px-3 py-2 font-semibold">{d.label}</td>
                              <td className="px-3 py-2">{d.previousValue} {d.unit}</td>
                              <td className="px-3 py-2 font-semibold">{d.currentValue} {d.unit}</td>
                              <td className="px-3 py-2">
                                {d.delta > 0 ? `+${d.delta}` : d.delta} {d.unit} ({d.direction})
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </section>
            )}

            {!activeReport || !extracted ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <FlaskConical className="mx-auto h-10 w-10 text-teal-600" />
                <h2 className="mt-3 text-lg font-semibold">Select or Upload a Clinical Report</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Parsed lab markers, abnormal range alerts, uncertainty verification prompts, and clinician questions will appear here.
                </p>
              </div>
            ) : (
              <>
                <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{activeReport.title}</h2>
                      <p className="text-sm text-slate-600">{extracted.summary}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <ShieldCheck className="h-4 w-4" />
                      {activeReport.verifiedByUser ? 'Verified Reading' : 'Review Recommended'}
                    </span>
                  </div>

                  {activeReport.uncertaintyFlags?.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-2">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-amber-700" /> OCR / Unit Uncertainty Notices — Please Verify
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {activeReport.uncertaintyFlags.map((flag: string, i: number) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {extracted.alerts?.map((alert: ReportAlert, idx: number) => (
                    <div
                      key={idx}
                      className={`rounded-lg border p-3 text-sm ${
                        alert.severity === 'urgent'
                          ? 'border-red-200 bg-red-50 text-red-900'
                          : 'border-amber-200 bg-amber-50 text-amber-900'
                      }`}
                    >
                      <p className="font-semibold">{alert.title}</p>
                      <p className="text-xs mt-0.5">{alert.message}</p>
                    </div>
                  ))}

                  {/* Verification / Edit Text Box */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">Verify or Correct Extracted Report Text</span>
                      <Button size="sm" variant="outline" onClick={handleVerifyCorrection}>
                        Re-Parse & Mark Verified
                      </Button>
                    </div>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={4}
                      className="w-full rounded border border-slate-300 bg-white p-2 text-xs font-mono"
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Detected Biomarkers ({extracted.markers?.length || 0})</h3>
                    <span className="text-xs font-semibold text-amber-700">{abnormalCount} outside typical range</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-2.5">Marker</th>
                          <th className="px-4 py-2.5">Value</th>
                          <th className="px-4 py-2.5">Ref Range</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Plain-Language Context</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(extracted.markers || []).map((m: ParsedMarker) => (
                          <tr key={m.key}>
                            <td className="px-4 py-3">
                              <p className="font-semibold">{m.label}</p>
                              <p className="text-xs text-slate-500">{m.category}</p>
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {m.value} {m.unit}
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-xs">{m.referenceRange}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold capitalize ${statusClasses(m.status)}`}>
                                {m.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600">{m.finding}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Suggested Clinician Questions</h3>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {(extracted.suggestedQuestions || []).map((q: string) => (
                        <li key={q} className="flex gap-2">
                          <ClipboardList className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-xs text-slate-600 space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Clinical Safety Disclaimer
                    </h3>
                    <p>{extracted.disclaimer}</p>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
