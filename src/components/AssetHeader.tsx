import type { Ticker } from '../data/tickers'
import { TickerSearch } from './TickerSearch'

interface AssetHeaderProps {
  ticker: Ticker
  onTickerSelect: (t: Ticker) => void
}

export function AssetHeader({ ticker, onTickerSelect }: AssetHeaderProps) {
  const code = ticker.symbol.split('/')[0]

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-okx-elevated text-sm font-bold text-okx-violet">
          {code.slice(0, 2)}
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {ticker.name}{' '}
            <span className="font-normal text-okx-muted">{code}</span>
          </h1>
        </div>
      </div>
      <div className="w-full max-w-xs sm:hidden">
        <TickerSearch ticker={ticker} onSelect={onTickerSelect} />
      </div>
    </div>
  )
}
