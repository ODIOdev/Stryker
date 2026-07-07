import { TIMEFRAMES, type Timeframe } from '../../data/chartData'

interface TimeframePillsProps {
  value: Timeframe
  onChange: (tf: Timeframe) => void
  layoutId?: string
}

export function TimeframePills({ value, onChange }: TimeframePillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1" role="tablist">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.id}
          type="button"
          role="tab"
          aria-selected={value === tf.id}
          onClick={() => onChange(tf.id)}
          className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
            value === tf.id
              ? 'bg-okx-elevated text-okx-text'
              : 'text-okx-muted hover:text-okx-subtle'
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  )
}
