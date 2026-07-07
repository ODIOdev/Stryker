import type { Ticker } from '../data/tickers'
import { TickerSearch } from './TickerSearch'
import { AssetLogo } from './ui/AssetLogo'

interface AssetHeaderProps {
  ticker: Ticker
  onTickerSelect: (t: Ticker) => void
  showSearch?: boolean
  className?: string
}

export function AssetHeader({
  ticker,
  onTickerSelect,
  showSearch = true,
  className = '',
}: AssetHeaderProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex min-w-0 items-center gap-3">
        <AssetLogo ticker={ticker} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {ticker.name}{' '}
            <span className="font-normal text-okx-muted">{ticker.symbol.split('/')[0]}</span>
          </h1>
        </div>
      </div>
      {showSearch && (
        <div className="w-full min-w-[200px] max-w-xs sm:ml-auto sm:w-[280px]">
          <TickerSearch ticker={ticker} onSelect={onTickerSelect} compact />
        </div>
      )}
    </div>
  )
}
