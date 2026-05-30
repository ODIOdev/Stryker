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
  },
  {
    id: 'winrate',
    label: 'Win rate',
    value: '68.5%',
    sub: 'Last 30 trades',
    icon: Target,
    valueClass: 'text-okx-cyan',
    iconClass: 'text-okx-cyan',
  },
  {
    id: 'pnl',
    label: 'Total P&L',
    value: '$18,450',
    sub: 'USD · realized',
    icon: TrendingUp,
    valueClass: 'text-okx-amber',
    iconClass: 'text-okx-amber',
  },
  {
    id: 'rr',
    label: 'Avg win / loss',
    value: '2.3 R',
    sub: 'Risk-reward',
    icon: BarChart3,
    valueClass: 'text-okx-text',
    iconClass: 'text-okx-subtle',
  },
  {
    id: 'last',
    label: 'Last trade',
    value: '+$1,200',
    sub: 'Closed · profit',
    icon: Activity,
    valueClass: 'text-okx-teal',
    iconClass: 'text-okx-teal',
  },
  {
    id: 'streak',
    label: 'Win streak',
    value: '5W',
    sub: 'Personal best',
    icon: ArrowUpRight,
    valueClass: 'text-okx-rose',
    iconClass: 'text-okx-rose',
  },
]

export function StatCardsRow() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {stats.map((s, i) => (
        <motion.article
          key={s.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="rounded-2xl bg-okx-card p-3.5 transition-colors hover:bg-okx-elevated sm:p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-okx-muted">{s.label}</span>
            <s.icon className={`h-3.5 w-3.5 shrink-0 opacity-80 ${s.iconClass}`} />
          </div>
          <p className={`mt-2 text-xl font-semibold tabular-nums tracking-tight sm:text-2xl ${s.valueClass}`}>
            {s.value}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-okx-muted sm:text-xs">{s.sub}</p>
        </motion.article>
      ))}
    </div>
  )
}
