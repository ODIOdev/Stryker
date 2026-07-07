import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, LineChart, Target, Zap } from 'lucide-react'
import { AuthCard } from '../components/AuthCard'
import { useAuth } from '../hooks/useAuth'
import { enableGuestAccess } from '../lib/guestSession'

const FEATURES = [
  { icon: LineChart, label: 'Live charts', desc: 'Stocks, crypto, forex & metals' },
  { icon: Target, label: 'Confluence scoring', desc: '14-factor setup analysis' },
  { icon: BarChart3, label: 'Track performance', desc: 'Setups, win rate & journal' },
]

export function SignInPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    document.title = 'Sign in — Trade Stryke'
    return () => {
      document.title = 'Trade Stryke'
    }
  }, [])

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="app-backdrop flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-okx-lime border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="app-backdrop relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="dashboard-brand-mark" aria-hidden />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center lg:text-left"
        >
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-okx-border bg-okx-card/80 px-8 py-4 backdrop-blur-sm">
            <Zap className="h-7 w-7 text-okx-lime" fill="currentColor" strokeWidth={0} />
            <span className="text-xl font-semibold tracking-wide text-okx-subtle">Trade Stryke</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Sign in to your
            <span className="block text-okx-lime">trading command center</span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-base text-okx-muted lg:mx-0 lg:text-lg">
            Real-time market data, confluence scoring, and performance tracking — all in one
            dashboard built for serious traders.
          </p>

          <ul className="mt-8 hidden space-y-4 lg:block">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <li key={label} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-okx-lime/10">
                  <Icon className="h-4 w-4 text-okx-lime" />
                </div>
                <div>
                  <p className="text-sm font-medium text-okx-text">{label}</p>
                  <p className="text-xs text-okx-muted">{desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-8 hidden text-sm text-okx-muted lg:block">
            <button
              type="button"
              onClick={() => {
                enableGuestAccess()
                navigate('/dashboard')
              }}
              className="text-okx-lime hover:underline"
            >
              Continue as guest
            </button>{' '}
            — explore the dashboard without an account
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-auto w-full max-w-md"
        >
          <AuthCard onSuccess={() => navigate('/dashboard', { replace: true })} />
          <p className="mt-4 text-center text-sm text-okx-muted lg:hidden">
            <button
              type="button"
              onClick={() => {
                enableGuestAccess()
                navigate('/dashboard')
              }}
              className="text-okx-lime hover:underline"
            >
              Continue as guest
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
