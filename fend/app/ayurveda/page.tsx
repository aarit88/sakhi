'use client';

import { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  Leaf,
  Search,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';

interface AyurvedaItem {
  id: number;
  slug: string;
  title: string;
  condition: string;
  dosha: string;
  cyclePhase: string | null;
  symptoms: string[];
  traditionalExplanation: string;
  pathya: string[];
  apathya: string[];
  lifestyleGuidance: string[];
  contraindications: string[];
  evidenceLevel: string;
  evidenceSummary: string;
  sources: string[];
}

const EVIDENCE_META: Record<
  string,
  { label: string; badgeClass: string; borderClass: string; icon: typeof FlaskConical }
> = {
  evidence_supported: {
    label: 'Evidence-Supported',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borderClass: 'border-l-4 border-l-emerald-500',
    icon: FlaskConical,
  },
  traditional: {
    label: 'Traditional Practice',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    borderClass: 'border-l-4 border-l-amber-500',
    icon: Sparkles,
  },
  limited_evidence: {
    label: 'Limited Clinical Evidence',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    borderClass: 'border-l-4 border-l-sky-500',
    icon: BookOpen,
  },
  contraindicated: {
    label: 'Contraindicated / Avoid',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    borderClass: 'border-l-4 border-l-rose-600',
    icon: ShieldAlert,
  },
};

export default function AyurvedaPage() {
  const [items, setItems] = useState<AyurvedaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dosha, setDosha] = useState('all');
  const [evidence, setEvidence] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (dosha !== 'all') params.set('dosha', dosha);
        if (evidence !== 'all') params.set('evidence', evidence);
        if (query.trim()) params.set('q', query.trim());

        const res = await fetch(`/api/ayurveda?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.items)) {
          setItems(data.items);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Ayurveda load error:', err);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [dosha, evidence, query]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/40 via-white to-rose-50/30">
      <Navigation />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 mb-2">
              <Leaf className="h-3.5 w-3.5" />
              Ayurveda & Evidence Transparency
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Traditional & Evidence-Aware Wellness Guide
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Classical Ayurvedic concepts paired transparently with modern clinical evidence tiers, Pathya/Apathya nutrition, and explicit contraindications.
            </p>
          </div>
        </div>

        {/* Evidence Tier Legend + Safety Banner */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-950 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Clear Distinction Between Traditional Knowledge & Clinical Evidence</p>
            <p className="text-xs text-amber-900 leading-relaxed">
              Every entry below separates traditional Dosha frameworks from published clinical study tiers. Do not discontinue prescribed hormonal, thyroid, iron, or emergency care—consult an obstetrician/gynecologist or qualified physician before starting herbal preparations, especially during pregnancy or lactation.
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-slate-200">
          <CardContent className="pt-5 grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search condition, symptom, or topic..."
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-medium text-slate-500 mr-1">Dosha:</span>
              {['all', 'Vata', 'Pitta', 'Kapha'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDosha(d)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    dosha === d
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d === 'all' ? 'All Doshas' : d}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-medium text-slate-500 mr-1">Evidence:</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'evidence_supported', label: 'Evidence-Supported' },
                { key: 'traditional', label: 'Traditional' },
                { key: 'limited_evidence', label: 'Limited' },
                { key: 'contraindicated', label: 'Contraindicated' },
              ].map((tier) => (
                <button
                  key={tier.key}
                  type="button"
                  onClick={() => setEvidence(tier.key)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    evidence === tier.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Entries Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse h-64 bg-slate-100 border-slate-200" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="border-slate-200 p-10 text-center">
            <p className="text-slate-600 font-medium">No wellness entries match your current filter.</p>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {items.map((item) => {
              const meta = EVIDENCE_META[item.evidenceLevel] || EVIDENCE_META.traditional;
              const TierIcon = meta.icon;
              return (
                <Card key={item.id} className={`border-slate-200 shadow-sm ${meta.borderClass}`}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`border ${meta.badgeClass} flex items-center gap-1`}>
                          <TierIcon className="h-3 w-3" />
                          {meta.label}
                        </Badge>
                        <Badge variant="outline" className="text-amber-800 border-amber-200 bg-amber-50">
                          {item.dosha}
                        </Badge>
                        {item.cyclePhase && (
                          <Badge variant="secondary" className="text-xs">
                            Phase: {item.cyclePhase}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-slate-900">{item.title}</CardTitle>
                    <CardDescription className="text-slate-600 font-medium">
                      Condition Focus: {item.condition}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 text-sm">
                    {/* Symptoms */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.symptoms.map((sym) => (
                        <span
                          key={sym}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>

                    {/* Traditional vs Evidence side-by-side */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1">
                          Traditional Perspective
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {item.traditionalExplanation}
                        </p>
                      </div>
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 mb-1">
                          Modern Clinical Evidence
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {item.evidenceSummary}
                        </p>
                      </div>
                    </div>

                    {/* Pathya & Apathya */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1 mb-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Pathya (Supportive Foods)
                        </p>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {item.pathya.map((p) => (
                            <li key={p} className="flex items-start gap-1.5">
                              <span className="text-emerald-600">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-rose-800 flex items-center gap-1 mb-1.5">
                          <XCircle className="h-3.5 w-3.5" />
                          Apathya (Foods to Limit)
                        </p>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {item.apathya.map((a) => (
                            <li key={a} className="flex items-start gap-1.5">
                              <span className="text-rose-500">•</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Lifestyle */}
                    {item.lifestyleGuidance.length > 0 && (
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                        <p className="text-xs font-semibold text-slate-800 mb-1">Lifestyle & Dinacharya Guidance</p>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {item.lifestyleGuidance.map((l) => (
                            <li key={l}>• {l}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Contraindications */}
                    {item.contraindications.length > 0 && (
                      <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-3">
                        <p className="text-xs font-semibold text-rose-900 flex items-center gap-1 mb-1">
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-700" />
                          Contraindications & Safety Precautions
                        </p>
                        <ul className="space-y-1 text-xs text-rose-900">
                          {item.contraindications.map((c) => (
                            <li key={c}>• {c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Sources */}
                    {item.sources.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-600">Sources: </span>
                        {item.sources.join(' · ')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
