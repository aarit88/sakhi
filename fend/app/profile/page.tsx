'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AlertTriangle, Download, Save, ShieldCheck, Trash2, User } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

const CONSENT_LABELS: Record<string, { title: string; desc: string }> = {
  health_data_processing: {
    title: 'Personal Health Record Processing',
    desc: 'Store cycle logs, daily symptoms, 3D body-map notes, and lab reports securely in your private account.',
  },
  ai_insights: {
    title: 'Personalized AI Companion Context',
    desc: 'Allow the SAKHI AI Companion to read your logged patterns when answering your private questions.',
  },
  doctor_sharing: {
    title: 'Doctor Portal Share Tokens',
    desc: 'Enable creation of scoped, revocable consultation links for clinicians.',
  },
  anonymous_community: {
    title: 'Anonymous Community Support',
    desc: 'Participate with generated pseudonyms without linking private health data.',
  },
  geolocation: {
    title: 'Care Finder Location Access',
    desc: 'Allow optional browser geolocation to discover nearby hospitals, OB-GYNs, and labs.',
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [cycleLengthAvg, setCycleLengthAvg] = useState('28');
  const [periodLengthAvg, setPeriodLengthAvg] = useState('5');
  const [conditionsInput, setConditionsInput] = useState('');
  const [consents, setConsents] = useState<Array<{ consentType: string; granted: boolean }>>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAuthenticated) return;

    apiClient
      .get('/api/user/profile')
      .then((res) => {
        const p = res.profile;
        setName(p.name || '');
        setEmail(p.email || '');
        setPhone(p.phone || '');
        setAge(p.age ? String(p.age) : '');
        setBloodGroup(p.bloodGroup || '');
        setCycleLengthAvg(String(p.cycleLengthAvg || 28));
        setPeriodLengthAvg(String(p.periodLengthAvg || 5));
        setConditionsInput(Array.isArray(p.conditions) ? p.conditions.join(', ') : '');
        setConsents(res.consents || []);
      })
      .catch(() => toast.error('Could not load profile'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.fetch('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          phone,
          age: age ? Number(age) : undefined,
          bloodGroup,
          cycleLengthAvg: Number(cycleLengthAvg),
          periodLengthAvg: Number(periodLengthAvg),
          conditions: conditionsInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          onboardingComplete: true,
          consents,
        }),
      });
      await refreshUser();
      toast.success('Profile and consent preferences saved');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const payload = await apiClient.get('/api/user/profile?export=1');
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sakhi-full-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Full data export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiClient.delete('/api/user/profile');
      toast.success('Account and health records permanently deleted');
      await logout();
    } catch {
      toast.error('Failed to delete account');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="p-12 text-center text-slate-500">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <User className="h-6 w-6 text-rose-600" /> Profile, Consents & Data Controls
            </h1>
            <p className="text-sm text-slate-600">Manage your baseline health details, privacy consents, export, or account deletion.</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export My Data (JSON)
          </Button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base">Personal & Cycle Baseline</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={email} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Age</Label>
                  <Input type="number" min="12" max="100" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Blood Group</Label>
                  <Input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} placeholder="e.g. O+" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Average Cycle Length (days)</Label>
                <Input type="number" min="18" max="55" value={cycleLengthAvg} onChange={(e) => setCycleLengthAvg(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Average Period Length (days)</Label>
                <Input type="number" min="2" max="12" value={periodLengthAvg} onChange={(e) => setPeriodLengthAvg(e.target.value)} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Health Focus / Conditions (comma-separated)</Label>
                <Input
                  value={conditionsInput}
                  onChange={(e) => setConditionsInput(e.target.value)}
                  placeholder="e.g. PCOS, Hypothyroidism, Iron-deficiency anemia"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Explicit Consent Management
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100">
              {consents.map((c) => {
                const meta = CONSENT_LABELS[c.consentType] || { title: c.consentType, desc: '' };
                return (
                  <div key={c.consentType} className="flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{meta.title}</p>
                      <p className="text-xs text-slate-600">{meta.desc}</p>
                    </div>
                    <Switch
                      checked={c.granted}
                      onCheckedChange={(checked) =>
                        setConsents((prev) =>
                          prev.map((item) =>
                            item.consentType === c.consentType ? { ...item, granted: checked } : item
                          )
                        )
                      }
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="bg-rose-600 hover:bg-rose-700 text-white">
              <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Profile & Consents'}
            </Button>
          </div>
        </form>

        <Card className="border-red-200 bg-red-50/40">
          <CardHeader>
            <CardTitle className="text-base text-red-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" /> Permanent Account Deletion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-red-800">
              Permanently erases your profile, cycle history, symptom logs, 3D body-map records, medical reports, and doctor share links from PostgreSQL.
            </p>
            {!confirmDelete ? (
              <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete My Account
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="destructive" onClick={handleDeleteAccount}>
                  Confirm Permanent Deletion
                </Button>
                <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
