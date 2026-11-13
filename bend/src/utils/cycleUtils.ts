/**
 * Canonical cycle phase calculation shared by the health API dashboard
 * and the AI context builder.
 *
 * Design decisions:
 * - Phase brackets use a dynamic follicular length derived from the
 *   user's average cycle length minus an approximate 14-day luteal phase.
 * - Ovulation window is fixed at 3 days (acknowledged estimate).
 * - Phases are clearly labelled "Estimated" where appropriate.
 * - Returns "Unknown" when no period data is available.
 */

export type CyclePhase =
  | "Menstrual"
  | "Follicular"
  | "Ovulation (Estimated)"
  | "Luteal (Estimated)"
  | "Unknown"

export interface CycleInfo {
  /** Days since the most recent period start date. 0 if no period logged. */
  day: number
  phase: CyclePhase | string
  /** Estimated next period date as YYYY-MM-DD, or "Unknown". */
  nextPeriod: string
  /** Calculated average cycle length in days; defaults to 28 when insufficient data. */
  cycleLength: number
  /**
   * True when at least 2 period logs are available to calculate an average.
   * When false, the 28-day default is used and results are approximate.
   */
  sufficientData: boolean
}

/** Formats a Date as YYYY-MM-DD in local time, avoiding UTC boundary issues. */
export function toLocalYYYYMMDD(d: Date): string {
  const offset = d.getTimezoneOffset() * 60000
  const localISO = new Date(d.getTime() - offset).toISOString().slice(0, -1)
  return localISO.split("T")[0]
}

/**
 * Compute the CycleInfo from a list of PeriodLog start dates.
 *
 * @param periodStartDates — sorted descending (most recent first)
 */
export function computeCycleInfo(periodStartDates: Date[]): CycleInfo {
  const defaultCycleInfo: CycleInfo = {
    day: 1,
    phase: "Unknown",
    nextPeriod: "Unknown",
    cycleLength: 28,
    sufficientData: false,
  }

  if (periodStartDates.length === 0) return defaultCycleInfo

  const lastStart = periodStartDates[0]
  const now = new Date()
  const diffMs = Math.abs(now.getTime() - lastStart.getTime())
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  let cycleLength = 28
  let sufficientData = false

  if (periodStartDates.length >= 2) {
    sufficientData = true
    let totalCycleDays = 0
    let countedCycles = 0

    for (let i = 0; i < periodStartDates.length - 1; i++) {
      const current = periodStartDates[i]
      const prev = periodStartDates[i + 1]
      const gap = Math.ceil(
        Math.abs(current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      )
      // Sanity check: only count plausible cycle lengths
      if (gap >= 15 && gap <= 45) {
        totalCycleDays += gap
        countedCycles++
      }
    }

    if (countedCycles > 0) {
      cycleLength = Math.round(totalCycleDays / countedCycles)
    }
  }

  // Phase brackets
  // Luteal phase is approximately 14 days (acknowledged heuristic).
  // Follicular length = cycleLength - 14, minimum 10.
  const folLength = Math.max(cycleLength - 14, 10)
  const ovuLength = 3

  let phase: CyclePhase
  if (diffDays <= 5) phase = "Menstrual"
  else if (diffDays <= folLength) phase = "Follicular"
  else if (diffDays <= folLength + ovuLength) phase = "Ovulation (Estimated)"
  else phase = "Luteal (Estimated)"

  const nextDate = new Date(lastStart)
  nextDate.setDate(nextDate.getDate() + cycleLength)

  return {
    day: diffDays,
    phase,
    nextPeriod: toLocalYYYYMMDD(nextDate),
    cycleLength,
    sufficientData,
  }
}
