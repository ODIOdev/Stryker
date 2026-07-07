import { useMemo, useState } from 'react'
import { type Timeframe } from '../data/chartData'
import { CONFLUENCE_FACTORS } from '../data/confluence'
import {
  defaultSelectedIntervals,
  emptyBiases,
  emptyEmaBiases,
  type Bias,
  type BiasChoice,
  type EmaPeriod,
  type TradeBias,
} from '../lib/confluenceScoring'
import { emptyPremDiscountSliders } from '../lib/premDiscountScoring'
import { computeSetupMetrics } from '../lib/setupScoring'

export type { EmaPeriod }

export interface FactorState {
  enabled: boolean
  expanded: boolean
  biases: Record<Timeframe, BiasChoice>
  emaBiases?: Record<EmaPeriod, Record<Timeframe, BiasChoice>>
  activeEmaPeriod?: EmaPeriod
  selectedIntervals?: Record<Timeframe, boolean>
  premDiscountSliders?: Record<Timeframe, number>
  activePremDiscountTf?: Timeframe
}

function initialFactorState(factorId: string, chartInterval: Timeframe): FactorState {
  if (factorId === 'ema-21-50-200') {
    return {
      enabled: false,
      expanded: false,
      biases: emptyBiases(),
      emaBiases: emptyEmaBiases(),
      activeEmaPeriod: '200',
    }
  }
  if (factorId === 'bias') {
    return {
      enabled: false,
      expanded: false,
      biases: emptyBiases(),
      selectedIntervals: defaultSelectedIntervals(),
    }
  }
  if (factorId === 'premium-discount') {
    return {
      enabled: false,
      expanded: false,
      biases: emptyBiases(),
      premDiscountSliders: emptyPremDiscountSliders(),
      activePremDiscountTf: chartInterval,
    }
  }
  return { enabled: false, expanded: false, biases: emptyBiases() }
}

function toSetupEntries(factors: Record<string, FactorState>) {
  return CONFLUENCE_FACTORS.map((f) => {
    const state = factors[f.id]
    return {
      factorId: f.id,
      enabled: state?.enabled ?? false,
      biases: state?.biases ?? emptyBiases(),
      emaBiases: state?.emaBiases,
      selectedIntervals: state?.selectedIntervals,
      premDiscountSliders: state?.premDiscountSliders,
    }
  })
}

export function useConfluenceScore(chartInterval: Timeframe) {
  const [factors, setFactors] = useState<Record<string, FactorState>>(() =>
    Object.fromEntries(
      CONFLUENCE_FACTORS.map((f) => [f.id, initialFactorState(f.id, chartInterval)])
    )
  )

  const metrics = useMemo(
    () => computeSetupMetrics(toSetupEntries(factors), chartInterval),
    [factors, chartInterval]
  )

  const toggleExpand = (id: string) => {
    setFactors((prev) => ({
      ...prev,
      [id]: { ...prev[id], expanded: !prev[id]?.expanded },
    }))
  }

  const toggleEnabled = (id: string) => {
    setFactors((prev) => {
      const wasEnabled = prev[id]?.enabled
      const next = !wasEnabled
      return {
        ...prev,
        [id]: {
          ...prev[id],
          enabled: next,
          expanded: next,
        },
      }
    })
  }

  const setBias = (id: string, timeframe: Timeframe, bias: BiasChoice) => {
    setFactors((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        biases: { ...prev[id].biases, [timeframe]: bias },
      },
    }))
  }

  const setEmaBias = (
    id: string,
    period: EmaPeriod,
    timeframe: Timeframe,
    bias: BiasChoice
  ) => {
    setFactors((prev) => {
      const current = prev[id]
      const emaBiases = current?.emaBiases ?? emptyEmaBiases()
      return {
        ...prev,
        [id]: {
          ...current,
          emaBiases: {
            ...emaBiases,
            [period]: { ...emaBiases[period], [timeframe]: bias },
          },
        },
      }
    })
  }

  const setActiveEmaPeriod = (id: string, period: EmaPeriod) => {
    setFactors((prev) => ({
      ...prev,
      [id]: { ...prev[id], activeEmaPeriod: period },
    }))
  }

  const setPremDiscountSlider = (id: string, timeframe: Timeframe, value: number) => {
    setFactors((prev) => {
      const current = prev[id]
      const sliders = {
        ...(current?.premDiscountSliders ?? emptyPremDiscountSliders()),
        [timeframe]: value,
      }
      return {
        ...prev,
        [id]: { ...current, premDiscountSliders: sliders },
      }
    })
  }

  const setActivePremDiscountTf = (id: string, timeframe: Timeframe) => {
    setFactors((prev) => ({
      ...prev,
      [id]: { ...prev[id], activePremDiscountTf: timeframe },
    }))
  }

  return {
    factors,
    factorScores: metrics.factorScores,
    factorPoints: metrics.factorPoints,
    factorRawPoints: metrics.factorRawPoints,
    factorSyncPct: metrics.factorSyncPct,
    factorQualityPct: metrics.factorQualityPct,
    mainTradeBias: metrics.mainTradeBias,
    score: metrics.score,
    rawScore: metrics.rawScore,
    scoreCeiling: metrics.scoreCeiling,
    qualityPct: metrics.qualityPct,
    syncPct: metrics.syncPct,
    confidencePct: metrics.confidencePct,
    gradeInput: metrics.gradeInput,
    rating: metrics.rating,
    syncedCount: metrics.syncedCount,
    completeCount: metrics.completeCount,
    activeCount: metrics.activeCount,
    alignmentPercent: metrics.syncPct,
    toggleExpand,
    toggleEnabled,
    setBias,
    setEmaBias,
    setActiveEmaPeriod,
    setPremDiscountSlider,
    setActivePremDiscountTf,
  }
}

export type { Bias, BiasChoice, TradeBias }
