import { motion } from 'framer-motion'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { scoreAccentColor, scoreGlowStyle, scoreTextClass } from '../lib/scoreColor'

interface ScoreGaugeProps {
  score: number
  color: string
  grade: string
  gradeLetter: string
}

export function ScoreGauge({ score, color, grade, gradeLetter }: ScoreGaugeProps) {
  const animatedScore = useAnimatedNumber(score)
  const arcColor = scoreAccentColor(score)
  const radius = 70
  const stroke = 6
  const circumference = Math.PI * radius
  const progress = Math.min(100, Math.max(0, score)) / 100
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="160" height="88" viewBox="0 0 160 88" className="overflow-visible">
          <path
            d={`M ${80 - radius} 78 A ${radius} ${radius} 0 0 1 ${80 + radius} 78`}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <motion.path
            d={`M ${80 - radius} 78 A ${radius} ${radius} 0 0 1 ${80 + radius} 78`}
            fill="none"
            stroke={arcColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            style={{
              filter:
                score >= 50 ? `drop-shadow(0 0 10px ${arcColor}66)` : undefined,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span
            className={`text-3xl font-semibold tabular-nums ${scoreTextClass(score)}`}
            style={scoreGlowStyle(score)}
          >
            {animatedScore}
          </span>
          <span className="text-[10px] text-okx-muted">/ 100</span>
        </div>
      </div>
      <div>
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold"
          style={{
            color,
            backgroundColor: `${color}12`,
            border: `1px solid ${color}35`,
          }}
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
            style={{
              backgroundColor: color === '#bcff2f' || color === '#d4ff5c' ? '#bcff2f' : 'transparent',
              color: color === '#bcff2f' || color === '#d4ff5c' ? '#000' : color,
              border:
                color !== '#bcff2f' && color !== '#ffffff' ? `1px solid ${color}50` : undefined,
            }}
          >
            {gradeLetter}
          </span>
          {grade}
        </div>
        <p className="mt-2 max-w-[140px] text-xs leading-relaxed text-okx-muted">
          <span className="text-okx-lime">A ≥85</span>
          {' · '}
          <span className="text-okx-lime/80">B 70–84</span>
          {' · '}
          <span className="text-okx-amber">C &lt;70</span>
        </p>
      </div>
    </div>
  )
}
