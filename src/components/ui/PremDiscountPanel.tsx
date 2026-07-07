import { TIMEFRAMES, timeframeLabel, type Timeframe } from '../../data/chartData'
import { PREM_DISCOUNT_MAX_POINTS } from '../../data/confluence'
import {
  premDiscountColor,
  premDiscountIsSet,
  premDiscountLabel,
  premDiscountPoints,
  premDiscountRowScore,
  premDiscountTally,
} from '../../lib/premDiscountScoring'
import { BiasTallyBar } from './TimeframeBiasGrid'

interface PremDiscountPanelProps {
  sliders: Record<Timeframe, number>
  activeTimeframe: Timeframe
  chartInterval: Timeframe
  onTimeframeChange: (timeframe: Timeframe) => void
  onSliderChange: (timeframe: Timeframe, value: number) => void
}

export function PremDiscountPanel({
  sliders,
  activeTimeframe,
  chartInterval,
  onTimeframeChange,
  onSliderChange,
}: PremDiscountPanelProps) {
  const activeValue = sliders[activeTimeframe]
  const tally = premDiscountTally(sliders)
  const points = premDiscountPoints(sliders)
  const rowScore = premDiscountRowScore(sliders)
  const thumbColor = premDiscountColor(activeValue)

  return (
    <div>
      <div className="mb-3">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-okx-muted">
            {timeframeLabel(activeTimeframe)} · Prem / Discount
          </p>
          <span className="text-xs font-semibold tabular-nums" style={{ color: thumbColor }}>
            {premDiscountLabel(activeValue)} · {activeValue}
          </span>
        </div>

        <div
          className="rounded-lg border border-okx-border/80 bg-okx-elevated/50 px-3 py-3"
          style={{ ['--prem-discount-thumb' as string]: thumbColor }}
        >
          <div className="prem-discount-track">
            <div className="prem-discount-track__gradient" aria-hidden />
            <div className="prem-discount-track__tick" aria-hidden />
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={activeValue}
              onChange={(e) => onSliderChange(activeTimeframe, Number(e.target.value))}
              className="prem-discount-slider"
              aria-label={`${timeframeLabel(activeTimeframe)} premium discount slider`}
            />
          </div>
          <div className="mt-2.5 grid grid-cols-3 text-[9px] font-semibold uppercase tracking-wide">
            <span className="text-left text-up">Discount</span>
            <span className="text-center text-okx-muted">Fair</span>
            <span className="text-right text-down">Premium</span>
          </div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-6 gap-1">
        {TIMEFRAMES.map((tf) => {
          const value = sliders[tf.id]
          const active = tf.id === activeTimeframe
          const set = premDiscountIsSet(value)

          return (
            <button
              key={tf.id}
              type="button"
              onClick={() => onTimeframeChange(tf.id)}
              className={`cursor-pointer rounded-md border px-1 py-1.5 text-center transition-colors ${
                active
                  ? 'border-okx-lime/50 bg-okx-lime/10'
                  : 'border-okx-border bg-okx-elevated/50 hover:border-okx-border/80 hover:bg-okx-hover/40'
              } ${tf.id === chartInterval ? 'ring-1 ring-okx-lime/30' : ''}`}
            >
              <span
                className={`block text-[9px] font-semibold ${
                  active ? 'text-okx-lime' : 'text-okx-muted'
                }`}
              >
                {tf.label}
              </span>
              <span
                className="mx-auto mt-1 block h-1 w-full max-w-[2rem] rounded-full"
                style={{
                  backgroundColor: set ? premDiscountColor(value) : 'var(--color-okx-border)',
                  opacity: set ? 1 : 0.55,
                }}
              />
            </button>
          )
        })}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-okx-muted">
          Discount / Premium tally
        </p>
        {tally.filledWeight > 0 && (
          <span className="text-xs font-semibold tabular-nums text-okx-lime">
            {points}/{PREM_DISCOUNT_MAX_POINTS} pts · {rowScore}% · D {tally.longPct}% · P{' '}
            {tally.shortPct}%
          </span>
        )}
      </div>

      <BiasTallyBar tally={tally} />
    </div>
  )
}
