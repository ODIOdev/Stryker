import { motion } from 'framer-motion'
import { DottedRow } from './ui/DottedRow'

const performanceRows = [
  { label: 'Setups logged', value: '24', highlight: true, tone: 'violet' as const },
  { label: 'Win rate', value: '68.5%', highlight: true, tone: 'cyan' as const },
  { label: 'Total P&L', value: '$18,450.00', highlight: true, tone: 'amber' as const },
  { label: 'Avg win / loss', value: '2.3 R/R', highlight: false, tone: 'none' as const },
  { label: 'Last trade', value: '+$1,200', highlight: true, tone: 'teal' as const },
  { label: 'Best streak', value: '5 wins', highlight: true, tone: 'rose' as const },
]

const quickStats = [
  { label: 'Setups', value: '24', sub: 'This month', color: 'text-okx-violet' },
  { label: 'Win rate', value: '68.5%', sub: '30 trades', color: 'text-okx-cyan' },
  { label: 'P&L', value: '$18.4K', sub: 'Realized', color: 'text-okx-amber' },
]

export function StatsWidgets() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="rounded-2xl bg-okx-card p-6">
        <h3 className="text-lg font-semibold text-okx-text">Performance</h3>
        <p className="mt-1 text-sm text-okx-muted">Your trading stats at a glance</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {quickStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-okx-elevated p-4"
            >
              <p className="text-xs text-okx-muted">{s.label}</p>
              <p className={`mt-2 text-2xl font-semibold tabular-nums ${s.color}`}>
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-okx-muted">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 space-y-1">
          {performanceRows.map((row) => (
            <DottedRow
              key={row.label}
              label={row.label}
              value={row.value}
              highlight={row.highlight}
              tone={row.tone}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-okx-card p-6">
        <h3 className="text-sm font-medium text-okx-text">About Trade Stryke</h3>
        <p className="mt-3 text-sm leading-relaxed text-okx-muted">
          Score your setups with weighted confluences, grade trades A/B/C, and track
          performance — all in one minimalist workspace.
        </p>
        <div className="mt-6 space-y-2">
          {['Strategy docs', 'Risk calculator', 'Trade journal'].map((link) => (
            <a
              key={link}
              href="#"
              className="flex items-center justify-between rounded-xl border border-okx-border px-4 py-3 text-sm text-okx-subtle transition-colors hover:border-okx-muted/50 hover:bg-okx-hover hover:text-okx-text"
            >
              {link}
              <span className="text-okx-muted">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
