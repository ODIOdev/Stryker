import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, LogOut, Menu, Search, Zap } from 'lucide-react'
import { TickerSearch } from './TickerSearch'
import type { Ticker } from '../data/tickers'
import type { User } from '@supabase/supabase-js'

const NAV = ['Scoreboard', 'Markets', 'Trade', 'Portfolio']

export const DASHBOARD_VIEWS = ['Chart', 'Scoreboard', 'Performance', 'Journal'] as const
export type DashboardView = (typeof DASHBOARD_VIEWS)[number]

interface TopNavProps {
  ticker: Ticker
  onTickerSelect: (t: Ticker) => void
  activeView: DashboardView
  onViewChange: (view: DashboardView) => void
  user?: User | null
  onSignInClick?: () => void
  onSignOut?: () => void
}

function ScoreboardNavDropdown({
  activeView,
  onViewChange,
}: {
  activeView: DashboardView
  onViewChange: (view: DashboardView) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-0.5 rounded-lg px-3 py-2 text-sm transition-colors ${
          open
            ? 'bg-okx-card text-okx-text'
            : 'text-okx-subtle hover:bg-okx-card hover:text-okx-text'
        }`}
      >
        {activeView}
        <ChevronDown
          className={`h-3.5 w-3.5 text-okx-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 z-50 mt-1.5 min-w-[168px] overflow-hidden rounded-xl border border-okx-border bg-okx-card py-1 shadow-2xl"
        >
          {DASHBOARD_VIEWS.map((view) => (
            <button
              key={view}
              type="button"
              role="menuitem"
              onClick={() => {
                onViewChange(view)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-sm transition-colors ${
                activeView === view
                  ? 'bg-okx-lime/10 text-okx-lime'
                  : 'text-okx-subtle hover:bg-okx-hover hover:text-okx-text'
              }`}
            >
              {view}
              {activeView === view && (
                <span className="h-1.5 w-1.5 rounded-full bg-okx-lime" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function TopNav({
  ticker,
  onTickerSelect,
  activeView,
  onViewChange,
  user,
  onSignInClick,
  onSignOut,
}: TopNavProps) {
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'TS'

  return (
    <header className="shrink-0 overflow-hidden border-b border-okx-border/80 bg-okx-bg">
      <div className="flex w-full min-w-0 items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-okx-muted hover:bg-okx-card lg:hidden"
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

        <nav className="hidden shrink-0 items-center gap-1 lg:flex">
          {NAV.map((item) =>
            item === 'Scoreboard' ? (
              <ScoreboardNavDropdown
                key={item}
                activeView={activeView}
                onViewChange={onViewChange}
              />
            ) : (
              <button
                key={item}
                type="button"
                className="flex items-center gap-0.5 rounded-lg px-3 py-2 text-sm text-okx-subtle transition-colors hover:bg-okx-card hover:text-okx-text"
              >
                {item}
                <ChevronDown className="h-3.5 w-3.5 text-okx-muted" />
              </button>
            )
          )}
        </nav>

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden w-[min(200px,22vw)] sm:block lg:w-[220px]">
            <TickerSearch ticker={ticker} onSelect={onTickerSelect} compact />
          </div>

          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-okx-muted hover:bg-okx-card sm:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-okx-muted transition-colors hover:bg-okx-card hover:text-okx-text"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          {user ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={onSignOut}
                className="hidden h-9 items-center gap-1.5 rounded-lg px-2 text-xs text-okx-muted hover:bg-okx-card hover:text-okx-text md:flex"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-okx-elevated text-xs font-semibold text-okx-cyan"
                title={user.email ?? 'Account'}
              >
                {initials}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSignInClick}
              className="shrink-0 rounded-full bg-okx-lime px-3.5 py-2 text-xs font-semibold text-black hover:bg-okx-lime-dim sm:px-4"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
