import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors } from './_lib/market.js'
import { getDb, getUserFromRequest } from './_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = await getUserFromRequest(req.headers.authorization)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const sql = getDb()

  const [setupCount] = await sql`
    select count(*)::int as count
    from public.setups
    where user_id = ${user.id}
      and created_at >= date_trunc('month', now())
  `

  const [tradeStats] = await sql`
    select
      count(*) filter (where status = 'closed')::int as closed_count,
      count(*) filter (where status = 'closed' and pnl > 0)::int as wins,
      coalesce(sum(pnl) filter (where status = 'closed'), 0)::float as total_pnl,
      coalesce(avg(pnl) filter (where status = 'closed' and pnl > 0), 0)::float as avg_win,
      coalesce(avg(abs(pnl)) filter (where status = 'closed' and pnl < 0), 0)::float as avg_loss
    from public.trades
    where user_id = ${user.id}
  `

  const recentTrades = await sql`
    select id, ticker_symbol, pnl, pnl_percent, status, closed_at, created_at
    from public.trades
    where user_id = ${user.id}
    order by coalesce(closed_at, created_at) desc
    limit 30
  `

  const closed = tradeStats?.closed_count ?? 0
  const wins = tradeStats?.wins ?? 0
  const winRate = closed > 0 ? (wins / closed) * 100 : 0
  const avgWin = tradeStats?.avg_win ?? 0
  const avgLoss = tradeStats?.avg_loss ?? 0
  const riskReward = avgLoss > 0 ? avgWin / avgLoss : 0

  let streak = 0
  for (const t of recentTrades) {
    if (t.status !== 'closed') continue
    if ((t.pnl as number) > 0) streak += 1
    else break
  }

  const lastClosed = recentTrades.find((t) => t.status === 'closed')

  return res.status(200).json({
    setupsThisMonth: setupCount?.count ?? 0,
    winRate,
    totalPnl: tradeStats?.total_pnl ?? 0,
    riskReward,
    winStreak: streak,
    lastTradePnl: lastClosed?.pnl ?? null,
    closedTrades: closed,
    recentTrades,
  })
}
