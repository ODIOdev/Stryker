import { useState } from 'react'
import { Zap } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export type AuthMode = 'signin' | 'signup'

interface AuthCardProps {
  initialMode?: AuthMode
  onSuccess?: () => void
  showHeader?: boolean
}

export function AuthCard({ initialMode = 'signin', onSuccess, showHeader = true }: AuthCardProps) {
  const { signIn, signUp, isConfigured } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password, displayName || undefined)
        setMessage('Account created — you are signed in.')
        setTimeout(() => onSuccess?.(), 600)
      } else {
        await signIn(email, password)
        onSuccess?.()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-okx-border bg-okx-card shadow-2xl">
      {showHeader && (
        <div className="border-b border-okx-border/80 bg-okx-bg/60 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-okx-lime/15">
              <Zap className="h-5 w-5 text-okx-lime" fill="currentColor" strokeWidth={0} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Sign in</h2>
              <p className="text-xs text-okx-muted">Save setups, trades &amp; stats</p>
            </div>
          </div>

          <div className="mt-5 flex rounded-xl bg-okx-elevated p-1">
            {(['signin', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchMode(tab)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  mode === tab
                    ? 'bg-okx-card text-okx-text shadow-sm'
                    : 'text-okx-muted hover:text-okx-subtle'
                }`}
              >
                {tab === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-6">
        {!showHeader && (
          <div className="mb-5 flex rounded-xl bg-okx-elevated p-1">
            {(['signin', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchMode(tab)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  mode === tab
                    ? 'bg-okx-card text-okx-text shadow-sm'
                    : 'text-okx-muted hover:text-okx-subtle'
                }`}
              >
                {tab === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>
        )}

        {!isConfigured && (
          <p className="mb-4 rounded-lg border border-okx-amber/30 bg-okx-amber/10 px-3 py-2 text-sm text-okx-amber">
            Auth is not configured on this deployment.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <label className="block">
              <span className="text-xs font-medium text-okx-muted">Display name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-okx-border bg-okx-bg px-3 py-2.5 text-sm outline-none focus:border-okx-lime"
                placeholder="Trader name"
              />
            </label>
          )}
          <label className="block">
            <span className="text-xs font-medium text-okx-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-okx-border bg-okx-bg px-3 py-2.5 text-sm outline-none focus:border-okx-lime"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-okx-muted">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-okx-border bg-okx-bg px-3 py-2.5 text-sm outline-none focus:border-okx-lime"
              placeholder="••••••••"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </label>

          {error && (
            <p className="rounded-lg border border-down/30 bg-down/10 px-3 py-2 text-sm text-down">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-lg border border-okx-lime/30 bg-okx-lime/10 px-3 py-2 text-sm text-okx-lime">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !isConfigured}
            className="w-full rounded-full bg-okx-lime py-3 text-sm font-semibold text-black hover:bg-okx-lime-dim disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
