import { motion } from 'framer-motion'
import { gradePointThresholds, type TradeRating } from '../data/confluence'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { scoreAccentColor, scoreGlowStyle, scoreHeatBg, scoreHeatBorder, scoreTextClass } from '../lib/scoreColor'

interface ScoreGaugeProps {
  score: number
  maxScore: number
  rating: TradeRating
  compact?: boolean
  hideThresholds?: boolean
}

export function ScoreGauge({
  score,
  maxScore,
  rating,
  compact = false,
  hideThresholds = false,
}: ScoreGaugeProps) {
  const animatedScore = useAnimatedNumber(score)
  const normalized = maxScore > 0 ? (score / maxScore) * 100 : 0
  const gradeHeat = scoreAccentColor(rating.gradeInput)
  const arcColor = scoreAccentColor(normalized)
  const radius = compact ? 58 : 70
  const stroke = compact ? 5 : 6
  const svgWidth = compact ? 132 : 160
  const svgHeight = compact ? 74 : 88
  const circumference = Math.PI * radius
  const progress = Math.min(1, Math.max(0, score / maxScore))
  const dashOffset = circumference * (1 - progress)
  const centerX = svgWidth / 2
  const thresholds = gradePointThresholds(maxScore)

  const gradeSuffix =
    rating.grade === 'Wait'
      ? null
      : rating.label.replace(rating.grade, '').trim() || null

  return (
    <div
      className={`flex shrink-0 items-center ${
        compact
          ? 'gap-3'
          : 'flex-col gap-4 text-center @[280px]:flex-row @[280px]:items-center @[280px]:gap-5 @[280px]:text-left'
      }`}
    >
      <div className="relative shrink-0">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="overflow-visible"
        >
          <path
            d={`M ${centerX - radius} ${svgHeight - 10} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${svgHeight - 10}`}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <motion.path
            d={`M ${centerX - radius} ${svgHeight - 10} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${svgHeight - 10}`}
            fill="none"
            stroke={arcColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            style={{
              filter: normalized >= 25 ? `drop-shadow(0 0 10px ${arcColor}66)` : undefined,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
          <span
            className={`font-semibold tabular-nums ${compact ? 'text-2xl' : 'text-3xl'} ${scoreTextClass(normalized)}`}
            style={scoreGlowStyle(normalized)}
          >
            {animatedScore}
          </span>
          <span className="text-[9px] text-okx-muted">/ {maxScore.toLocaleString()}</span>
        </div>
      </div>
      <div className={compact ? 'min-w-0' : 'min-w-0 @[280px]:flex-1'}>
        <div
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
          }`}
          style={{
            color: gradeHeat,
            backgroundColor: scoreHeatBg(rating.gradeInput),
            border: `1px solid ${scoreHeatBorder(rating.gradeInput)}`,
          }}
        >
          {rating.grade === 'Wait' ? (
            <span>Wait</span>
          ) : (
            <>
              <span
                className={`flex items-center justify-center rounded-full font-bold ${
                  compact ? 'h-5 w-5 text-[10px]' : 'h-7 w-7 text-xs'
                }`}
                style={{
                  backgroundColor:
                    rating.gradeInput >= 70 ? gradeHeat : scoreHeatBg(rating.gradeInput, 0.35),
                  color: rating.gradeInput >= 70 ? '#000' : gradeHeat,
                  border:
                    rating.gradeInput < 70
                      ? `1px solid ${scoreHeatBorder(rating.gradeInput, 0.5)}`
                      : undefined,
                }}
              >
                {rating.grade}
              </span>
              {gradeSuffix && <span>{gradeSuffix}</span>}
            </>
          )}
        </div>
        {!hideThresholds && !compact && (
          <p className="mt-2 text-xs leading-relaxed text-okx-muted @[280px]:max-w-[220px]">
            <span className="text-okx-lime">A+ ≥{thresholds.aPlus.toLocaleString()}</span>
            {' · '}
            <span className="text-okx-lime/80">A ≥{thresholds.a.toLocaleString()}</span>
            {' · '}
            <span className="text-okx-amber">B ≥{thresholds.b.toLocaleString()}</span>
            {' · '}
            <span className="text-okx-muted">C ≥{thresholds.cMinus.toLocaleString()}</span>
          </p>
        )}
        {!hideThresholds && compact && (
          <p className="mt-1 hidden text-[9px] leading-snug text-okx-muted @[420px]:block">
            <span className="text-okx-lime">A+ ≥{thresholds.aPlus.toLocaleString()}</span>
            {' · '}
            <span className="text-okx-lime/80">A ≥{thresholds.a.toLocaleString()}</span>
            {' · '}
            <span className="text-okx-amber">B ≥{thresholds.b.toLocaleString()}</span>
          </p>
        )}
      </div>
    </div>
  )
}
