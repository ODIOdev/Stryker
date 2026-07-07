import { motion } from 'framer-motion'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'

const stats = [
  {
    id: 'setups',
    label: 'Setups',
    value: '24',
    sub: 'This month',
    icon: Zap,
    valueClass: 'text-okx-violet',
    iconClass: 'text-okx-violet',
    accentClass: 'bg-gradient-to-br from-okx-violet/16 via-okx-violet/6 to-transparent',
    iconBezelClass: 'bg-okx-violet/12 ring-1 ring-inset ring-okx-violet/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  },
  {
    id: 'winrate',
    label: 'Win rate',
    value: '68.5%',
    sub: 'Last 30 trades',
    icon: Target,
    valueClass: 'text-okx-cyan',
    iconClass: 'text-okx-cyan',
    accentClass: 'bg-gradient-to-br from-okx-cyan/16 via-okx-cyan/6 to-transparent',
    iconBezelClass: 'bg-okx-cyan/12 ring-1 ring-inset ring-okx-cyan/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  },
  {
    id: 'pnl',
    label: 'Total P&L',
    value: '$18,450',
    sub: 'USD · realized',
    icon: TrendingUp,
    valueClass: 'text-okx-amber',
    iconClass: 'text-okx-amber',
    accentClass: 'bg-gradient-to-br from-okx-amber/16 via-okx-amber/6 to-transparent',
    iconBezelClass: 'bg-okx-amber/12 ring-1 ring-inset ring-okx-amber/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  },
  {
    id: 'rr',
    label: 'Avg win / loss',
    value: '2.3 R',
    sub: 'Risk-reward',
    icon: BarChart3,
    valueClass: 'text-okx-text',
    iconClass: 'text-okx-subtle',
    accentClass: 'bg-gradient-to-br from-white/10 via-white/4 to-transparent',
    iconBezelClass: 'bg-white/6 ring-1 ring-inset ring-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]',
  },
  {
    id: 'last',
    label: 'Last trade',
    value: '+$1,200',
    sub: 'Closed · profit',
    icon: Activity,
    valueClass: 'text-okx-teal',
    iconClass: 'text-okx-teal',
    accentClass: 'bg-gradient-to-br from-okx-teal/16 via-okx-teal/6 to-transparent',
    iconBezelClass: 'bg-okx-teal/12 ring-1 ring-inset ring-okx-teal/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  },
  {
    id: 'streak',
    label: 'Win streak',
    value: '5W',
    sub: 'Personal best',
    icon: ArrowUpRight,
    valueClass: 'text-okx-rose',
    iconClass: 'text-okx-rose',
    accentClass: 'bg-gradient-to-br from-okx-rose/16 via-okx-rose/6 to-transparent',
    iconBezelClass: 'bg-okx-rose/12 ring-1 ring-inset ring-okx-rose/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
  },
]

interface StatCardsRowProps {
  className?: string
}

export function StatCardsRow({ className = '' }: StatCardsRowProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6 ${className}`}>
      {stats.map((s, i) => (
        <div key={s.id} className="stat-glass-card-wrap">
          <div aria-hidden className="stat-glass-card__glow" />
          <motion.article
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="stat-glass-card p-3.5 sm:p-4"
          >
            <div aria-hidden className={`stat-glass-card__accent ${s.accentClass}`} />
            <div aria-hidden className="stat-glass-card__pattern" />
            <div aria-hidden className="stat-glass-card__bezel" />

            <div className="stat-glass-card__content">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium tracking-wide text-okx-muted">{s.label}</span>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${s.iconBezelClass}`}
                >
                  <s.icon className={`h-3.5 w-3.5 ${s.iconClass}`} />
                </div>
              </div>
              <p
                className={`mt-2.5 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl ${s.valueClass}`}
              >
                {s.value}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-okx-muted sm:text-xs">{s.sub}</p>
            </div>
          </motion.article>
        </div>
      ))}
    </div>
  )
}
