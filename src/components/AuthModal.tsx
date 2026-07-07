import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp, isConfigured } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password, displayName || undefined)
        setMessage('Check your email to confirm your account.')
      } else {
        await signIn(email, password)
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-okx-border bg-okx-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-okx-muted hover:bg-okx-hover hover:text-okx-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isConfigured && (
          <p className="mb-4 rounded-lg border border-okx-amber/30 bg-okx-amber/10 px-3 py-2 text-sm text-okx-amber">
            Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable member accounts.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <label className="block">
              <span className="text-xs text-okx-muted">Display name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-okx-border bg-okx-bg px-3 py-2 text-sm outline-none focus:border-okx-lime"
                placeholder="Trader name"
              />
            </label>
          )}
          <label className="block">
            <span className="text-xs text-okx-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-okx-border bg-okx-bg px-3 py-2 text-sm outline-none focus:border-okx-lime"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="text-xs text-okx-muted">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-okx-border bg-okx-bg px-3 py-2 text-sm outline-none focus:border-okx-lime"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm text-down">{error}</p>}
          {message && <p className="text-sm text-okx-lime">{message}</p>}

          <button
            type="submit"
            disabled={busy || !isConfigured}
            className="w-full rounded-full bg-okx-lime py-2.5 text-sm font-semibold text-black hover:bg-okx-lime-dim disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-okx-muted">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setMessage(null)
            }}
            className="text-okx-lime hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
