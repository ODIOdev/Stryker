export interface ConfluenceFactor {
  id: string
  label: string
  description: string
  defaultWeight: number
}

export const CONFLUENCE_FACTORS: ConfluenceFactor[] = [
  {
    id: 'trend',
    label: 'Trend alignment',
    description: 'Price aligns with higher-timeframe trend',
    defaultWeight: 20,
  },
  {
    id: 'level',
    label: 'Key level (weekly)',
    description: 'Reaction at significant weekly S/R',
    defaultWeight: 15,
  },
  {
    id: 'rsi',
    label: 'RSI confluence',
    description: 'RSI oversold/overbought with divergence',
    defaultWeight: 15,
  },
  {
    id: 'volume',
    label: 'Volume surge',
    description: 'Volume spike confirms the move',
    defaultWeight: 10,
  },
  {
    id: 'macd',
    label: 'MACD cross',
    description: 'Momentum crossover on your timeframe',
    defaultWeight: 10,
  },
  {
    id: 'structure',
    label: 'Structure break',
    description: 'Clean BOS / CHoCH',
    defaultWeight: 20,
  },
]

export const WEIGHT_OPTIONS = [5, 10, 15, 20, 25] as const

export type TradeGrade = 'A' | 'B' | 'C'

export interface TradeRating {
  grade: TradeGrade
  label: string
  color: string
  bgClass: string
  ringClass: string
}

const LIME = '#bcff2f'
const GREY = '#6b6b6b'

export function scoreToRating(score: number): TradeRating {
  if (score >= 85) {
    return {
      grade: 'A',
      label: 'A Trade',
      color: LIME,
      bgClass: 'bg-okx-lime/10 border-okx-lime/30 text-okx-lime',
      ringClass: 'stroke-okx-lime',
    }
  }
  if (score >= 70) {
    return {
      grade: 'B',
      label: 'B Trade',
      color: '#d4ff5c',
      bgClass: 'bg-okx-lime/10 border-okx-lime/25 text-okx-lime',
      ringClass: 'stroke-okx-lime',
    }
  }
  if (score >= 50) {
    return {
      grade: 'C',
      label: 'C Trade',
      color: '#e8b84a',
      bgClass: 'bg-okx-amber/10 border-okx-amber/30 text-okx-amber',
      ringClass: 'stroke-okx-amber',
    }
  }
  return {
    grade: 'C',
    label: 'Wait',
    color: GREY,
    bgClass: 'bg-okx-elevated border-okx-border text-okx-muted',
    ringClass: 'stroke-okx-muted',
  }
}
