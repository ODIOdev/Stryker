import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isMasterAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-backdrop flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-okx-lime border-t-transparent" />
      </div>
    )
  }

  if (!user || !isMasterAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
