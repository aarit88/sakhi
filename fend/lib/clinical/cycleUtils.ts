export type CyclePhase =
  | 'Menstrual'
  | 'Follicular'
  | 'Ovulation (Estimated)'
  | 'Luteal (Estimated)'
  | 'Unknown';

export interface CycleInfo {
  day: number;
  phase: CyclePhase | string;
  nextPeriod: string;
  cycleLength: number;
  sufficientData: boolean;
  variabilityDays: number;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  predictionNote: string;
}

export function toLocalYYYYMMDD(d: Date): string {
  const offset = d.getTimezoneOffset() * 60000;
  const localISO = new Date(d.getTime() - offset).toISOString().slice(0, -1);
  return localISO.split('T')[0];
}

export function computeCycleInfo(
  periodStartDates: Date[],
  fallbackCycleLength = 28
): CycleInfo {
  if (periodStartDates.length === 0) {
    return {
      day: 0,
      phase: 'Unknown',
      nextPeriod: 'Log a period to estimate',
      cycleLength: fallbackCycleLength,
      sufficientData: false,
      variabilityDays: 0,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      predictionNote:
        'Log at least 2 period start dates to personalize your cycle length estimate. Estimates are educational only and never for contraception.',
    };
  }

  const lastStart = periodStartDates[0];
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - lastStart.getTime());
  const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

  let cycleLength = fallbackCycleLength;
  let sufficientData = false;
  let variabilityDays = 0;

  if (periodStartDates.length >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < periodStartDates.length - 1; i++) {
      const current = periodStartDates[i];
      const prev = periodStartDates[i + 1];
      const gap = Math.round(
        Math.abs(current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (gap >= 15 && gap <= 55) {
        gaps.push(gap);
      }
    }
    if (gaps.length > 0) {
      sufficientData = true;
      cycleLength = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
      const minGap = Math.min(...gaps);
      const maxGap = Math.max(...gaps);
      variabilityDays = maxGap - minGap;
    }
  }

  const folLength = Math.max(cycleLength - 14, 10);
  const ovuLength = 3;
  const cycleModDay = ((diffDays - 1) % cycleLength) + 1;

  let phase: CyclePhase;
  if (cycleModDay <= 5) phase = 'Menstrual';
  else if (cycleModDay <= folLength) phase = 'Follicular';
  else if (cycleModDay <= folLength + ovuLength) phase = 'Ovulation (Estimated)';
  else phase = 'Luteal (Estimated)';

  const nextDate = new Date(lastStart);
  nextDate.setDate(nextDate.getDate() + cycleLength);

  const fertileStartDate = new Date(lastStart);
  fertileStartDate.setDate(fertileStartDate.getDate() + Math.max(folLength - 4, 7));
  const fertileEndDate = new Date(lastStart);
  fertileEndDate.setDate(fertileEndDate.getDate() + folLength + 1);

  const predictionNote = sufficientData
    ? variabilityDays >= 7
      ? `Your recorded cycles vary by ~${variabilityDays} days; next period estimate carries wider uncertainty (±${Math.ceil(variabilityDays / 2)} days). Not intended for contraception.`
      : `Based on ${periodStartDates.length} logged cycles (avg ${cycleLength} days). Educational estimate only — not reliable for contraception.`
    : `Approximate estimate using a ${cycleLength}-day baseline. Log another period start date to compute your personal average. Not intended for contraception.`;

  return {
    day: diffDays,
    phase,
    nextPeriod: toLocalYYYYMMDD(nextDate),
    cycleLength,
    sufficientData,
    variabilityDays,
    fertileWindowStart: toLocalYYYYMMDD(fertileStartDate),
    fertileWindowEnd: toLocalYYYYMMDD(fertileEndDate),
    predictionNote,
  };
}
