import { motion } from 'framer-motion'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { scoreAccentColor, scoreTextClass } from '../lib/scoreColor'

const SEGMENTS = 24

function segmentHeatColor(segmentIndex: number): string {
  const pct = ((segmentIndex + 1) / SEGMENTS) * 100
  if (pct <= 40) return '#ff5b5b'
  if (pct <= 55) return '#e8b84a'
  if (pct <= 70) return '#d4ff5c'
  if (pct <= 85) return '#bcff2f'
  return '#bcff2f'
}

interface QualityMeterProps {
  percent: number
  className?: string
  compact?: boolean
}

export function QualityMeter({ percent, className = '', compact = false }: QualityMeterProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  const animatedPct = useAnimatedNumber(Math.round(clamped))
  const filledSegments = Math.round((clamped / 100) * SEGMENTS)

  return (
    <div className={`flex min-w-0 flex-col ${compact ? 'gap-1.5' : 'gap-2'} ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-okx-muted">
          Setup quality
        </p>
        <p
          className={`font-semibold tabular-nums ${compact ? 'text-xl' : 'text-2xl'} ${scoreTextClass(clamped)}`}
        >
          {animatedPct}
          <span className={`text-okx-muted ${compact ? 'text-xs' : 'text-sm'}`}>%</span>
        </p>
      </div>

      <div className="w-full min-w-0">
        <div className="flex gap-0.5">
          {Array.from({ length: SEGMENTS }, (_, i) => {
            const active = i < filledSegments
            const heat = segmentHeatColor(i)

            return (
              <motion.div
                key={i}
                className={`flex-1 rounded-[3px] ${compact ? 'h-6' : 'h-10'}`}
                initial={false}
                animate={{
                  backgroundColor: active ? heat : '#1c1c1c',
                  opacity: active ? 1 : 0.45,
                  boxShadow: active && i === filledSegments - 1 ? `0 0 10px ${heat}66` : 'none',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              />
            )
          })}
        </div>

        <div
          className={`h-1 w-full overflow-hidden rounded-full ${compact ? 'mt-1' : 'mt-1.5'}`}
          style={{
            background: 'linear-gradient(90deg, #ff5b5b 0%, #e8b84a 35%, #d4ff5c 60%, #bcff2f 100%)',
            opacity: 0.25,
          }}
        />

        <div className="mt-1 flex w-full justify-between text-[9px] font-medium text-okx-muted">
          <span>Low</span>
          <span style={{ color: scoreAccentColor(clamped) }}>
            {clamped >= 96
              ? 'A+'
              : clamped >= 91
                ? 'A'
                : clamped >= 85
                  ? 'A-'
                  : clamped >= 81
                    ? 'B+'
                    : clamped >= 75
                      ? 'B'
                      : clamped >= 70
                        ? 'B-'
                        : clamped >= 63
                          ? 'C+'
                          : clamped >= 57
                            ? 'C'
                            : clamped >= 50
                              ? 'C-'
                              : 'Wait'}
          </span>
          <span>Elite</span>
        </div>
      </div>
    </div>
  )
}
