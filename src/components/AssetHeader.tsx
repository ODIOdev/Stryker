import type { Ticker } from '../data/tickers'
import { TickerSearch } from './TickerSearch'
import { AssetLogo } from './ui/AssetLogo'

interface AssetHeaderProps {
  ticker: Ticker
  onTickerSelect: (t: Ticker) => void
  inline?: boolean
  className?: string
}

export function AssetHeader({
  ticker,
  onTickerSelect,
  inline = false,
  className = '',
}: AssetHeaderProps) {
  const identity = (
    <div className="flex items-center gap-3">
      <AssetLogo ticker={ticker} />
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {ticker.name}{' '}
          <span className="font-normal text-okx-muted">{ticker.symbol.split('/')[0]}</span>
        </h1>
      </div>
    </div>
  )

  if (inline) {
    return <div className={className}>{identity}</div>
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 ${className}`}>
      {identity}
      <div className="w-full max-w-xs sm:hidden">
        <TickerSearch ticker={ticker} onSelect={onTickerSelect} />
      </div>
    </div>
  )
}
