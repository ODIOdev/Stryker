import { TIMEFRAMES, intervalWeight, type Timeframe } from '../data/chartData'
import {
  CONFLUENCE_FACTORS,
  DASHBOARD_MAX_SCORE,
  EMA_MAX_POINTS,
  EMA_PERIOD_MAX_POINTS,
  EMA_PERIODS,
  FACTOR_MAX_POINTS,
  R_DIV_MAX_POINTS,
  type EmaPeriod,
} from '../data/confluence'
import {
  countPremDiscountFilled,
  premDiscountChartSet,
  premDiscountIsSet,
  premDiscountPoints,
  premDiscountRowScore,
  premDiscountTally,
} from './premDiscountScoring'

export type { EmaPeriod }

export type Bias = 'long' | 'short'
export type BiasChoice = Bias | null
export type TradeBias = 'long' | 'short' | 'range'

/** R Divergence caps at 70% row score and 70 points max. */
const R_DIV_MAX_PERCENT = 70

const R_DIV_CHART_SCALE: Record<Timeframe, number> = {
  '5m': 0.35,
  '15m': 0.5,
  '30m': 0.65,
  '1h': 0.75,
  '4h': 0.85,
  '1D': 1,
}

/** Heavier weighting from 30m upward for R Divergence alignment. */
const R_DIV_ALIGNMENT_WEIGHTS: Record<Timeframe, number> = {
  '5m': 1,
  '15m': 2,
  '30m': 5,
  '1h': 6,
  '4h': 7,
  '1D': 8,
}

export function emptyBiases(): Record<Timeframe, BiasChoice> {
  return Object.fromEntries(TIMEFRAMES.map((t) => [t.id, null])) as Record<Timeframe, BiasChoice>
}

export function emptyEmaBiases(): Record<EmaPeriod, Record<Timeframe, BiasChoice>> {
  return Object.fromEntries(EMA_PERIODS.map((p) => [p, emptyBiases()])) as Record<
    EmaPeriod,
    Record<Timeframe, BiasChoice>
  >
}

export function defaultSelectedIntervals(): Record<Timeframe, boolean> {
  return Object.fromEntries(TIMEFRAMES.map((t) => [t.id, true])) as Record<Timeframe, boolean>
}

export function selectedIntervalIds(
  selectedIntervals: Record<Timeframe, boolean>
): Timeframe[] {
  return TIMEFRAMES.filter((t) => selectedIntervals[t.id]).map((t) => t.id)
}

export function countSelectedIntervals(selectedIntervals: Record<Timeframe, boolean>): number {
  return selectedIntervalIds(selectedIntervals).length
}

export function countFilledSelectedBiases(
  biases: Record<Timeframe, BiasChoice>,
  selectedIntervals: Record<Timeframe, boolean>
): number {
  return selectedIntervalIds(selectedIntervals).filter((tf) => biases[tf] !== null).length
}

const EMA_PERIOD_WEIGHT: Record<EmaPeriod, number> = {
  '21': 21,
  '50': 50,
  '200': 200,
}

export function countFilledBiases(biases: Record<Timeframe, BiasChoice>): number {
  return TIMEFRAMES.filter((t) => biases[t.id] !== null).length
}

export function isFactorComplete(
  biases: Record<Timeframe, BiasChoice>,
  factorId = '',
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>,
  selectedIntervals?: Record<Timeframe, boolean>,
  premDiscountSliders?: Record<Timeframe, number>
): boolean {
  if (factorId === 'ema-21-50-200' && emaBiases) {
    return EMA_PERIODS.some((period) => {
      const tally = factorBiasTally('', emaBiases[period])
      return tally.filledWeight > 0 && tally.dominantPct >= 60
    })
  }
  if (factorId === 'premium-discount' && premDiscountSliders) {
    const tally = premDiscountTally(premDiscountSliders)
    if (tally.filledWeight === 0) return false
    return tally.dominantPct >= 60 || countPremDiscountFilled(premDiscountSliders) === TIMEFRAMES.length
  }
  if (factorId === 'bias' && selectedIntervals) {
    const selected = selectedIntervalIds(selectedIntervals)
    if (selected.length === 0) return false
    const tally = intervalFilteredTally(biases, selectedIntervals)
    if (tally.filledWeight === 0) return false
    if (selected.every((tf) => biases[tf] !== null)) return true
    return tally.dominantPct >= 60
  }

  const tally = factorBiasTally(factorId, biases, emaBiases, selectedIntervals, premDiscountSliders)
  if (tally.filledWeight === 0) return false
  if (countFilledBiases(biases) === TIMEFRAMES.length) return true
  return tally.dominantPct >= 60
}

function defaultAlignmentWeights(): Record<Timeframe, number> {
  return Object.fromEntries(TIMEFRAMES.map((t) => [t.id, intervalWeight(t.id)])) as Record<
    Timeframe,
    number
  >
}

function factorWeights(factorId: string): Record<Timeframe, number> {
  return factorId === 'r-divergence' ? R_DIV_ALIGNMENT_WEIGHTS : defaultAlignmentWeights()
}

function completionFactorForQuality(factorId: string, tally: BiasTally): number {
  if (tally.filledWeight === 0) return 0
  // BIAS factor: quality scales with filled share of selected intervals
  if (factorId === 'bias') return tally.completionPct / 100
  // All other factors: filled-only scope (no penalty for empty TFs)
  return 1
}

export function factorScopeConfidence(
  factorId: string,
  biases: Record<Timeframe, BiasChoice>,
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>,
  selectedIntervals?: Record<Timeframe, boolean>,
  premDiscountSliders?: Record<Timeframe, number>
): number {
  const tally = factorBiasTally(
    factorId,
    biases,
    emaBiases,
    selectedIntervals,
    premDiscountSliders
  )
  if (tally.totalWeight === 0) return 0
  return Math.round((tally.filledWeight / tally.totalWeight) * 100)
}

export interface BiasTally {
  longWeight: number
  shortWeight: number
  filledWeight: number
  totalWeight: number
  dominant: Bias | null
  /** Weighted share of filled timeframes on the dominant side (0–100). */
  dominantPct: number
  longPct: number
  shortPct: number
  /** Weighted share of all timeframes that have a bias set (0–100). */
  completionPct: number
}

export function factorBiasTally(
  factorId: string,
  biases: Record<Timeframe, BiasChoice>,
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>,
  selectedIntervals?: Record<Timeframe, boolean>,
  premDiscountSliders?: Record<Timeframe, number>
): BiasTally {
  if (factorId === 'ema-21-50-200' && emaBiases) {
    return emaAggregateTally(emaBiases)
  }

  if (factorId === 'premium-discount' && premDiscountSliders) {
    return premDiscountTally(premDiscountSliders)
  }

  if (factorId === 'bias' && selectedIntervals) {
    return intervalFilteredTally(biases, selectedIntervals)
  }

  const weights = factorWeights(factorId)
  let longWeight = 0
  let shortWeight = 0
  let filledWeight = 0
  let totalWeight = 0

  for (const tf of TIMEFRAMES) {
    const w = weights[tf.id]
    totalWeight += w
    const bias = biases[tf.id]
    if (bias === null) continue
    filledWeight += w
    if (bias === 'long') longWeight += w
    else shortWeight += w
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

  const dominant: Bias = longWeight >= shortWeight ? 'long' : 'short'
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

function intervalFilteredTally(
  biases: Record<Timeframe, BiasChoice>,
  selectedIntervals: Record<Timeframe, boolean>
): BiasTally {
  let longWeight = 0
  let shortWeight = 0
  let filledWeight = 0
  let totalWeight = 0

  for (const tf of TIMEFRAMES) {
    if (!selectedIntervals[tf.id]) continue
    const w = intervalWeight(tf.id)
    totalWeight += w
    const bias = biases[tf.id]
    if (bias === null) continue
    filledWeight += w
    if (bias === 'long') longWeight += w
    else shortWeight += w
  }

  if (filledWeight === 0 || totalWeight === 0) {
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

  const dominant: Bias = longWeight >= shortWeight ? 'long' : 'short'
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

function emaAggregateTally(emaBiases: Record<EmaPeriod, Record<Timeframe, BiasChoice>>): BiasTally {
  let longWeight = 0
  let shortWeight = 0
  let filledWeight = 0
  let totalWeight = 0

  for (const period of EMA_PERIODS) {
    const periodWeight = EMA_PERIOD_WEIGHT[period]
    for (const tf of TIMEFRAMES) {
      const cellWeight = intervalWeight(tf.id) * periodWeight
      totalWeight += cellWeight
      const bias = emaBiases[period][tf.id]
      if (bias === null) continue
      filledWeight += cellWeight
      if (bias === 'long') longWeight += cellWeight
      else shortWeight += cellWeight
    }
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

  const dominant: Bias = longWeight >= shortWeight ? 'long' : 'short'
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

export function emaPeriodRowScore(biases: Record<Timeframe, BiasChoice>): number {
  const tally = factorBiasTally('', biases)
  if (tally.filledWeight === 0) return 0
  return tally.dominantPct
}

export function emaPeriodPoints(
  period: EmaPeriod,
  biases: Record<Timeframe, BiasChoice>
): number {
  const rowScore = emaPeriodRowScore(biases)
  if (rowScore === 0) return 0
  const maxPoints = EMA_PERIOD_MAX_POINTS[period]
  return Math.round((rowScore / 100) * maxPoints)
}

export function emaTotalPoints(emaBiases: Record<EmaPeriod, Record<Timeframe, BiasChoice>>): number {
  return EMA_PERIODS.reduce((sum, period) => sum + emaPeriodPoints(period, emaBiases[period]), 0)
}

export function emaChartBiasSet(
  emaBiases: Record<EmaPeriod, Record<Timeframe, BiasChoice>>,
  chartInterval: Timeframe
): boolean {
  return EMA_PERIODS.some((period) => emaBiases[period][chartInterval] !== null)
}

/** Row display score (0–100, or 0–70 cap for R Divergence at 1D). Null when factor is off. */
export function factorRowScore(
  factorId: string,
  biases: Record<Timeframe, BiasChoice>,
  chartInterval: Timeframe,
  enabled = true,
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>,
  selectedIntervals?: Record<Timeframe, boolean>,
  premDiscountSliders?: Record<Timeframe, number>
): number | null {
  if (!enabled) return null

  if (factorId === 'ema-21-50-200' && emaBiases) {
    const totalPoints = emaTotalPoints(emaBiases)
    if (totalPoints === 0) return 0
    return Math.round((totalPoints / EMA_MAX_POINTS) * 100)
  }

  if (factorId === 'premium-discount' && premDiscountSliders) {
    return premDiscountRowScore(premDiscountSliders)
  }

  const tally = factorBiasTally(
    factorId,
    biases,
    emaBiases,
    selectedIntervals,
    premDiscountSliders
  )
  if (tally.filledWeight === 0) return 0

  const composite =
    (tally.dominantPct / 100) * completionFactorForQuality(factorId, tally)

  if (factorId === 'r-divergence') {
    const cap = R_DIV_MAX_PERCENT * R_DIV_CHART_SCALE[chartInterval]
    return Math.round(composite * cap)
  }

  return Math.round(composite * 100)
}

/** Points earned toward the dashboard max. */
export function factorRowPoints(
  factorId: string,
  biases: Record<Timeframe, BiasChoice>,
  chartInterval: Timeframe,
  enabled = true,
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>,
  selectedIntervals?: Record<Timeframe, boolean>,
  premDiscountSliders?: Record<Timeframe, number>
): number {
  if (!enabled) return 0

  if (factorId === 'ema-21-50-200' && emaBiases) {
    return emaTotalPoints(emaBiases)
  }

  if (factorId === 'premium-discount' && premDiscountSliders) {
    return premDiscountPoints(premDiscountSliders)
  }

  const rowScore = factorRowScore(
    factorId,
    biases,
    chartInterval,
    true,
    emaBiases,
    selectedIntervals,
    premDiscountSliders
  )
  if (rowScore === null || rowScore === 0) return 0

  const maxPoints = FACTOR_MAX_POINTS[factorId] ?? 0

  if (factorId === 'r-divergence') {
    const maxRow = R_DIV_MAX_PERCENT * R_DIV_CHART_SCALE[chartInterval]
    if (maxRow <= 0) return 0
    return Math.round((rowScore / maxRow) * R_DIV_MAX_POINTS)
  }

  return Math.round((rowScore / 100) * maxPoints)
}

export function factorDominantBias(
  biases: Record<Timeframe, BiasChoice>,
  factorId = '',
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>,
  selectedIntervals?: Record<Timeframe, boolean>,
  premDiscountSliders?: Record<Timeframe, number>
): Bias | null {
  return factorBiasTally(
    factorId,
    biases,
    emaBiases,
    selectedIntervals,
    premDiscountSliders
  ).dominant
}

export function chartBiasSet(
  biases: Record<Timeframe, BiasChoice>,
  chartInterval: Timeframe,
  factorId = '',
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>,
  selectedIntervals?: Record<Timeframe, boolean>,
  premDiscountSliders?: Record<Timeframe, number>
): boolean {
  if (factorId === 'ema-21-50-200' && emaBiases) {
    return emaChartBiasSet(emaBiases, chartInterval)
  }
  if (factorId === 'premium-discount' && premDiscountSliders) {
    return premDiscountChartSet(premDiscountSliders, chartInterval)
  }
  if (factorId === 'bias' && selectedIntervals) {
    return selectedIntervals[chartInterval] === true && biases[chartInterval] !== null
  }
  return biases[chartInterval] !== null
}

export function rDivergenceMaxPercent(chartInterval: Timeframe): number {
  return Math.round(R_DIV_MAX_PERCENT * R_DIV_CHART_SCALE[chartInterval])
}

export function dashboardMaxPoints(): number {
  return DASHBOARD_MAX_SCORE
}

/** How well a factor aligns with the selected trade bias (0–100). */
export function factorTradeAlignment(
  factorId: string,
  biases: Record<Timeframe, BiasChoice>,
  mainBias: TradeBias,
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>,
  selectedIntervals?: Record<Timeframe, boolean>,
  premDiscountSliders?: Record<Timeframe, number>
): number {
  if (factorId === 'premium-discount' && premDiscountSliders) {
    const tally = premDiscountTally(premDiscountSliders)
    if (tally.filledWeight === 0) return 0

    if (mainBias === 'range') {
      const balance = 100 - Math.abs(tally.longPct - tally.shortPct)
      const neutralShare =
        TIMEFRAMES.filter((t) => !premDiscountIsSet(premDiscountSliders[t.id])).length /
        TIMEFRAMES.length
      return Math.round(Math.max(balance, neutralShare * 100))
    }

    if (mainBias === 'long') {
      return tally.dominant === 'long' ? 100 : tally.longPct
    }

    return tally.dominant === 'short' ? 100 : tally.shortPct
  }

  const tally = factorBiasTally(
    factorId,
    biases,
    emaBiases,
    selectedIntervals,
    premDiscountSliders
  )

  if (tally.filledWeight === 0) return 0

  if (mainBias === 'range') {
    return Math.max(0, 100 - Math.abs(tally.longPct - tally.shortPct))
  }

  if (mainBias === 'long') {
    if (tally.dominant === 'long') return 100
    return tally.longPct
  }

  if (tally.dominant === 'short') return 100
  return tally.shortPct
}

export function factorAlignsWithTradeBias(
  factorId: string,
  biases: Record<Timeframe, BiasChoice>,
  mainBias: TradeBias,
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>,
  selectedIntervals?: Record<Timeframe, boolean>,
  premDiscountSliders?: Record<Timeframe, number>
): boolean {
  return (
    factorTradeAlignment(
      factorId,
      biases,
      mainBias,
      emaBiases,
      selectedIntervals,
      premDiscountSliders
    ) >= 50
  )
}

/** Points earned toward the dashboard max, weighted by trade-bias alignment. */
export function factorAlignedRowPoints(
  factorId: string,
  biases: Record<Timeframe, BiasChoice>,
  chartInterval: Timeframe,
  enabled = true,
  mainBias: TradeBias | null,
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>,
  selectedIntervals?: Record<Timeframe, boolean>,
  premDiscountSliders?: Record<Timeframe, number>
): number {
  const raw = factorRowPoints(
    factorId,
    biases,
    chartInterval,
    enabled,
    emaBiases,
    selectedIntervals,
    premDiscountSliders
  )
  if (!mainBias || raw === 0) return raw

  const alignment = factorTradeAlignment(
    factorId,
    biases,
    mainBias,
    emaBiases,
    selectedIntervals,
    premDiscountSliders
  )

  return Math.round((raw * alignment) / 100)
}

export interface TradeBiasFactorInput {
  factorId: string
  enabled: boolean
  biases: Record<Timeframe, BiasChoice>
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>
  selectedIntervals?: Record<Timeframe, boolean>
  premDiscountSliders?: Record<Timeframe, number>
}

/** Derive overall trade bias from active confluence factors. Null when undetermined. */
export function deriveTradeBias(entries: TradeBiasFactorInput[]): TradeBias | null {
  let longScore = 0
  let shortScore = 0
  let hasSignal = false

  for (const entry of entries) {
    if (!entry.enabled) continue

    const tally = factorBiasTally(
      entry.factorId,
      entry.biases,
      entry.emaBiases,
      entry.selectedIntervals,
      entry.premDiscountSliders
    )
    if (tally.filledWeight === 0) continue

    hasSignal = true
    const weight = FACTOR_MAX_POINTS[entry.factorId] ?? 1
    longScore += (tally.longWeight / tally.filledWeight) * weight
    shortScore += (tally.shortWeight / tally.filledWeight) * weight
  }

  if (!hasSignal) return null

  const total = longScore + shortScore
  if (total === 0) return null

  const longShare = longScore / total
  if (longShare >= 0.55) return 'long'
  if (longShare <= 0.45) return 'short'
  return 'range'
}

export function totalPossiblePoints(): number {
  return CONFLUENCE_FACTORS.reduce((sum, f) => sum + (FACTOR_MAX_POINTS[f.id] ?? 0), 0)
}
