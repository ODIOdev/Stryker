import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Cable,
  Database,
  Plug,
  Shield,
  Users,
  Zap,
} from 'lucide-react'
import { fetchAdminOverview, type AdminOverview } from '../lib/api'

const SECTIONS = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'api', label: 'API plugs', icon: Plug },
  { id: 'integrations', label: 'Third-party', icon: Cable },
] as const

type AdminSection = (typeof SECTIONS)[number]['id']

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'border-up/30 bg-up/10 text-up',
    connected: 'border-up/30 bg-up/10 text-up',
    configured: 'border-okx-cyan/30 bg-okx-cyan/10 text-okx-cyan',
    not_configured: 'border-okx-muted/30 bg-okx-elevated text-okx-muted',
    needs_setup: 'border-okx-amber/30 bg-okx-amber/10 text-okx-amber',
  }

  const label = status.replace(/_/g, ' ')

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${styles[status] ?? styles.not_configured}`}
    >
      {label}
    </span>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function AdminPage() {
  const [section, setSection] = useState<AdminSection>('users')
  const [data, setData] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Admin — Trade Stryke'
    return () => {
      document.title = 'Trade Stryke'
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchAdminOverview()
      .then((overview) => {
        if (!cancelled) setData(overview)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load admin data')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="app-backdrop flex min-h-screen items-center justify-center overflow-auto p-4 sm:p-6">
      <div className="dashboard-stage w-full max-w-6xl">
        <div className="dashboard-shell overflow-hidden rounded-2xl border border-okx-border/80">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-okx-border/80 bg-okx-bg px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-okx-muted transition-colors hover:bg-okx-card hover:text-okx-text"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-okx-lime/15">
                  <Shield className="h-5 w-5 text-okx-lime" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Admin portal</h1>
                  <p className="text-xs text-okx-muted">Website controls &amp; platform overview</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-okx-lime/25 bg-okx-lime/10 px-3 py-1 text-xs font-medium text-okx-lime">
              <Zap className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
              Master admin
            </div>
          </header>

          <div className="grid min-h-[560px] lg:grid-cols-[220px_1fr]">
            <nav className="border-b border-okx-border/80 bg-okx-bg/60 p-3 lg:border-r lg:border-b-0">
              <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                {SECTIONS.map(({ id, label, icon: Icon }) => (
                  <li key={id} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => setSection(id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        section === id
                          ? 'bg-okx-lime/10 text-okx-lime'
                          : 'text-okx-subtle hover:bg-okx-card hover:text-okx-text'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <main className="bg-okx-card/30 p-4 sm:p-6">
              {loading && (
                <div className="flex h-48 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-okx-lime border-t-transparent" />
                </div>
              )}

              {!loading && error && (
                <div className="rounded-xl border border-down/30 bg-down/10 px-4 py-3 text-sm text-down">
                  {error}
                </div>
              )}

              {!loading && !error && data && section === 'users' && (
                <section>
                  <h2 className="text-base font-semibold">Users</h2>
                  <p className="mt-1 text-sm text-okx-muted">
                    Registered accounts and roles across the platform.
                  </p>
                  <div className="mt-4 overflow-x-auto rounded-xl border border-okx-border">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead className="border-b border-okx-border bg-okx-elevated/60 text-xs uppercase tracking-wide text-okx-muted">
                        <tr>
                          <th className="px-4 py-3 font-medium">Email</th>
                          <th className="px-4 py-3 font-medium">Display name</th>
                          <th className="px-4 py-3 font-medium">Role</th>
                          <th className="px-4 py-3 font-medium">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.users.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-okx-border/60 last:border-0 hover:bg-okx-elevated/40"
                          >
                            <td className="px-4 py-3 text-okx-text">{user.email ?? '—'}</td>
                            <td className="px-4 py-3 text-okx-subtle">{user.display_name ?? '—'}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  user.role === 'master_admin'
                                    ? 'bg-okx-lime/15 text-okx-lime'
                                    : 'bg-okx-elevated text-okx-muted'
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-okx-muted">{formatDate(user.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {!loading && !error && data && section === 'data' && (
                <section>
                  <h2 className="text-base font-semibold">Data</h2>
                  <p className="mt-1 text-sm text-okx-muted">
                    Database footprint and stored trading activity.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      { label: 'Users', value: data.counts.users },
                      { label: 'Setups', value: data.counts.setups },
                      { label: 'Trades', value: data.counts.trades },
                      { label: 'Cached market bars', value: data.counts.marketBars },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-okx-border bg-okx-elevated/40 px-4 py-4"
                      >
                        <p className="text-xs font-medium uppercase tracking-wide text-okx-muted">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold tabular-nums text-okx-text">
                          {item.value.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {!loading && !error && data && section === 'api' && (
                <section>
                  <h2 className="text-base font-semibold">API plugs</h2>
                  <p className="mt-1 text-sm text-okx-muted">
                    Market data providers wired into the platform API layer.
                  </p>
                  <ul className="mt-4 space-y-3">
                    {data.apiPlugs.map((plug) => (
                      <li
                        key={plug.id}
                        className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-okx-border bg-okx-elevated/40 px-4 py-4"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-okx-text">{plug.name}</p>
                          <p className="mt-1 text-sm text-okx-muted">{plug.description}</p>
                        </div>
                        <StatusBadge status={plug.status} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {!loading && !error && data && section === 'integrations' && (
                <section>
                  <h2 className="text-base font-semibold">Third-party integrations</h2>
                  <p className="mt-1 text-sm text-okx-muted">
                    Auth, hosting, and external services connected to Trade Stryke.
                  </p>
                  <ul className="mt-4 space-y-3">
                    {data.integrations.map((integration) => (
                      <li
                        key={integration.id}
                        className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-okx-border bg-okx-elevated/40 px-4 py-4"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-okx-text">{integration.name}</p>
                          <p className="mt-1 text-sm text-okx-muted">{integration.description}</p>
                        </div>
                        <StatusBadge status={integration.status} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
