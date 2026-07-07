import type { Timeframe } from '../data/chartData'
import { CONFLUENCE_FACTORS, FACTOR_MAX_POINTS, gradeFromAlignedPoints, type TradeRating } from '../data/confluence'
import {
  deriveTradeBias,
  factorAlignsWithTradeBias,
  factorAlignedRowPoints,
  factorBiasTally,
  factorRowPoints,
  factorRowScore,
  factorScopeConfidence,
  factorTradeAlignment,
  isFactorComplete,
  type BiasChoice,
  type EmaPeriod,
  type TradeBias,
} from './confluenceScoring'

export interface SetupFactorInput {
  factorId: string
  enabled: boolean
  biases: Record<Timeframe, BiasChoice>
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>
  selectedIntervals?: Record<Timeframe, boolean>
  premDiscountSliders?: Record<Timeframe, number>
}

export interface SetupMetrics {
  score: number
  rawScore: number
  scoreCeiling: number
  qualityPct: number
  syncPct: number
  confidencePct: number
  gradeInput: number
  rating: TradeRating
  mainTradeBias: TradeBias | null
  syncedCount: number
  completeCount: number
  activeCount: number
  factorScores: Record<string, number | null>
  factorPoints: Record<string, number>
  factorRawPoints: Record<string, number>
  factorSyncPct: Record<string, number>
  factorQualityPct: Record<string, number>
}

function activeCeiling(enabledIds: string[]): number {
  return enabledIds.reduce((sum, id) => sum + (FACTOR_MAX_POINTS[id] ?? 0), 0)
}

export function computeSetupMetrics(
  entries: SetupFactorInput[],
  chartInterval: Timeframe
): SetupMetrics {
  const mainTradeBias = deriveTradeBias(entries)

  const factorScores: Record<string, number | null> = {}
  const factorPoints: Record<string, number> = {}
  const factorRawPoints: Record<string, number> = {}
  const factorSyncPct: Record<string, number> = {}
  const factorQualityPct: Record<string, number> = {}

  let rawScore = 0
  let alignedScore = 0
  let completeCount = 0
  let syncedCount = 0
  let activeCount = 0

  let syncWeightTotal = 0
  let syncWeightedSum = 0
  let confWeightTotal = 0
  let confWeightedSum = 0

  const enabledIds: string[] = []

  for (const entry of entries) {
    const {
      factorId,
      enabled,
      biases,
      emaBiases,
      selectedIntervals,
      premDiscountSliders,
    } = entry

    if (!enabled) {
      factorScores[factorId] = null
      factorPoints[factorId] = 0
      factorRawPoints[factorId] = 0
      factorSyncPct[factorId] = 0
      factorQualityPct[factorId] = 0
      continue
    }

    activeCount += 1
    enabledIds.push(factorId)

    const maxPts = FACTOR_MAX_POINTS[factorId] ?? 0
    const rowScore = factorRowScore(
      factorId,
      biases,
      chartInterval,
      true,
      emaBiases,
      selectedIntervals,
      premDiscountSliders
    )
    const rawPts = factorRowPoints(
      factorId,
      biases,
      chartInterval,
      true,
      emaBiases,
      selectedIntervals,
      premDiscountSliders
    )
    const alignedPts = factorAlignedRowPoints(
      factorId,
      biases,
      chartInterval,
      true,
      mainTradeBias,
      emaBiases,
      selectedIntervals,
      premDiscountSliders
    )

    factorScores[factorId] = rowScore
    factorRawPoints[factorId] = rawPts
    factorPoints[factorId] = alignedPts
    factorQualityPct[factorId] = maxPts > 0 ? Math.round((rawPts / maxPts) * 100) : 0

    rawScore += rawPts
    alignedScore += alignedPts

    if (
      isFactorComplete(
        biases,
        factorId,
        emaBiases,
        selectedIntervals,
        premDiscountSliders
      )
    ) {
      completeCount += 1
    }

    const tally = factorBiasTally(
      factorId,
      biases,
      emaBiases,
      selectedIntervals,
      premDiscountSliders
    )

    if (mainTradeBias && tally.filledWeight > 0) {
      const sync = factorTradeAlignment(
        factorId,
        biases,
        mainTradeBias,
        emaBiases,
        selectedIntervals,
        premDiscountSliders
      )
      factorSyncPct[factorId] = sync
      syncWeightedSum += sync * maxPts
      syncWeightTotal += maxPts

      if (
        factorAlignsWithTradeBias(
          factorId,
          biases,
          mainTradeBias,
          emaBiases,
          selectedIntervals,
          premDiscountSliders
        )
      ) {
        syncedCount += 1
      }
    } else {
      factorSyncPct[factorId] = 0
    }

    const scopeConf = factorScopeConfidence(
      factorId,
      biases,
      emaBiases,
      selectedIntervals,
      premDiscountSliders
    )
    confWeightedSum += scopeConf * maxPts
    confWeightTotal += maxPts
  }

  const scoreCeiling = activeCeiling(enabledIds)
  const qualityPct = scoreCeiling > 0 ? Math.round((rawScore / scoreCeiling) * 100) : 0
  const syncPct =
    mainTradeBias && syncWeightTotal > 0
      ? Math.round(syncWeightedSum / syncWeightTotal)
      : 0

  const scopeConfidence =
    confWeightTotal > 0 ? confWeightedSum / confWeightTotal : 0
  const activeFactorRatio = activeCount / CONFLUENCE_FACTORS.length
  const confidencePct = Math.round(scopeConfidence * activeFactorRatio)

  const confidenceFactor = 0.5 + 0.5 * (confidencePct / 100)
  const compositeGradeInput = mainTradeBias
    ? qualityPct * (syncPct / 100) * confidenceFactor
    : qualityPct * confidenceFactor

  const rating = gradeFromAlignedPoints(alignedScore, scoreCeiling, confidencePct)

  return {
    score: alignedScore,
    rawScore,
    scoreCeiling,
    qualityPct,
    syncPct,
    confidencePct,
    gradeInput: compositeGradeInput,
    rating,
    mainTradeBias,
    syncedCount,
    completeCount,
    activeCount,
    factorScores,
    factorPoints,
    factorRawPoints,
    factorSyncPct,
    factorQualityPct,
  }
}
