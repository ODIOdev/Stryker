import { useCallback, useEffect, useState } from 'react'
import { fetchUserStats, type UserStats } from '../lib/api'

const DEFAULT_STATS: UserStats = {
  setupsThisMonth: 0,
  winRate: 0,
  totalPnl: 0,
  riskReward: 0,
  winStreak: 0,
  lastTradePnl: null,
  closedTrades: 0,
}

export function useUserStats(isAuthenticated: boolean) {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setStats(DEFAULT_STATS)
      return
    }
    setLoading(true)
    try {
      const data = await fetchUserStats()
      setStats(data)
    } catch {
      setStats(DEFAULT_STATS)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [refresh])

  return { stats, loading, refresh }
}
