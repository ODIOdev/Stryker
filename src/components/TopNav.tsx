import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Settings,
  Shield,
  User,
  Zap,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const NAV = ['Scoreboard', 'Markets', 'Trade', 'Portfolio']

export const DASHBOARD_VIEWS = ['Chart', 'Scoreboard', 'Performance', 'Journal'] as const
export type DashboardView = (typeof DASHBOARD_VIEWS)[number]

interface TopNavProps {
  activeView: DashboardView
  onViewChange: (view: DashboardView) => void
  user?: SupabaseUser | null
  isMasterAdmin?: boolean
  onSignOut?: () => void
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
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
  useClickOutside(ref, () => setOpen(false))

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

function SettingsNavDropdown({
  user,
  isMasterAdmin,
  onSignOut,
  onViewChange,
  compact,
}: {
  user?: SupabaseUser | null
  isMasterAdmin?: boolean
  onSignOut?: () => void
  onViewChange: (view: DashboardView) => void
  compact?: boolean
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const update = () => {
      const el = triggerRef.current
      if (!el) return
      const box = el.getBoundingClientRect()
      const menuWidth = 220
      setRect({
        top: box.bottom + 6,
        left: Math.max(8, box.right - menuWidth),
        width: menuWidth,
      })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const close = () => setOpen(false)

  const menu =
    open && rect
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[9999] overflow-hidden rounded-xl border border-okx-border bg-okx-card py-1 shadow-2xl"
            style={{ top: rect.top, left: rect.left, width: rect.width }}
          >
            {user ? (
              <div className="border-b border-okx-border/80 px-3.5 py-2.5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-okx-muted">
                  Signed in
                </p>
                <p className="mt-0.5 truncate text-sm text-okx-text">{user.email}</p>
              </div>
            ) : null}

            {!user && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  navigate('/')
                  close()
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-okx-subtle hover:bg-okx-hover hover:text-okx-text"
              >
                <User className="h-4 w-4 shrink-0 text-okx-muted" />
                Sign in
              </button>
            )}

            {user && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onSignOut?.()
                  close()
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-okx-subtle hover:bg-okx-hover hover:text-okx-text"
              >
                <LogOut className="h-4 w-4 shrink-0 text-okx-muted" />
                Sign out
              </button>
            )}

            {isMasterAdmin && (
              <Link
                to="/admin"
                role="menuitem"
                onClick={close}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-okx-lime hover:bg-okx-lime/10"
              >
                <Shield className="h-4 w-4 shrink-0" />
                Admin panel
              </Link>
            )}

            <div className="my-1 border-t border-okx-border/80" />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onViewChange('Performance')
                close()
              }}
              className="flex w-full px-3.5 py-2 text-left text-sm text-okx-subtle hover:bg-okx-hover hover:text-okx-text"
            >
              Performance
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onViewChange('Journal')
                close()
              }}
              className="flex w-full px-3.5 py-2 text-left text-sm text-okx-subtle hover:bg-okx-hover hover:text-okx-text"
            >
              Journal
            </button>

            <div className="my-1 border-t border-okx-border/80" />

            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-okx-muted hover:bg-okx-hover hover:text-okx-subtle"
            >
              <Bell className="h-4 w-4 shrink-0" />
              Notifications
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-okx-muted hover:bg-okx-hover hover:text-okx-subtle"
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              Help &amp; support
            </button>
          </div>,
          document.body
        )
      : null

  return (
    <div ref={triggerRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-0.5 rounded-lg transition-colors ${
          compact
            ? 'h-9 w-9 justify-center text-okx-muted hover:bg-okx-card hover:text-okx-text'
            : `px-3 py-2 text-sm ${
                open
                  ? 'bg-okx-card text-okx-text'
                  : 'text-okx-subtle hover:bg-okx-card hover:text-okx-text'
              }`
        }`}
        aria-label={compact ? 'Settings' : undefined}
      >
        <Settings className={compact ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
        {!compact && (
          <>
            <span>Settings</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-okx-muted transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>
      {menu}
    </div>
  )
}

export function TopNav({
  activeView,
  onViewChange,
  user,
  isMasterAdmin,
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

        <Link to="/dashboard" className="flex shrink-0 items-center gap-2">
          <Zap className="h-6 w-6 text-okx-lime" fill="currentColor" strokeWidth={0} />
          <span className="hidden text-base font-semibold sm:inline">
            Trade <span className="text-okx-lime">Stryke</span>
          </span>
        </Link>

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
          <SettingsNavDropdown
            user={user}
            isMasterAdmin={isMasterAdmin}
            onSignOut={onSignOut}
            onViewChange={onViewChange}
          />
        </nav>

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="lg:hidden">
            <SettingsNavDropdown
              user={user}
              isMasterAdmin={isMasterAdmin}
              onSignOut={onSignOut}
              onViewChange={onViewChange}
              compact
            />
          </div>

          {isMasterAdmin && (
            <Link
              to="/admin"
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-okx-lime/25 bg-okx-lime/10 px-2.5 text-okx-lime transition-colors hover:bg-okx-lime/15 lg:px-3"
              aria-label="Admin panel"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden text-sm font-medium lg:inline">Admin</span>
            </Link>
          )}

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
            <Link
              to="/"
              className="shrink-0 rounded-full bg-okx-lime px-3.5 py-2 text-xs font-semibold text-black hover:bg-okx-lime-dim sm:px-4"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
