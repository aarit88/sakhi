import { db } from '@db/index.ts';
import { safetyEvents } from '@db/schema.ts';

export type SafetySeverity = 'emergency' | 'urgent' | 'warning' | 'normal';

export interface RedFlagEvaluation {
  triggered: boolean;
  severity: SafetySeverity;
  category: string;
  matchedTerm: string | null;
  urgentGuidance: string;
  helplines: Array<{ label: string; contact: string }>;
}

const RULES: Array<{
  category: string;
  severity: Exclude<SafetySeverity, 'normal'>;
  patterns: RegExp[];
  guidance: string;
}> = [
  {
    category: 'self_harm_or_crisis',
    severity: 'emergency',
    patterns: [
      /\b(suicide|kill myself|end my life|want to die|self[- ]?harm|hurt myself)\b/i,
    ],
    guidance:
      'You deserve immediate human support right now. Please contact emergency services (112 / 911 / 988) or reach out to a crisis helpline immediately. Do not stay alone.',
  },
  {
    category: 'obstetric_or_hemorrhage_emergency',
    severity: 'emergency',
    patterns: [
      /\b(soaking through|soaking a pad every hour|hemorrhage|severe vaginal bleeding|heavy bleeding.{0,30}(dizzy|faint|clots))\b/i,
      /\b(pregnant.{0,40}(bleeding|severe pain|fluid leak|no fetal movement))\b/i,
    ],
    guidance:
      'Heavy soaking bleeding or bleeding/severe pain during pregnancy requires urgent in-person emergency obstetric evaluation today. Call emergency services (112 / 911) or go to the nearest Emergency Department.',
  },
  {
    category: 'cardiopulmonary_neuro_emergency',
    severity: 'emergency',
    patterns: [
      /\b(chest pain|can'?t breathe|difficulty breathing|shortness of breath at rest|heart attack|stroke|slurred speech|one[- ]sided weakness)\b/i,
      /\b(fainting|passed out|loss of consciousness|unconscious|seizure)\b/i,
    ],
    guidance:
      'These symptoms can signal an acute medical emergency. Seek immediate emergency care (call 112 / 911 or visit the nearest Emergency Room) right away.',
  },
  {
    category: 'acute_pelvic_or_sepsis_warning',
    severity: 'urgent',
    patterns: [
      /\b(severe abdominal pain|severe pelvic pain|unbearable pain|sudden sharp pelvic pain|pain 9\/10|pain 10\/10)\b/i,
      /\b(high fever.{0,30}(pelvic|abdominal|discharge|chills)|fever with pelvic pain)\b/i,
      /\b(rapidly worsening|sudden severe headache|blurred vision with headache)\b/i,
    ],
    guidance:
      'Sudden, severe, or fever-accompanied pelvic/abdominal symptoms should be evaluated promptly in person by a clinician or urgent care clinic today.',
  },
];

const DEFAULT_HELPLINES = [
  { label: 'Emergency Medical Services (India / US)', contact: '112 / 108 / 911' },
  { label: 'Tele-MANAS Mental Health Helpline (India)', contact: '14416 / 1800-891-4416' },
  { label: '988 Suicide & Crisis Lifeline (US)', contact: 'Call or Text 988' },
];

export function evaluateRedFlags(input: string, numericSeverity?: number): RedFlagEvaluation {
  const text = (input || '').trim();

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          triggered: true,
          severity: rule.severity,
          category: rule.category,
          matchedTerm: match[0],
          urgentGuidance: `${rule.guidance} SAKHI provides educational support only and cannot diagnose or treat emergencies.`,
          helplines: DEFAULT_HELPLINES,
        };
      }
    }
  }

  if (typeof numericSeverity === 'number' && numericSeverity >= 9) {
    return {
      triggered: true,
      severity: 'urgent',
      category: 'high_numeric_pain_severity',
      matchedTerm: `severity_${numericSeverity}_of_10`,
      urgentGuidance:
        'You logged pain/symptom severity at 9–10/10. If this pain is sudden, worsening, or accompanied by fever, dizziness, vomiting, or heavy bleeding, seek urgent in-person clinical evaluation today.',
      helplines: DEFAULT_HELPLINES,
    };
  }

  return {
    triggered: false,
    severity: 'normal',
    category: 'none',
    matchedTerm: null,
    urgentGuidance: '',
    helplines: [],
  };
}

export async function logSafetyEvent(params: {
  userId?: number | null;
  source: 'ai_chat' | 'anon_chat' | 'body_map' | 'report';
  evaluation: RedFlagEvaluation;
}) {
  if (!params.evaluation.triggered) return null;
  try {
    const inserted = await db
      .insert(safetyEvents)
      .values({
        userId: params.userId ?? null,
        source: params.source,
        severity: params.evaluation.severity,
        matchedCategory: params.evaluation.category,
        matchedText: params.evaluation.matchedTerm || params.evaluation.category,
        guidanceShown: params.evaluation.urgentGuidance,
      })
      .returning();
    return inserted[0] ?? null;
  } catch (error) {
    console.error('Failed to persist safety event:', error);
    return null;
  }
}
