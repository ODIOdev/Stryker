import { useCallback, useState } from 'react'
import { getPriceStats, type Timeframe } from '../data/chartData'
import { CONFLUENCE_FACTORS, type TradeGrade, type TradeRating } from '../data/confluence'
import type { Ticker } from '../data/tickers'
import type { FactorState } from './useConfluenceScore'
import { factorDominantBias, defaultSelectedIntervals } from '../lib/confluenceScoring'

export interface GeneratedTrade {
  id: string
  createdAt: number
  tickerSymbol: string
  tickerName: string
  logoUrl: string
  timeframe: Timeframe
  score: number
  maxScore: number
  grade: TradeGrade
  ratingLabel: string
  ratingColor: string
  qualityPercent: number
  activeCount: number
  completeCount: number
  bias: 'long' | 'short' | 'neutral'
  entryPrice: number
}

export interface GenerateTradeInput {
  ticker: Ticker
  timeframe: Timeframe
  score: number
  maxScore: number
  rating: TradeRating
  qualityPct: number
  syncPct: number
  confidencePct: number
  activeCount: number
  completeCount: number
  factors: Record<string, FactorState>
}

function setupBias(
  factors: Record<string, FactorState>,
  chartInterval: Timeframe
): 'long' | 'short' | 'neutral' {
  let long = 0
  let short = 0

  for (const factor of CONFLUENCE_FACTORS) {
    const state = factors[factor.id]
    if (!state?.enabled) continue

    if (factor.id === 'ema-21-50-200' && state.emaBiases) {
      const dominant = factorDominantBias(state.biases, factor.id, state.emaBiases)
      if (dominant === 'long') long += 1
      if (dominant === 'short') short += 1
      continue
    }

    if (factor.id === 'bias') {
      const selected = state.selectedIntervals ?? defaultSelectedIntervals()
      if (selected[chartInterval]) {
        const bias = state.biases[chartInterval]
        if (bias === 'long') long += 1
        if (bias === 'short') short += 1
      } else {
        const dominant = factorDominantBias(state.biases, factor.id, undefined, selected)
        if (dominant === 'long') long += 1
        if (dominant === 'short') short += 1
      }
      continue
    }

    if (factor.id === 'premium-discount' && state.premDiscountSliders) {
      const dominant = factorDominantBias(
        state.biases,
        factor.id,
        undefined,
        undefined,
        state.premDiscountSliders
      )
      if (dominant === 'long') long += 1
      if (dominant === 'short') short += 1
      continue
    }

    const bias = state.biases[chartInterval]
    if (bias === 'long') long += 1
    if (bias === 'short') short += 1
  }

  if (long > short) return 'long'
  if (short > long) return 'short'
  return 'neutral'
}

export function buildGeneratedTrade(input: GenerateTradeInput): GeneratedTrade {
  const { price } = getPriceStats(input.ticker, input.timeframe)

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    tickerSymbol: input.ticker.symbol,
    tickerName: input.ticker.name,
    logoUrl: input.ticker.logoUrl,
    timeframe: input.timeframe,
    score: input.score,
    maxScore: input.maxScore,
    grade: input.rating.grade,
    ratingLabel: input.rating.label,
    ratingColor: input.rating.color,
    qualityPercent: input.qualityPct,
    activeCount: input.activeCount,
    completeCount: input.completeCount,
    bias: setupBias(input.factors, input.timeframe),
    entryPrice: price,
  }
}

export function useGeneratedTrades() {
  const [trades, setTrades] = useState<GeneratedTrade[]>([])

  const addTrade = useCallback((input: GenerateTradeInput) => {
    const trade = buildGeneratedTrade(input)
    setTrades((prev) => [trade, ...prev])
    return trade
  }, [])

  return { trades, addTrade }
}
