import { motion } from 'framer-motion'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  layoutId?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId = 'okx-segment',
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex((o) => o.value === value)

  return (
    <div className="relative inline-flex gap-0.5 rounded-full bg-okx-card p-1" role="tablist">
      {activeIndex >= 0 && (
        <motion.div
          layoutId={layoutId}
          className="absolute rounded-full bg-okx-elevated"
          style={{
            top: 4,
            bottom: 4,
            left: `calc(${activeIndex * (100 / options.length)}% + 4px)`,
            width: `calc(${100 / options.length}% - 8px)`,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative z-10 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            value === opt.value ? 'text-okx-text' : 'text-okx-muted hover:text-okx-subtle'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
