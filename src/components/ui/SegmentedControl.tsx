import { useEffect, useRef, useState } from 'react'
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

const smoothSpring = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 28,
  mass: 0.95,
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const activeIndex = options.findIndex((o) => o.value === value)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const updateIndicator = () => {
      const container = containerRef.current
      const btn = buttonRefs.current[activeIndex]
      if (!container || !btn || activeIndex < 0) return

      const cRect = container.getBoundingClientRect()
      const bRect = btn.getBoundingClientRect()
      setIndicator({
        left: bRect.left - cRect.left,
        width: bRect.width,
      })
    }

    updateIndicator()
    window.addEventListener('resize', updateIndicator)
    return () => window.removeEventListener('resize', updateIndicator)
  }, [activeIndex, options, value])

  return (
    <div
      ref={containerRef}
      className="relative inline-flex gap-0.5 rounded-full bg-okx-card p-1"
      role="tablist"
    >
      {activeIndex >= 0 && indicator.width > 0 && (
        <motion.div
          className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-okx-elevated"
          animate={{ left: indicator.left, width: indicator.width }}
          initial={false}
          transition={smoothSpring}
        />
      )}
      {options.map((opt, index) => (
        <button
          key={opt.value}
          ref={(el) => {
            buttonRefs.current[index] = el
          }}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative z-10 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-300 ease-out ${
            value === opt.value ? 'text-okx-text' : 'text-okx-muted hover:text-okx-subtle'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
