import { useState } from 'react'
import { Zap } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export type AuthMode = 'signin' | 'signup'
export type OAuthProvider = 'google' | 'apple'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

const OAUTH_PROVIDERS = [
  {
    id: 'google' as const,
    label: 'Continue with Google',
    icon: GoogleIcon,
    iconClass: 'h-5 w-5',
    button:
      'border-okx-border/90 bg-okx-elevated/40 hover:border-okx-subtle/30 hover:bg-okx-elevated',
  },
  {
    id: 'apple' as const,
    label: 'Continue with Apple',
    icon: AppleIcon,
    iconClass: 'h-5 w-5 text-okx-text',
    button:
      'border-okx-border/90 bg-okx-bg hover:border-okx-subtle/30 hover:bg-okx-elevated/80',
  },
] as const

interface OAuthButtonProps {
  label: string
  icon: typeof GoogleIcon
  iconClass: string
  buttonClass: string
  disabled: boolean
  onClick: () => void
}

function OAuthButton({
  label,
  icon: Icon,
  iconClass,
  buttonClass,
  disabled,
  onClick,
}: OAuthButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group flex w-full items-center justify-center gap-2.5 rounded-lg border px-3 py-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-okx-lime/40 disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`}
    >
      <Icon className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconClass}`} />
      <span className="text-sm font-medium text-okx-text">{label}</span>
    </button>
  )
}

interface AuthCardProps {
  initialMode?: AuthMode
  onSuccess?: () => void
  showHeader?: boolean
}

export function AuthCard({ initialMode = 'signin', onSuccess, showHeader = true }: AuthCardProps) {
  const { signIn, signUp, signInWithOAuth, isConfigured } = useAuth()
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

  const handleOAuth = async (provider: OAuthProvider) => {
    setError(null)
    setMessage(null)
    setBusy(true)
    try {
      await signInWithOAuth(provider)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth sign-in failed')
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

        <div className="my-6 flex items-center gap-3">
          <div
            className="h-px flex-1 bg-gradient-to-r from-transparent via-okx-border to-transparent"
            aria-hidden
          />
          <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-okx-muted">
            or
          </span>
          <div
            className="h-px flex-1 bg-gradient-to-r from-transparent via-okx-border to-transparent"
            aria-hidden
          />
        </div>

        <div className="space-y-2">
          {OAUTH_PROVIDERS.map(({ id, label, icon, iconClass, button }) => (
            <OAuthButton
              key={id}
              label={label}
              icon={icon}
              iconClass={iconClass}
              buttonClass={button}
              disabled={busy || !isConfigured}
              onClick={() => void handleOAuth(id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
