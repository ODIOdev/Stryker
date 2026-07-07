import { TIMEFRAMES, intervalWeight, type Timeframe } from '../data/chartData'
import { PREM_DISCOUNT_MAX_POINTS } from '../data/confluence'

export type PremDiscountSide = 'long' | 'short'

export interface PremDiscountTally {
  longWeight: number
  shortWeight: number
  filledWeight: number
  totalWeight: number
  dominant: PremDiscountSide | null
  dominantPct: number
  longPct: number
  shortPct: number
  completionPct: number
}

export const PREM_DISCOUNT_NEUTRAL = 50
export const PREM_DISCOUNT_NEUTRAL_BAND = 5

export function emptyPremDiscountSliders(): Record<Timeframe, number> {
  return Object.fromEntries(
    TIMEFRAMES.map((t) => [t.id, PREM_DISCOUNT_NEUTRAL])
  ) as Record<Timeframe, number>
}

export function premDiscountIsSet(value: number): boolean {
  return Math.abs(value - PREM_DISCOUNT_NEUTRAL) > PREM_DISCOUNT_NEUTRAL_BAND
}

export function premDiscountStrength(value: number): number {
  if (!premDiscountIsSet(value)) return 0
  return Math.abs(value - PREM_DISCOUNT_NEUTRAL) / PREM_DISCOUNT_NEUTRAL
}

export function premDiscountSide(value: number): PremDiscountSide | null {
  if (!premDiscountIsSet(value)) return null
  return value < PREM_DISCOUNT_NEUTRAL ? 'long' : 'short'
}

export function premDiscountTally(sliders: Record<Timeframe, number>): PremDiscountTally {
  let longWeight = 0
  let shortWeight = 0
  let filledWeight = 0
  let totalWeight = 0

  for (const tf of TIMEFRAMES) {
    const w = intervalWeight(tf.id)
    totalWeight += w
    const value = sliders[tf.id]
    const strength = premDiscountStrength(value)
    if (strength === 0) continue

    const effective = w * strength
    filledWeight += effective
    const side = premDiscountSide(value)
    if (side === 'long') longWeight += effective
    else if (side === 'short') shortWeight += effective
  }

  if (filledWeight === 0) {
    return {
      longWeight: 0,
      shortWeight: 0,
      filledWeight: 0,
      totalWeight,
      dominant: null,
      dominantPct: 0,
      longPct: 0,
      shortPct: 0,
      completionPct: 0,
    }
  }

  const dominant: PremDiscountSide = longWeight >= shortWeight ? 'long' : 'short'
  const dominantWeight = dominant === 'long' ? longWeight : shortWeight

  return {
    longWeight,
    shortWeight,
    filledWeight,
    totalWeight,
    dominant,
    dominantPct: Math.round((dominantWeight / filledWeight) * 100),
    longPct: Math.round((longWeight / filledWeight) * 100),
    shortPct: Math.round((shortWeight / filledWeight) * 100),
    completionPct: Math.round((filledWeight / totalWeight) * 100),
  }
}

export function countPremDiscountFilled(sliders: Record<Timeframe, number>): number {
  return TIMEFRAMES.filter((t) => premDiscountIsSet(sliders[t.id])).length
}

export function isPremDiscountComplete(sliders: Record<Timeframe, number>): boolean {
  return TIMEFRAMES.every((t) => premDiscountIsSet(sliders[t.id]))
}

export function premDiscountRowScore(sliders: Record<Timeframe, number>): number {
  const tally = premDiscountTally(sliders)
  if (tally.filledWeight === 0) return 0
  return tally.dominantPct
}

export function premDiscountPoints(sliders: Record<Timeframe, number>): number {
  const rowScore = premDiscountRowScore(sliders)
  if (rowScore === 0) return 0
  return Math.round((rowScore / 100) * PREM_DISCOUNT_MAX_POINTS)
}

export function premDiscountChartSet(
  sliders: Record<Timeframe, number>,
  chartInterval: Timeframe
): boolean {
  return premDiscountIsSet(sliders[chartInterval])
}

/** Green (discount) → red (premium) for slider thumb / indicators. */
export function premDiscountColor(value: number): string {
  const t = Math.max(0, Math.min(1, value / 100))
  const r = Math.round(45 + t * 210)
  const g = Math.round(212 - t * 152)
  const b = Math.round(191 - t * 120)
  return `rgb(${r}, ${g}, ${b})`
}

export function premDiscountLabel(value: number): string {
  if (!premDiscountIsSet(value)) return 'Fair'
  if (value < PREM_DISCOUNT_NEUTRAL) return 'Discount'
  return 'Premium'
}
