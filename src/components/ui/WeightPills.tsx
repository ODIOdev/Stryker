import { WEIGHT_OPTIONS } from '../../data/confluence'

interface WeightPillsProps {
  value: number
  onChange: (weight: number) => void
  disabled?: boolean
}

export function WeightPills({ value, onChange, disabled }: WeightPillsProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {WEIGHT_OPTIONS.map((w) => (
        <button
          key={w}
          type="button"
          disabled={disabled}
          onClick={() => onChange(w)}
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-all ${
            value === w
              ? 'bg-okx-lime text-black shadow-[0_0_10px_#bcff2f35]'
              : 'bg-okx-elevated text-okx-muted hover:text-okx-lime/80'
          } ${disabled ? 'pointer-events-none opacity-40' : ''}`}
        >
          {w}
        </button>
      ))}
    </div>
  )
}
