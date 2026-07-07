import { EMA_MAX_POINTS, EMA_PERIOD_MAX_POINTS, EMA_PERIODS, type EmaPeriod } from '../../data/confluence'
import type { Timeframe } from '../../data/chartData'
import {
  emaPeriodPoints,
  emaPeriodRowScore,
  factorBiasTally,
  type BiasChoice,
} from '../../lib/confluenceScoring'
import { TimeframeBiasGrid } from './TimeframeBiasGrid'

const EMA_LABELS: Record<EmaPeriod, string> = {
  '21': '21 EMA',
  '50': '50 EMA',
  '200': '200 EMA',
}

interface EmaConfluencePanelProps {
  emaBiases: Record<EmaPeriod, Record<Timeframe, BiasChoice>>
  activePeriod: EmaPeriod
  chartInterval: Timeframe
  totalPoints: number
  onPeriodChange: (period: EmaPeriod) => void
  onBiasChange: (period: EmaPeriod, timeframe: Timeframe, bias: BiasChoice) => void
}

export function EmaConfluencePanel({
  emaBiases,
  activePeriod,
  chartInterval,
  totalPoints,
  onPeriodChange,
  onBiasChange,
}: EmaConfluencePanelProps) {
  const activeBiases = emaBiases[activePeriod]
  const tally = factorBiasTally('', activeBiases)
  const periodPoints = emaPeriodPoints(activePeriod, activeBiases)
  const periodScore = emaPeriodRowScore(activeBiases)
  const periodMax = EMA_PERIOD_MAX_POINTS[activePeriod]

  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-1.5">
        {EMA_PERIODS.map((period) => {
          const pts = emaPeriodPoints(period, emaBiases[period])
          const max = EMA_PERIOD_MAX_POINTS[period]
          const active = period === activePeriod

          return (
            <button
              key={period}
              type="button"
              onClick={() => onPeriodChange(period)}
              className={`cursor-pointer rounded-lg border px-2 py-2 text-center transition-colors ${
                active
                  ? 'border-okx-lime/50 bg-okx-lime/10 text-okx-lime'
                  : 'border-okx-border bg-okx-elevated/60 text-okx-muted hover:border-okx-border/80 hover:text-okx-text'
              }`}
            >
              <span className="block text-[10px] font-semibold leading-tight">{EMA_LABELS[period]}</span>
              <span
                className={`mt-0.5 block text-[9px] tabular-nums ${
                  active ? 'text-okx-lime/80' : 'text-okx-muted'
                }`}
              >
                {pts}/{max} pts
              </span>
            </button>
          )
        })}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-okx-muted">
          {EMA_LABELS[activePeriod]} · Long / Short tally
        </p>
        {tally.filledWeight > 0 && (
          <span className="text-xs font-semibold tabular-nums text-okx-lime">
            {periodPoints}/{periodMax} pts · {periodScore}% · Total {totalPoints}/{EMA_MAX_POINTS}
          </span>
        )}
      </div>

      <TimeframeBiasGrid
        factorId="ema-21-50-200"
        biases={activeBiases}
        tally={tally}
        chartInterval={chartInterval}
        onBiasChange={(tf, bias) => onBiasChange(activePeriod, tf, bias)}
      />
    </div>
  )
}
