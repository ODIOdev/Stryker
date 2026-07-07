import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { hasGuestAccess } from '../lib/guestSession'

export function DashboardRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-backdrop flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-okx-lime border-t-transparent" />
      </div>
    )
  }

  if (!user && !hasGuestAccess()) {
    return <Navigate to="/" replace />
  }

  return children
}
