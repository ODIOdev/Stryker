import { Bell, ChevronDown, Menu, Search, Zap } from 'lucide-react'
import { TickerSearch } from './TickerSearch'
import type { Ticker } from '../data/tickers'

const NAV = ['Markets', 'Trade', 'Scoreboard', 'Portfolio']

interface TopNavProps {
  ticker: Ticker
  onTickerSelect: (t: Ticker) => void
}

export function TopNav({ ticker, onTickerSelect }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-okx-border/80 bg-okx-bg">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-okx-muted hover:bg-okx-card lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <a href="/" className="flex shrink-0 items-center gap-2">
          <Zap className="h-6 w-6 text-okx-lime" fill="currentColor" strokeWidth={0} />
          <span className="hidden text-base font-semibold sm:inline">
            Trade <span className="text-okx-lime">Stryke</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <button
              key={item}
              type="button"
              className="flex items-center gap-0.5 rounded-lg px-3 py-2 text-sm text-okx-subtle transition-colors hover:bg-okx-card hover:text-okx-text"
            >
              {item}
              <ChevronDown className="h-3.5 w-3.5 text-okx-muted" />
            </button>
          ))}
        </nav>

        <div className="ml-auto hidden max-w-[220px] flex-1 sm:block lg:max-w-[280px]">
          <TickerSearch ticker={ticker} onSelect={onTickerSelect} compact />
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-okx-muted hover:bg-okx-card sm:hidden"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-okx-muted transition-colors hover:bg-okx-card hover:text-okx-text"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-okx-elevated text-xs font-semibold text-okx-cyan"
        >
          TS
        </button>
      </div>
    </header>
  )
}
