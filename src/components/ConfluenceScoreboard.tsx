import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { CONFLUENCE_FACTORS } from '../data/confluence'
import type { FactorState } from '../hooks/useConfluenceScore'
import type { TradeRating } from '../data/confluence'
import { DottedRow } from './ui/DottedRow'
import { ScoreGauge } from './ScoreGauge'
import { Toggle } from './ui/Toggle'
import { WeightPills } from './ui/WeightPills'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { scoreGlowStyle, scoreTextClass } from '../lib/scoreColor'

interface ConfluenceScoreboardProps {
  factors: Record<string, FactorState>
  score: number
  earned: number
  maxPossible: number
  rating: TradeRating
  onToggle: (id: string) => void
  onWeightChange: (id: string, weight: number) => void
}

export function ConfluenceScoreboard({
  factors,
  score,
  earned,
  maxPossible,
  rating,
  onToggle,
  onWeightChange,
}: ConfluenceScoreboardProps) {
  const animatedScore = useAnimatedNumber(score)
  const animatedEarned = useAnimatedNumber(earned)
  const activeCount = CONFLUENCE_FACTORS.filter((f) => factors[f.id]?.checked).length

  return (
    <div className="flex flex-col gap-4">
      {/* Confluences — table-style rows */}
      <div className="overflow-hidden rounded-2xl border border-okx-border bg-okx-card">
        <div className="border-b border-okx-border bg-okx-elevated/80 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-okx-text">Confluences</h3>
              <p className="mt-0.5 text-xs text-okx-muted">
                {activeCount} of {CONFLUENCE_FACTORS.length} active
              </p>
            </div>
            <span className="rounded-full bg-okx-lime/15 px-2.5 py-1 text-xs font-semibold text-okx-lime">
              {activeCount}/{CONFLUENCE_FACTORS.length}
            </span>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-okx-border px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-okx-muted">
          <span>Factor</span>
          <span className="w-14 text-center">Weight</span>
          <span className="w-10 text-center">On</span>
        </div>

        <div className="divide-y divide-okx-border">
          <AnimatePresence initial={false}>
            {CONFLUENCE_FACTORS.map((factor, index) => {
              const state = factors[factor.id]
              if (!state) return null

              return (
                <motion.div
                  key={factor.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`transition-colors ${
                    state.checked
                      ? 'border-l-2 border-l-okx-lime bg-okx-lime/[0.04]'
                      : 'border-l-2 border-l-transparent bg-transparent hover:bg-okx-hover/40'
                  }`}
                >
                  <div
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-4 py-3"
                    role="button"
                    tabIndex={0}
                    onClick={() => onToggle(factor.id)}
                    onKeyDown={(e) => e.key === 'Enter' && onToggle(factor.id)}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                            state.checked
                              ? 'bg-okx-lime/20 text-okx-lime'
                              : 'bg-okx-elevated text-okx-muted'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span
                          className={`truncate text-sm font-medium ${
                            state.checked ? 'text-okx-text' : 'text-okx-subtle'
                          }`}
                        >
                          {factor.label}
                        </span>
                        {state.checked && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-okx-lime" strokeWidth={3} />
                        )}
                      </div>
                      <p className="mt-0.5 pl-7 text-[11px] leading-snug text-okx-muted line-clamp-1">
                        {factor.description}
                      </p>
                    </div>

                    <span
                      className={`w-14 rounded-md py-1 text-center text-xs font-semibold tabular-nums ${
                        state.checked
                          ? 'bg-okx-lime/15 text-okx-lime'
                          : 'bg-okx-elevated text-okx-muted'
                      }`}
                    >
                      {state.checked ? state.weight : '—'}
                    </span>

                    <div className="flex w-10 justify-center" onClick={(e) => e.stopPropagation()}>
                      <Toggle
                        checked={state.checked}
                        onChange={() => onToggle(factor.id)}
                        aria-label={factor.label}
                      />
                    </div>
                  </div>

                  {state.checked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-okx-border/60 bg-okx-elevated/50 px-4 py-2.5 pl-11"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-okx-muted">
                        Adjust weight
                      </p>
                      <WeightPills
                        value={state.weight}
                        onChange={(w) => onWeightChange(factor.id, w)}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Grade */}
      <div className="rounded-2xl border border-okx-border bg-okx-card p-5">
        <ScoreGauge
          score={score}
          color={rating.color}
          grade={rating.label}
          gradeLetter={rating.grade}
        />
      </div>

      {/* Setup score */}
      <div className="rounded-2xl border border-okx-border bg-okx-card p-5">
        <h3 className="text-sm font-medium text-okx-text">Setup score</h3>
        <p
          className={`mt-3 text-3xl font-semibold tabular-nums ${scoreTextClass(score)}`}
          style={scoreGlowStyle(score)}
        >
          {animatedScore}
          <span className="text-lg text-okx-muted"> / 100</span>
        </p>
        <div className="mt-4 space-y-0.5">
          <DottedRow
            label="Points earned"
            value={`${animatedEarned} / ${maxPossible}`}
            highlight
            tone="lime"
          />
          <DottedRow
            label="Trade grade"
            value={rating.grade}
            highlight
            tone={score >= 85 ? 'lime' : score >= 70 ? 'lime' : score >= 50 ? 'amber' : 'none'}
          />
          <DottedRow label="Rating" value={rating.label} highlight tone="cyan" />
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-okx-lime/20 bg-okx-lime/[0.03] p-5">
        <p className="text-sm text-okx-subtle">Ready to execute?</p>
        <p className="mt-1 text-xs text-okx-muted">
          {score >= 85
            ? 'High-confluence setup — A grade.'
            : score >= 70
              ? 'Solid setup — review risk before entry.'
              : 'Low score — wait for more confluence.'}
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-full bg-okx-lime py-3.5 text-sm font-semibold text-black shadow-[0_0_20px_#bcff2f40] transition-all hover:bg-okx-lime-dim active:scale-[0.98]"
        >
          Trade now
        </button>
      </div>
    </div>
  )
}
