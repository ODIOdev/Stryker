import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export type AuthMode = 'signin' | 'signup'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  initialMode?: AuthMode
}

export function AuthModal({ open, onClose, initialMode = 'signin' }: AuthModalProps) {
  const { signIn, signUp, isConfigured } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) setMode(initialMode)
  }, [open, initialMode])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

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
        setTimeout(onClose, 800)
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

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-okx-border bg-okx-card shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-okx-border/80 bg-okx-bg/60 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-okx-lime/15">
                    <Zap className="h-5 w-5 text-okx-lime" fill="currentColor" strokeWidth={0} />
                  </div>
                  <div>
                    <h2 id="auth-modal-title" className="text-lg font-semibold">
                      Trade Stryke
                    </h2>
                    <p className="text-xs text-okx-muted">Save setups, trades &amp; stats</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-okx-muted hover:bg-okx-hover hover:text-okx-text"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
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

            <div className="p-6">
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
