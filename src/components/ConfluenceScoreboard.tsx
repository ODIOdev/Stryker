import { ChevronDown } from 'lucide-react'
import { TIMEFRAMES, type Timeframe } from '../data/chartData'
import { CONFLUENCE_FACTORS, EMA_PERIODS, factorPointsCeiling } from '../data/confluence'
import type { EmaPeriod, FactorState } from '../hooks/useConfluenceScore'
import {
  countFilledBiases,
  defaultSelectedIntervals,
  emaPeriodPoints,
  factorBiasTally,
  factorDominantBias,
  isFactorComplete,
  rDivergenceMaxPercent,
  type BiasChoice,
  type TradeBias,
} from '../lib/confluenceScoring'
import {
  countPremDiscountFilled,
  premDiscountColor,
  premDiscountIsSet,
} from '../lib/premDiscountScoring'
import { EmaConfluencePanel } from './ui/EmaConfluencePanel'
import { PremDiscountPanel } from './ui/PremDiscountPanel'
import { TimeframeBiasGrid } from './ui/TimeframeBiasGrid'
import { Toggle } from './ui/Toggle'

interface ConfluenceScoreboardProps {
  factors: Record<string, FactorState>
  factorScores: Record<string, number | null>
  factorPoints: Record<string, number>
  factorSyncPct?: Record<string, number>
  chartInterval: Timeframe
  syncedCount: number
  completeCount: number
  activeCount: number
  confidencePct?: number
  mainTradeBias?: TradeBias | null
  onToggleExpand: (id: string) => void
  onToggleEnabled: (id: string) => void
  onBiasChange: (id: string, timeframe: Timeframe, bias: BiasChoice) => void
  onEmaBiasChange?: (id: string, period: EmaPeriod, timeframe: Timeframe, bias: BiasChoice) => void
  onActiveEmaPeriodChange?: (id: string, period: EmaPeriod) => void
  onPremDiscountSliderChange?: (id: string, timeframe: Timeframe, value: number) => void
  onActivePremDiscountTfChange?: (id: string, timeframe: Timeframe) => void
  fillHeight?: boolean
  className?: string
}

function rowScoreClass(normalizedPct: number): string {
  if (normalizedPct >= 85) return 'text-okx-lime'
  if (normalizedPct >= 70) return 'text-okx-lime/80'
  if (normalizedPct >= 50) return 'text-okx-amber'
  return 'text-okx-muted'
}

function rowNormalizedPct(
  factorId: string,
  rowScore: number,
  chartInterval: Timeframe
): number {
  if (factorId === 'r-divergence') {
    const max = rDivergenceMaxPercent(chartInterval)
    return max > 0 ? (rowScore / max) * 100 : 0
  }
  return rowScore
}

function formatRowScore(
  factorId: string,
  enabled: boolean,
  rowScore: number | null,
  points: number,
  syncPct?: number,
  hasBias?: boolean
): string {
  if (!enabled || rowScore === null) return '—'
  const ceiling = factorPointsCeiling(factorId)
  const base = ceiling !== null ? `${points}/${ceiling}` : `${rowScore}%`
  if (hasBias && syncPct !== undefined && syncPct > 0) {
    return `${base} · ${syncPct}%`
  }
  return base
}

const collapseTransition = 'grid-template-rows 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease-out'

export function ConfluenceScoreboard({
  factors,
  factorScores,
  factorPoints,
  factorSyncPct = {},
  chartInterval,
  syncedCount,
  completeCount,
  activeCount,
  confidencePct = 0,
  mainTradeBias = null,
  onToggleExpand,
  onToggleEnabled,
  onBiasChange,
  onEmaBiasChange,
  onActiveEmaPeriodChange,
  onPremDiscountSliderChange,
  onActivePremDiscountTfChange,
  fillHeight = false,
  className,
}: ConfluenceScoreboardProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-okx-border bg-okx-card ${
        fillHeight ? 'flex h-full min-h-0 flex-col' : ''
      } ${className ?? ''}`}
    >
      <div className="shrink-0 border-b border-okx-border bg-okx-elevated/80 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-okx-text">Confluences</h3>
            <p className="mt-0.5 text-xs text-okx-muted">
              {activeCount} active · {completeCount} complete · Conf {confidencePct}%
              {mainTradeBias ? (
                <>
                  {' '}
                  · {syncedCount} aligned{' '}
                  {mainTradeBias === 'long'
                    ? 'Long'
                    : mainTradeBias === 'short'
                      ? 'Short'
                      : 'Range'}
                </>
              ) : (
                ' · Bias not active'
              )}
            </p>
          </div>
          <span className="rounded-full bg-okx-lime/15 px-2.5 py-1 text-xs font-semibold text-okx-lime">
            {activeCount}/{CONFLUENCE_FACTORS.length}
          </span>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-[1fr_auto_auto] gap-2 border-b border-okx-border px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-okx-muted">
        <span>Factor</span>
        <span className="min-w-[4.5rem] text-center">Score</span>
        <span className="w-10 text-center">On</span>
      </div>

      <div
        className={
          fillHeight
            ? 'confluence-scroll-mask flex min-h-0 flex-1 flex-col'
            : 'divide-y divide-okx-border'
        }
      >
        <div
          className={
            fillHeight
              ? 'confluence-scroll-mask__viewport scrollbar-none flex min-h-0 flex-1 flex-col divide-y divide-okx-border'
              : 'contents'
          }
        >
        {CONFLUENCE_FACTORS.map((factor, index) => {
            const state = factors[factor.id]
            if (!state) return null

            const rowScore = factorScores[factor.id]
            const points = factorPoints[factor.id] ?? 0
            const isEma = factor.id === 'ema-21-50-200'
            const isPrem = factor.id === 'premium-discount'
            const emaBiases = state.emaBiases
            const premDiscountSliders = state.premDiscountSliders
            const selectedIntervals =
              state.selectedIntervals ?? defaultSelectedIntervals()
            const complete = isFactorComplete(
              state.biases,
              factor.id,
              emaBiases,
              selectedIntervals,
              premDiscountSliders
            )
            const filled = isEma && emaBiases
              ? EMA_PERIODS.reduce((n, p) => n + countFilledBiases(emaBiases[p]), 0)
              : isPrem && premDiscountSliders
                ? countPremDiscountFilled(premDiscountSliders)
                : countFilledBiases(state.biases)
            const filledTotal = isEma && emaBiases ? 18 : 6
            const dominant = factorDominantBias(
              state.biases,
              factor.id,
              emaBiases,
              selectedIntervals,
              premDiscountSliders
            )
            const tally = factorBiasTally(
              factor.id,
              state.biases,
              emaBiases,
              selectedIntervals,
              premDiscountSliders
            )
            const chartBias = isEma && emaBiases
              ? emaBiases['200'][chartInterval] ?? emaBiases['50'][chartInterval] ?? emaBiases['21'][chartInterval]
              : isPrem && premDiscountSliders
                ? premDiscountIsSet(premDiscountSliders[chartInterval])
                  ? premDiscountSliders[chartInterval] < 50
                    ? 'long'
                    : 'short'
                  : null
                : state.biases[chartInterval]
            const isRDiv = factor.id === 'r-divergence'
            const pointsCeiling = factorPointsCeiling(factor.id)
            const rDivMax = isRDiv ? rDivergenceMaxPercent(chartInterval) : null
            const normalizedPct =
              state.enabled && rowScore !== null
                ? rowNormalizedPct(factor.id, rowScore, chartInterval)
                : 0

            return (
              <div
                key={factor.id}
                className={`transition-[opacity,background-color,border-color] duration-200 ease-out ${
                  state.enabled ? 'opacity-100' : 'opacity-55'
                } ${
                  !state.enabled
                    ? 'border-l-2 border-l-transparent'
                    : complete && dominant
                      ? dominant === 'long'
                        ? 'border-l-2 border-l-up bg-up/[0.03]'
                        : 'border-l-2 border-l-down bg-down/[0.03]'
                      : tally.filledWeight > 0 && dominant
                        ? dominant === 'long'
                          ? 'border-l-2 border-l-up/50 bg-up/[0.02]'
                          : 'border-l-2 border-l-down/50 bg-down/[0.02]'
                      : chartBias
                        ? 'border-l-2 border-l-okx-lime/40 bg-okx-lime/[0.02]'
                        : 'border-l-2 border-l-okx-lime/20 bg-okx-lime/[0.02]'
                }`}
              >
                <div
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-2 px-4 py-3"
                >
                  <div
                    className="min-w-0 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => state.enabled && onToggleExpand(factor.id)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && state.enabled && onToggleExpand(factor.id)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                          state.enabled
                            ? 'bg-okx-lime/20 text-okx-lime'
                            : 'bg-okx-elevated text-okx-muted'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={`truncate text-sm font-medium ${
                          state.enabled ? 'text-okx-text' : 'text-okx-subtle'
                        }`}
                      >
                        {factor.label}
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 text-okx-muted transition-[opacity,transform] duration-200 ease-out ${
                          state.enabled ? 'opacity-100' : 'opacity-0'
                        } ${state.expanded ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {state.enabled && isEma && emaBiases && (
                      <div className="mt-1.5 flex items-center gap-2 pl-7">
                        {EMA_PERIODS.map((period) => {
                          const periodPts = emaPeriodPoints(period, emaBiases[period])
                          const chartPeriodBias = emaBiases[period][chartInterval]
                          return (
                            <span
                              key={period}
                              title={`${period} EMA: ${chartPeriodBias ?? 'unset'} · ${periodPts} pts`}
                              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold tabular-nums ${
                                chartPeriodBias === 'long'
                                  ? 'bg-up/15 text-up'
                                  : chartPeriodBias === 'short'
                                    ? 'bg-down/15 text-down'
                                    : 'bg-okx-elevated text-okx-muted'
                              }`}
                            >
                              {period}
                            </span>
                          )
                        })}
                        {!complete && tally.filledWeight > 0 && (
                          <span
                            className={`text-[10px] font-medium tabular-nums ${
                              dominant === 'long' ? 'text-up' : 'text-down'
                            }`}
                          >
                            {dominant === 'long' ? 'L' : 'S'} {tally.dominantPct}%
                          </span>
                        )}
                        {!complete && tally.filledWeight === 0 && (
                          <span className="text-[10px] text-okx-muted">{filled}/18</span>
                        )}
                      </div>
                    )}

                    {state.enabled && isPrem && premDiscountSliders && (
                      <div className="mt-1.5 flex items-center gap-1 pl-7">
                        {TIMEFRAMES.map((tf) => {
                          const value = premDiscountSliders[tf.id]
                          const set = premDiscountIsSet(value)
                          return (
                            <span
                              key={tf.id}
                              title={`${tf.label}: ${value}${set ? '' : ' (fair)'}`}
                              className={`h-1.5 w-1.5 rounded-full ${
                                tf.id === chartInterval ? 'ring-1 ring-okx-lime/50' : ''
                              }`}
                              style={{
                                backgroundColor: set
                                  ? premDiscountColor(value)
                                  : 'var(--color-okx-border)',
                              }}
                            />
                          )
                        })}
                        {!complete && tally.filledWeight > 0 && (
                          <span
                            className={`ml-1 text-[10px] font-medium tabular-nums ${
                              dominant === 'long' ? 'text-up' : 'text-down'
                            }`}
                          >
                            {dominant === 'long' ? 'D' : 'P'} {tally.dominantPct}%
                          </span>
                        )}
                        {!complete && tally.filledWeight === 0 && (
                          <span className="ml-1 text-[10px] text-okx-muted">
                            {filled}/{filledTotal}
                          </span>
                        )}
                      </div>
                    )}

                    {state.enabled && !isEma && !isPrem && (
                      <div className="mt-1.5 flex items-center gap-1 pl-7">
                        {TIMEFRAMES.map((tf) => {
                          const bias = state.biases[tf.id]
                          return (
                            <span
                              key={tf.id}
                              title={`${tf.label}: ${bias ?? 'unset'}`}
                              className={`h-1.5 w-1.5 rounded-full ${
                                tf.id === chartInterval ? 'ring-1 ring-okx-lime/50' : ''
                              } ${
                                bias === 'long'
                                  ? 'bg-up'
                                  : bias === 'short'
                                    ? 'bg-down'
                                    : 'bg-okx-border'
                              }`}
                            />
                          )
                        })}
                        {!complete && tally.filledWeight > 0 && (
                          <span
                            className={`ml-1 text-[10px] font-medium tabular-nums ${
                              dominant === 'long' ? 'text-up' : 'text-down'
                            }`}
                          >
                            {dominant === 'long' ? 'L' : 'S'} {tally.dominantPct}%
                          </span>
                        )}
                        {!complete && tally.filledWeight === 0 && (
                          <span className="ml-1 text-[10px] text-okx-muted">
                            {filled}/{filledTotal}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <span
                    className={`min-w-[4.5rem] text-center text-xs font-semibold tabular-nums ${
                      state.enabled && rowScore !== null
                        ? rowScoreClass(normalizedPct)
                        : 'text-okx-muted'
                    }`}
                  >
                    {formatRowScore(
                      factor.id,
                      state.enabled,
                      rowScore,
                      points,
                      factorSyncPct[factor.id],
                      !!mainTradeBias
                    )}
                  </span>

                  <div className="flex w-10 justify-center">
                    <Toggle
                      checked={state.enabled}
                      onChange={() => onToggleEnabled(factor.id)}
                      aria-label={`Toggle ${factor.label}`}
                    />
                  </div>
                </div>

                <div
                  className="grid"
                  style={{
                    gridTemplateRows: state.enabled && state.expanded ? '1fr' : '0fr',
                    opacity: state.enabled && state.expanded ? 1 : 0,
                    transition: state.enabled ? collapseTransition : 'none',
                  }}
                >
                  <div className="overflow-hidden">
                    <div
                      className="border-t border-okx-border/60 bg-okx-elevated/50 px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isEma && emaBiases && onEmaBiasChange && onActiveEmaPeriodChange ? (
                        <EmaConfluencePanel
                          emaBiases={emaBiases}
                          activePeriod={state.activeEmaPeriod ?? '200'}
                          chartInterval={chartInterval}
                          totalPoints={points}
                          onPeriodChange={(period) => onActiveEmaPeriodChange(factor.id, period)}
                          onBiasChange={(period, tf, bias) =>
                            onEmaBiasChange(factor.id, period, tf, bias)
                          }
                        />
                      ) : isPrem &&
                        premDiscountSliders &&
                        onPremDiscountSliderChange &&
                        onActivePremDiscountTfChange ? (
                        <PremDiscountPanel
                          sliders={premDiscountSliders}
                          activeTimeframe={state.activePremDiscountTf ?? chartInterval}
                          chartInterval={chartInterval}
                          onTimeframeChange={(tf) =>
                            onActivePremDiscountTfChange(factor.id, tf)
                          }
                          onSliderChange={(tf, value) =>
                            onPremDiscountSliderChange(factor.id, tf, value)
                          }
                        />
                      ) : (
                        <>
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-okx-muted">
                              Long / Short tally
                            </p>
                            {rowScore !== null && tally.filledWeight > 0 && (
                              <span
                                className={`text-xs font-semibold tabular-nums ${rowScoreClass(normalizedPct)}`}
                              >
                                {isRDiv ? (
                                  <>
                                    {points}/{factorPointsCeiling(factor.id)} pts · {rowScore}% / {rDivMax}% · L{' '}
                                    {tally.longPct}% S {tally.shortPct}%
                                  </>
                                ) : pointsCeiling !== null ? (
                                  <>
                                    {points}/{pointsCeiling} pts · {rowScore}% · L {tally.longPct}% · S{' '}
                                    {tally.shortPct}%
                                  </>
                                ) : (
                                  <>
                                    {rowScore}% · L {tally.longPct}% · S {tally.shortPct}%
                                  </>
                                )}
                              </span>
                            )}
                          </div>
                          <TimeframeBiasGrid
                            factorId={factor.id}
                            biases={state.biases}
                            tally={tally}
                            chartInterval={chartInterval}
                            onBiasChange={(tf, bias) => onBiasChange(factor.id, tf, bias)}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
