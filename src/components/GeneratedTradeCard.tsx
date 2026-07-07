import { useState } from 'react'
import type { GeneratedTrade } from '../hooks/useGeneratedTrades'

interface GeneratedTradeCardProps {
  trade: GeneratedTrade
}

function formatPrice(price: number, symbol: string): string {
  if (symbol.includes('EUR') || price < 10) {
    return price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  }
  if (price > 1000) {
    return price.toLocaleString(undefined, { maximumFractionDigits: 0 })
  }
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatTime(ts: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(ts))
}

const biasStyles = {
  long: 'bg-up/15 text-up border-up/30',
  short: 'bg-down/15 text-down border-down/30',
  neutral: 'bg-okx-elevated text-okx-muted border-okx-border',
}

export function GeneratedTradeCard({ trade }: GeneratedTradeCardProps) {
  const [logoFailed, setLogoFailed] = useState(false)
  const code = trade.tickerSymbol.split('/')[0]

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-okx-border/80 bg-okx-card shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-okx-border hover:bg-okx-elevated/80">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: trade.ratingColor, opacity: 0.85 }}
      />

      <div className="relative flex items-start justify-between gap-2 p-3.5 pb-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-okx-elevated ring-1 ring-okx-border/80">
            {!logoFailed ? (
              <img
                src={trade.logoUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-okx-violet">
                {code.slice(0, 2)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-okx-text">{trade.tickerName}</p>
            <p className="truncate text-[11px] text-okx-muted">{trade.tickerSymbol}</p>
          </div>
        </div>
        <span
          className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold tabular-nums"
          style={{
            color: trade.ratingColor,
            borderColor: `${trade.ratingColor}55`,
            backgroundColor: `${trade.ratingColor}18`,
          }}
        >
          {trade.grade}
        </span>
      </div>

      <div className="relative px-3.5 pb-2">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-okx-muted">
              Setup score
            </p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-okx-text">
              {trade.score.toLocaleString()}
              <span className="text-sm font-normal text-okx-muted">
                {' '}
                / {trade.maxScore.toLocaleString()}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-okx-muted">Entry</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-okx-text">
              ${formatPrice(trade.entryPrice, trade.tickerSymbol)}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-auto border-t border-okx-border/60 px-3.5 py-2.5">
        <div className="mb-2 h-1 overflow-hidden rounded-full bg-okx-elevated">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, trade.qualityPercent)}%`,
              backgroundColor: trade.ratingColor,
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-2 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-okx-elevated px-2 py-0.5 font-medium text-okx-subtle">
              {trade.timeframe}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 font-semibold uppercase ${biasStyles[trade.bias]}`}
            >
              {trade.bias === 'neutral' ? 'Mix' : trade.bias}
            </span>
          </div>
          <span className="truncate text-okx-muted">{formatTime(trade.createdAt)}</span>
        </div>
      </div>
    </article>
  )
}
