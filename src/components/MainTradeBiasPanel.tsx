import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { TradeBias } from '../lib/confluenceScoring'
import { scoreAccentColor } from '../lib/scoreColor'

const QSC_INFO =
  'Q = how good, S = how agreed, C = how reliable — the strip is your at-a-glance "should I trust this trade?" breakdown next to the bias read.'

function QscInfoButton({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const btnClass =
    size === 'md'
      ? 'flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-okx-border/80 bg-okx-elevated text-[10px] font-bold leading-none text-okx-muted transition-colors hover:border-okx-muted/80 hover:text-okx-text'
      : 'flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-okx-border/80 bg-okx-elevated text-[9px] font-bold leading-none text-okx-muted transition-colors hover:border-okx-muted/80 hover:text-okx-text'

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={btnClass}
        aria-label="What do Q, S, and C mean?"
        aria-expanded={open}
      >
        ?
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute right-0 bottom-full z-50 mb-1.5 w-56 rounded-lg border border-okx-border bg-okx-card px-2.5 py-2 text-[10px] leading-snug text-okx-subtle shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:w-64"
        >
          {QSC_INFO}
        </div>
      )}
    </div>
  )
}

const OPTIONS: { value: TradeBias; label: string; activeClass: string; idleClass: string }[] = [
  {
    value: 'long',
    label: 'Long',
    activeClass: 'bg-up text-black',
    idleClass: 'bg-up/8 text-up/35',
  },
  {
    value: 'short',
    label: 'Short',
    activeClass: 'bg-down text-white',
    idleClass: 'bg-down/8 text-down/35',
  },
  {
    value: 'range',
    label: 'Range',
    activeClass: 'bg-okx-amber text-black',
    idleClass: 'bg-okx-amber/8 text-okx-amber/35',
  },
]

interface MainTradeBiasPanelProps {
  bias: TradeBias | null
  qualityPct: number
  syncPct: number
  confidencePct: number
  alignedCount: number
  activeCount: number
  layout?: 'card' | 'strip'
}

function MetricBar({
  label,
  value,
  size = 'sm',
}: {
  label: string
  value: number
  size?: 'sm' | 'md'
}) {
  if (size === 'md') {
    return (
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="w-3 shrink-0 text-[10px] font-bold text-okx-muted">{label}</span>
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-okx-border/60">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: scoreAccentColor(value) }}
            initial={false}
            animate={{ width: `${value}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          />
        </div>
        <span className="w-7 shrink-0 text-right text-[10px] tabular-nums text-okx-muted">
          {value}%
        </span>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <span className="w-2 shrink-0 text-[8px] font-bold text-okx-muted">{label}</span>
      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-okx-border/60">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: scoreAccentColor(value) }}
          initial={false}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        />
      </div>
      <span className="w-5 shrink-0 text-right text-[8px] tabular-nums text-okx-muted">
        {value}%
      </span>
    </div>
  )
}

export function MainTradeBiasPanel({
  bias,
  qualityPct,
  syncPct,
  confidencePct,
  alignedCount,
  activeCount,
  layout = 'card',
}: MainTradeBiasPanelProps) {
  const statusLabel =
    bias === 'long' ? 'Long' : bias === 'short' ? 'Short' : bias === 'range' ? 'Range' : 'Not active'

  const statusClass =
    bias === 'long'
      ? 'text-up'
      : bias === 'short'
        ? 'text-down'
        : bias === 'range'
          ? 'text-okx-amber'
          : 'text-okx-muted'

  if (layout === 'strip') {
    return (
      <div className="flex w-full min-w-0 items-center gap-3 rounded-lg border border-okx-border/80 bg-okx-elevated/40 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        <div className="shrink-0 border-r border-okx-border/50 pr-3 sm:pr-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-okx-muted">Bias</p>
          <motion.p
            key={statusLabel}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            className={`text-[13px] font-bold uppercase tracking-wide sm:text-sm ${statusClass}`}
          >
            {statusLabel}
          </motion.p>
        </div>

        <div className="flex shrink-0 gap-1" aria-label="Trade bias indicators">
          {OPTIONS.map((opt) => {
            const active = bias === opt.value
            return (
              <div
                key={opt.value}
                className={`rounded px-2 py-1 text-center text-[9px] font-bold uppercase sm:text-[10px] ${
                  active ? opt.activeClass : opt.idleClass
                }`}
                aria-current={active ? 'true' : undefined}
              >
                {opt.label.charAt(0)}
              </div>
            )
          })}
        </div>

        {bias && activeCount > 0 && (
          <span className="hidden shrink-0 text-[10px] tabular-nums text-okx-muted sm:inline">
            {alignedCount}/{activeCount}
          </span>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <MetricBar label="Q" value={qualityPct} size="md" />
          <MetricBar label="S" value={bias ? syncPct : 0} size="md" />
          <MetricBar label="C" value={confidencePct} size="md" />
          <QscInfoButton size="md" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-[148px] shrink-0 flex-col justify-center gap-2 rounded-xl border border-okx-border/80 bg-okx-elevated/40 px-3 py-2.5">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-okx-muted">Bias</p>
        <motion.p
          key={statusLabel}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          className={`text-sm font-bold uppercase tracking-wide ${statusClass}`}
        >
          {statusLabel}
        </motion.p>
      </div>

      <div className="flex flex-col gap-1" aria-label="Trade bias indicators">
        {OPTIONS.map((opt) => {
          const active = bias === opt.value
          return (
            <div
              key={opt.value}
              className={`rounded px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wide transition-all ${
                active ? opt.activeClass : opt.idleClass
              }`}
              aria-current={active ? 'true' : undefined}
            >
              {opt.label}
            </div>
          )
        })}
      </div>

      {bias && activeCount > 0 && (
        <p className="text-[9px] tabular-nums leading-snug text-okx-muted">
          {alignedCount}/{activeCount} aligned
        </p>
      )}

      <div className="flex flex-col gap-0.5 border-t border-okx-border/50 pt-1.5">
        <div className="mb-0.5 flex items-center justify-between gap-1">
          <span className="text-[9px] font-medium uppercase tracking-wider text-okx-muted">
            Q · S · C
          </span>
          <QscInfoButton />
        </div>
        <MetricBar label="Q" value={qualityPct} />
        <MetricBar label="S" value={bias ? syncPct : 0} />
        <MetricBar label="C" value={confidencePct} />
      </div>
    </div>
  )
}
