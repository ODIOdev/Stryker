import { useCallback, useEffect, useState } from 'react'
import { CONFLUENCE_FACTORS, type TradeGrade, type TradeRating } from '../data/confluence'
import type { Ticker } from '../data/tickers'
import type { FactorState } from './useConfluenceScore'
import { factorDominantBias, defaultSelectedIntervals } from '../lib/confluenceScoring'
import type { Timeframe } from '../data/chartData'
import { saveSetup, fetchSetups } from '../lib/api'

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
  entryPrice: number
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
    entryPrice: input.entryPrice,
  }
}

export function useGeneratedTrades(isAuthenticated: boolean, onSaved?: () => void) {
  const [trades, setTrades] = useState<GeneratedTrade[]>([])

  useEffect(() => {
    if (!isAuthenticated) return
    fetchSetups()
      .then((res) => {
        const mapped = (res.setups as Record<string, unknown>[]).map((s) => ({
          id: String(s.id),
          createdAt: new Date(String(s.created_at)).getTime(),
          tickerSymbol: String(s.ticker_symbol),
          tickerName: String(s.ticker_name ?? ''),
          logoUrl: String(s.logo_url ?? ''),
          timeframe: String(s.timeframe) as Timeframe,
          score: Number(s.score),
          maxScore: Number(s.max_score),
          grade: String(s.grade) as TradeGrade,
          ratingLabel: String(s.rating_label ?? ''),
          ratingColor: String(s.rating_color ?? ''),
          qualityPercent: Number(s.quality_pct ?? 0),
          activeCount: Number(s.active_count ?? 0),
          completeCount: Number(s.complete_count ?? 0),
          bias: (String(s.bias ?? 'neutral') as 'long' | 'short' | 'neutral'),
          entryPrice: Number(s.entry_price ?? 0),
        }))
        setTrades(mapped)
      })
      .catch(() => {})
  }, [isAuthenticated])

  const addTrade = useCallback(
    async (input: GenerateTradeInput) => {
      const trade = buildGeneratedTrade(input)
      setTrades((prev) => [trade, ...prev])

      if (isAuthenticated) {
        try {
          await saveSetup({
            tickerSymbol: input.ticker.symbol,
            tickerName: input.ticker.name,
            logoUrl: input.ticker.logoUrl,
            timeframe: input.timeframe,
            score: input.score,
            maxScore: input.maxScore,
            grade: input.rating.grade,
            ratingLabel: input.rating.label,
            ratingColor: input.rating.color,
            qualityPct: input.qualityPct,
            syncPct: input.syncPct,
            confidencePct: input.confidencePct,
            activeCount: input.activeCount,
            completeCount: input.completeCount,
            bias: trade.bias,
            entryPrice: input.entryPrice,
          })
          onSaved?.()
        } catch {
          // keep local trade even if API fails
        }
      }

      return trade
    },
    [isAuthenticated, onSaved]
  )

  return { trades, addTrade }
}
