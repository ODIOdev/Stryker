import { timeframeLabel, type Timeframe } from '../../data/chartData'
import type { Bias, BiasChoice, BiasTally } from '../../lib/confluenceScoring'

interface BiasToggleProps {
  value: BiasChoice
  onChange: (bias: BiasChoice) => void
  favoredBias?: Bias | null
  highlight?: boolean
}

export function BiasToggle({ value, onChange, favoredBias, highlight }: BiasToggleProps) {
  const setBias = (bias: Bias) => {
    onChange(value === bias ? null : bias)
  }

  const longFavored = favoredBias === 'long'
  const shortFavored = favoredBias === 'short'

  return (
    <div className="flex gap-0.5">
      <button
        type="button"
        onClick={() => setBias('long')}
        className={`h-5 w-5 cursor-pointer rounded text-[9px] font-bold transition-all ${
          value === 'long'
            ? 'bg-up text-black shadow-[0_0_8px_#2dd4bf40]'
            : longFavored
              ? 'border border-up/40 bg-up/15 text-up'
              : highlight
                ? 'bg-okx-lime/10 text-okx-lime/70 hover:bg-okx-lime/20'
                : 'bg-okx-elevated text-okx-muted hover:text-up'
        }`}
        aria-label="Long"
      >
        L
      </button>
      <button
        type="button"
        onClick={() => setBias('short')}
        className={`h-5 w-5 cursor-pointer rounded text-[9px] font-bold transition-all ${
          value === 'short'
            ? 'bg-down text-white shadow-[0_0_8px_#ff5b5b40]'
            : shortFavored
              ? 'border border-down/40 bg-down/15 text-down'
              : highlight
                ? 'bg-okx-lime/10 text-okx-lime/70 hover:bg-down/20'
                : 'bg-okx-elevated text-okx-muted hover:text-down'
        }`}
        aria-label="Short"
      >
        S
      </button>
    </div>
  )
}

interface BiasTallyBarProps {
  tally: BiasTally
}

export function BiasTallyBar({ tally }: BiasTallyBarProps) {
  if (tally.filledWeight === 0) {
    return (
      <p className="mb-2 text-[10px] text-okx-muted">Select L or S on each timeframe</p>
    )
  }

  const longFavored = tally.dominant === 'long'
  const shortFavored = tally.dominant === 'short'

  return (
    <div className="mb-2.5">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-okx-elevated">
        <div
          className="bg-up transition-all duration-300"
          style={{ width: `${tally.longPct}%` }}
        />
        <div
          className="bg-down transition-all duration-300"
          style={{ width: `${tally.shortPct}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold tabular-nums">
        <span className={longFavored ? 'text-up' : 'text-okx-muted'}>L {tally.longPct}%</span>
        <span className="text-okx-muted">
          {tally.dominantPct}% {tally.dominant === 'long' ? 'Long' : 'Short'}
        </span>
        <span className={shortFavored ? 'text-down' : 'text-okx-muted'}>S {tally.shortPct}%</span>
      </div>
    </div>
  )
}

interface TimeframeBiasGridProps {
  factorId: string
  biases: Record<Timeframe, BiasChoice>
  tally: BiasTally
  chartInterval: Timeframe
  onBiasChange: (timeframe: Timeframe, bias: BiasChoice) => void
}

export function TimeframeBiasGrid({
  biases,
  tally,
  chartInterval,
  onBiasChange,
}: TimeframeBiasGridProps) {
  const timeframes: Timeframe[] = ['5m', '15m', '30m', '1h', '4h', '1D']

  return (
    <div>
      <BiasTallyBar tally={tally} />
      <div className="space-y-1.5">
        {timeframes.map((tf) => (
          <div
            key={tf}
            className={`flex items-center justify-between gap-2 rounded-md px-2 py-1 ${
              tf === chartInterval ? 'bg-okx-lime/[0.06]' : ''
            }`}
          >
            <span
              className={`w-7 text-[10px] font-medium ${
                tf === chartInterval ? 'text-okx-lime' : 'text-okx-muted'
              }`}
            >
              {timeframeLabel(tf)}
            </span>
            <BiasToggle
              value={biases[tf]}
              favoredBias={tally.dominant}
              highlight={tf === chartInterval}
              onChange={(bias) => onBiasChange(tf, bias)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
