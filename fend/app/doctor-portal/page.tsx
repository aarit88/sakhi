'use client';

import type { FormEvent } from 'react';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Activity,
  Box,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Eye,
  FileText,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DoctorProfile {
  id: number;
  fullName: string;
  specialty: string;
  clinicName: string;
  city: string;
  verified: boolean;
}

interface ShareRow {
  id: number;
  token: string;
  label: string;
  doctorName: string | null;
  scopes: {
    cycle: boolean;
    symptoms: boolean;
    bodyMap: boolean;
    reports: boolean;
    aiSummary: boolean;
  };
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
}

interface AuditLogRow {
  id: number;
  viewerLabel: string;
  action: string;
  accessedSections: string[];
  ipAddress: string | null;
  createdAt: string;
}

interface ClinicianNoteRow {
  id: number;
  clinicianName: string;
  note: string;
  recommendations: string | null;
  createdAt: string;
}

interface PortalPayload {
  share: {
    id: number;
    label: string;
    doctorName: string | null;
    expiresAt: string;
    scopes: Record<string, boolean>;
  };
  patient: {
    name: string | null;
    age: number | null;
    bloodGroup: string | null;
    conditions: string[];
  };
  cycleInfo: {
    day: number;
    phase: string;
    cycleLength: number;
    nextPeriod: string;
  } | null;
  periods: any[];
  symptoms: any[];
  moods: any[];
  sleeps: any[];
  bodyMaps: any[];
  reports: any[];
  aiSummaryText: string | null;
  clinicianNotes: ClinicianNoteRow[];
}

function DoctorPortalInner() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get('token') || '';

  const [activeTab, setActiveTab] = useState<'patient' | 'clinician'>(
    urlToken ? 'clinician' : 'patient'
  );

  // Patient state
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [patientNotes, setPatientNotes] = useState<ClinicianNoteRow[]>([]);
  const [loadingShares, setLoadingShares] = useState(true);

  const [label, setLabel] = useState('Gynecology Consultation Share');
  const [doctorName, setDoctorName] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(72);
  const [scopes, setScopes] = useState({
    cycle: true,
    symptoms: true,
    bodyMap: true,
    reports: true,
    aiSummary: true,
  });
  const [creatingShare, setCreatingShare] = useState(false);

  // Clinician view state
  const [tokenInput, setTokenInput] = useState(urlToken);
  const [clinicianViewerName, setClinicianViewerName] = useState('Dr. Meera Iyer');
  const [portalData, setPortalData] = useState<PortalPayload | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  // Add clinician note state
  const [noteClinicianName, setNoteClinicianName] = useState('Dr. Meera Iyer');
  const [noteBody, setNoteBody] = useState('');
  const [noteRecs, setNoteRecs] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchShares = useCallback(async () => {
    setLoadingShares(true);
    try {
      const res = await fetch('/api/doctor/shares');
      const data = await res.json();
      if (res.ok) {
        setDoctors(data.doctors || []);
        setShares(data.shares || []);
        setAuditLogs(data.auditLogs || []);
        setPatientNotes(data.clinicianNotes || []);
      }
    } catch {
      // Ignore silent failure
    } finally {
      setLoadingShares(false);
    }
  }, []);

  const loadClinicianPortal = useCallback(async (tokenToLoad: string, viewer: string) => {
    const clean = tokenToLoad.trim();
    if (!clean) {
      toast.error('Enter a patient share token.');
      return;
    }

    setLoadingPortal(true);
    try {
      const res = await fetch(
        `/api/doctor/portal/${encodeURIComponent(clean)}?clinician=${encodeURIComponent(viewer)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setPortalData(null);
        throw new Error(data.message || 'Unable to open consultation link');
      }
      setPortalData(data);
      fetchShares();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid or expired share token');
    } finally {
      setLoadingPortal(false);
    }
  }, [fetchShares]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares, isAuthenticated]);

  useEffect(() => {
    if (urlToken) {
      setTokenInput(urlToken);
      setActiveTab('clinician');
      loadClinicianPortal(urlToken, clinicianViewerName);
    }
  }, [urlToken, clinicianViewerName, loadClinicianPortal]);

  const handleCreateShare = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to create a consent share link.');
      return;
    }

    setCreatingShare(true);
    try {
      const res = await fetch('/api/doctor/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          doctorName: doctorName || null,
          expiresInHours,
          scopes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate share link');

      toast.success('Consent-scoped doctor share token created');
      fetchShares();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create share link');
    } finally {
      setCreatingShare(false);
    }
  };

  const handleRevokeShare = async (id: number) => {
    try {
      const res = await fetch(`/api/doctor/shares?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke token');
      toast.success('Share link revoked immediately');
      fetchShares();
    } catch {
      toast.error('Failed to revoke link');
    }
  };

  const copyShareUrl = (token: string) => {
    const shareUrl = `${window.location.origin}/doctor-portal?token=${token}`;
    navigator.clipboard?.writeText(shareUrl);
    toast.success('Consultation share URL copied to clipboard');
  };

  const handleSaveClinicianNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    if (noteBody.trim().length < 5) {
      toast.error('Clinician note must be at least 5 characters.');
      return;
    }

    setSavingNote(true);
    try {
      const res = await fetch(`/api/doctor/portal/${encodeURIComponent(tokenInput.trim())}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicianName: noteClinicianName,
          note: noteBody.trim(),
          recommendations: noteRecs.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not save clinician note');

      toast.success('Clinician note saved & audited');
      setNoteBody('');
      setNoteRecs('');
      loadClinicianPortal(tokenInput, noteClinicianName);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800 mb-2">
              <Stethoscope className="h-3.5 w-3.5" />
              Consent-Scoped Clinical Sharing & Audit Log
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Doctor Portal & Patient Summary Exchange
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Generate time-limited, revocable clinical summary links for your gynecologist and track every access event.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('patient')}
              className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'patient'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Patient Sharing Controls
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clinician')}
              className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'clinician'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Clinician View (Token)
            </button>
          </div>
        </div>

        {activeTab === 'patient' ? (
          <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
            {/* Create Share Link Card */}
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-rose-600" />
                    Create Consent Share Link
                  </CardTitle>
                  <CardDescription>
                    Choose exactly which clinical sections your doctor can review.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isAuthenticated ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                      Sign in with your SAKHI patient account to manage consent links and view audit logs.
                    </div>
                  ) : (
                    <form onSubmit={handleCreateShare} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Consultation Label
                        </label>
                        <Input
                          value={label}
                          onChange={(e) => setLabel(e.target.value)}
                          placeholder="e.g., OB-GYN Follow-Up"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Partner Doctor (Optional)
                        </label>
                        <select
                          value={doctorName}
                          onChange={(e) => setDoctorName(e.target.value)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm mb-2"
                        >
                          <option value="">Any authorized clinician with link</option>
                          {doctors.map((d) => (
                            <option key={d.id} value={d.fullName}>
                              {d.fullName} · {d.specialty} ({d.city})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Link Expiry Window
                        </label>
                        <select
                          value={expiresInHours}
                          onChange={(e) => setExpiresInHours(Number(e.target.value))}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        >
                          <option value={24}>24 Hours</option>
                          <option value={72}>3 Days (72 Hours)</option>
                          <option value={168}>7 Days</option>
                          <option value={720}>30 Days</option>
                        </select>
                      </div>

                      <div className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-800">Consented Data Scopes</p>
                        {[
                          { key: 'cycle', label: 'Menstrual Cycle & Predictions' },
                          { key: 'symptoms', label: 'Symptoms, Mood & Sleep Trends' },
                          { key: 'bodyMap', label: '3D Body-Map Clusters' },
                          { key: 'reports', label: 'Verified Clinical Reports' },
                          { key: 'aiSummary', label: 'AI Pre-Visit Clinical Brief' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700">{item.label}</span>
                            <Switch
                              checked={scopes[item.key as keyof typeof scopes]}
                              onCheckedChange={(val) =>
                                setScopes((prev) => ({ ...prev, [item.key]: val }))
                              }
                            />
                          </div>
                        ))}
                      </div>

                      <Button
                        type="submit"
                        disabled={creatingShare}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        {creatingShare ? 'Generating...' : 'Generate Revocable Share Token'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Partner Directory */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Verified Partner Specialists</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {doctors.map((doc) => (
                    <div key={doc.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">{doc.fullName}</p>
                        {doc.verified && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-600 mt-0.5">{doc.specialty}</p>
                      <p className="text-slate-500">
                        {doc.clinicName} · {doc.city}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Active Links, Clinician Notes & Audit Log */}
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Your Consultation Share Links</CardTitle>
                  <CardDescription>
                    Revoke any link immediately to cut off clinician access.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingShares ? (
                    <p className="text-sm text-slate-500">Loading share links...</p>
                  ) : shares.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No consultation links generated yet. Create one on the left before your appointment.
                    </p>
                  ) : (
                    shares.map((s) => {
                      const isRevoked = Boolean(s.revokedAt);
                      const isExpired = new Date(s.expiresAt) < new Date();
                      const active = !isRevoked && !isExpired;
                      return (
                        <div
                          key={s.id}
                          className={`rounded-lg border p-4 space-y-2 ${
                            active ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-75'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-sm text-slate-900">{s.label}</p>
                              <p className="text-xs text-slate-500">
                                {s.doctorName ? `Assigned: ${s.doctorName} · ` : ''}
                                Expires {new Date(s.expiresAt).toLocaleString()}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                isRevoked
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isExpired
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }
                            >
                              {isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Active'}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(s.scopes)
                              .filter(([, on]) => on)
                              .map(([k]) => (
                                <Badge key={k} variant="secondary" className="text-[10px]">
                                  {k}
                                </Badge>
                              ))}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <code className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                              {s.token}
                            </code>
                            {active && (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyShareUrl(s.token)}
                                >
                                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy URL
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setTokenInput(s.token);
                                    setActiveTab('clinician');
                                    loadClinicianPortal(s.token, s.doctorName || clinicianViewerName);
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" /> Open Clinician View
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="text-rose-700 hover:bg-rose-50 ml-auto"
                                  onClick={() => handleRevokeShare(s.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Revoke
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Clinician Notes Received */}
              {patientNotes.length > 0 && (
                <Card className="border-indigo-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-indigo-600" />
                      Clinician Follow-Up Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {patientNotes.map((n) => (
                      <div key={n.id} className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 text-sm">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span className="font-semibold text-indigo-900">{n.clinicianName}</span>
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800 text-xs leading-relaxed">{n.note}</p>
                        {n.recommendations && (
                          <p className="mt-2 text-xs text-indigo-900 font-medium">
                            Recommendations: {n.recommendations}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Mandatory Access Audit Log */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Access Audit Log ({auditLogs.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Every clinician view or note addition is permanently logged here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <p className="text-xs text-slate-500">No clinician access recorded yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {log.viewerLabel} · {log.action}
                            </p>
                            <p className="text-slate-500">
                              Sections: {log.accessedSections.join(', ')}
                            </p>
                          </div>
                          <span className="text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Clinician Consultation Mode */
          <div className="space-y-6">
            <Card className="border-indigo-200 shadow-sm">
              <CardContent className="pt-5 flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[240px]">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Patient Share Token
                  </label>
                  <Input
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste sakhi_dr_... token"
                  />
                </div>
                <div className="w-60">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Clinician Name (Audited)
                  </label>
                  <Input
                    value={clinicianViewerName}
                    onChange={(e) => setClinicianViewerName(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  disabled={loadingPortal}
                  onClick={() => loadClinicianPortal(tokenInput, clinicianViewerName)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loadingPortal ? 'Loading Summary...' : 'Open Patient Summary'}
                </Button>
              </CardContent>
            </Card>

            {portalData && (
              <div className="space-y-6">
                {/* Patient Summary Header + AI Brief */}
                <Card className="border-indigo-200 bg-white shadow-sm">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl">
                          Patient: {portalData.patient.name || 'Authorized Patient'}
                        </CardTitle>
                        <CardDescription>
                          Age: {portalData.patient.age ?? 'N/A'} · Blood Group:{' '}
                          {portalData.patient.bloodGroup || 'N/A'} · Conditions:{' '}
                          {portalData.patient.conditions.length
                            ? portalData.patient.conditions.join(', ')
                            : 'None reported'}
                        </CardDescription>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        <Lock className="h-3 w-3 mr-1" /> Audit Logged
                      </Badge>
                    </div>
                  </CardHeader>
                  {portalData.aiSummaryText && (
                    <CardContent>
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-1.5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          Pre-Visit AI Clinical Brief
                        </p>
                        <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                          {portalData.aiSummaryText}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Scoped Data Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                  {portalData.share.scopes.cycle && (
                    <Card className="border-slate-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-rose-600" /> Cycle Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2">
                        {portalData.cycleInfo ? (
                          <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 space-y-1">
                            <p className="font-semibold text-rose-900">
                              Day {portalData.cycleInfo.day} ({portalData.cycleInfo.phase})
                            </p>
                            <p className="text-rose-800">
                              Average Length: {portalData.cycleInfo.cycleLength} days · Est. Next:{' '}
                              {portalData.cycleInfo.nextPeriod}
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-500">No cycle info available.</p>
                        )}
                        <p className="font-medium text-slate-700 pt-1">
                          Recent Periods ({portalData.periods.length})
                        </p>
                        {portalData.periods.slice(0, 5).map((p: any) => (
                          <div key={p.id} className="flex justify-between border-b border-slate-100 py-1">
                            <span>{new Date(p.startDate).toLocaleDateString()}</span>
                            <span className="text-slate-500">Flow: {p.flowIntensity}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {portalData.share.scopes.bodyMap && (
                    <Card className="border-slate-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Box className="h-4 w-4 text-teal-600" /> 3D Body-Map Clusters
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2">
                        {portalData.bodyMaps.length === 0 ? (
                          <p className="text-slate-500">No 3D body-map entries logged.</p>
                        ) : (
                          portalData.bodyMaps.slice(0, 8).map((b: any) => (
                            <div key={b.id} className="rounded border border-slate-100 p-2 flex justify-between">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {b.regionLabel}: {b.symptom}
                                </p>
                                <p className="text-slate-500">{b.duration || 'Recent'}</p>
                              </div>
                              <Badge variant="outline">Severity {b.severity}/10</Badge>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {portalData.share.scopes.symptoms && (
                    <Card className="border-slate-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Activity className="h-4 w-4 text-amber-600" /> Recent Symptom & Wellness Logs
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2">
                        {portalData.symptoms.length === 0 ? (
                          <p className="text-slate-500">No recent symptoms logged.</p>
                        ) : (
                          portalData.symptoms.slice(0, 8).map((s: any) => (
                            <div key={s.id} className="flex justify-between border-b border-slate-100 py-1">
                              <span className="font-medium text-slate-800">{s.type}</span>
                              <span className="text-slate-500">
                                Severity {s.severity}/10 · {new Date(s.recordedAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {portalData.share.scopes.reports && (
                    <Card className="border-slate-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-600" /> Clinical Reports
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2">
                        {portalData.reports.length === 0 ? (
                          <p className="text-slate-500">No uploaded reports shared.</p>
                        ) : (
                          portalData.reports.map((r: any) => (
                            <div key={r.id} className="rounded border border-slate-200 p-2.5 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-900">{r.title}</span>
                                {r.verifiedByUser && (
                                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                    <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Patient Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-slate-500">
                                {r.extractedData?.metrics?.length || 0} extracted markers
                              </p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Add Clinician Note Form */}
                <Card className="border-indigo-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Add Consultation Note & Follow-Up Plan</CardTitle>
                    <CardDescription className="text-xs">
                      Notes saved here become visible to the patient and are recorded in the access audit log.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveClinicianNote} className="space-y-3">
                      <Input
                        value={noteClinicianName}
                        onChange={(e) => setNoteClinicianName(e.target.value)}
                        placeholder="Clinician Name"
                        required
                      />
                      <Textarea
                        value={noteBody}
                        onChange={(e) => setNoteBody(e.target.value)}
                        placeholder="Clinical observations and assessment..."
                        rows={3}
                        required
                      />
                      <Input
                        value={noteRecs}
                        onChange={(e) => setNoteRecs(e.target.value)}
                        placeholder="Follow-up tests or lifestyle recommendations (optional)"
                      />
                      <Button
                        type="submit"
                        disabled={savingNote}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {savingNote ? 'Saving Note...' : 'Save Clinician Note'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function DoctorPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm">
          Loading Doctor Portal...
        </div>
      }
    >
      <DoctorPortalInner />
    </Suspense>
  );
}
