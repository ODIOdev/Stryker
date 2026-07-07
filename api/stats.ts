import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors } from './_lib/market.js'
import { ensureProfile, getSupabaseAdmin, getUserFromRequest } from './_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getUserFromRequest(req.headers.authorization)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    await ensureProfile(user)
    const supabase = getSupabaseAdmin()

    const monthStart = new Date()
    monthStart.setUTCDate(1)
    monthStart.setUTCHours(0, 0, 0, 0)

    const { count: setupsThisMonth } = await supabase
      .from('setups')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', monthStart.toISOString())

    const { data: trades } = await supabase
      .from('trades')
      .select('id, ticker_symbol, pnl, pnl_percent, status, closed_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)

    const closedTrades = (trades ?? []).filter((t) => t.status === 'closed')
    const wins = closedTrades.filter((t) => (t.pnl as number) > 0)
    const winRate = closedTrades.length ? (wins.length / closedTrades.length) * 100 : 0
    const totalPnl = closedTrades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0)
    const avgWin =
      wins.length > 0 ? wins.reduce((s, t) => s + Number(t.pnl), 0) / wins.length : 0
    const losses = closedTrades.filter((t) => (t.pnl as number) < 0)
    const avgLoss =
      losses.length > 0
        ? losses.reduce((s, t) => s + Math.abs(Number(t.pnl)), 0) / losses.length
        : 0
    const riskReward = avgLoss > 0 ? avgWin / avgLoss : 0

    let winStreak = 0
    for (const t of trades ?? []) {
      if (t.status !== 'closed') continue
      if ((t.pnl as number) > 0) winStreak += 1
      else break
    }

    const lastClosed = (trades ?? []).find((t) => t.status === 'closed')

    return res.status(200).json({
      setupsThisMonth: setupsThisMonth ?? 0,
      winRate,
      totalPnl,
      riskReward,
      winStreak,
      lastTradePnl: lastClosed?.pnl ?? null,
      closedTrades: closedTrades.length,
      recentTrades: trades ?? [],
    })
  } catch (err) {
    console.error('stats error', err)
    return res.status(500).json({ error: 'Failed to fetch stats' })
  }
}
