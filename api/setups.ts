import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors } from './_lib/market.js'
import { getDb, getUserFromRequest } from './_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const user = await getUserFromRequest(req.headers.authorization)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const sql = getDb()

  if (req.method === 'GET') {
    const limit = Math.min(Number(req.query.limit ?? 50), 100)
    const rows = await sql`
      select *
      from public.setups
      where user_id = ${user.id}
      order by created_at desc
      limit ${limit}
    `
    return res.status(200).json({ setups: rows })
  }

  if (req.method === 'POST') {
    const body = req.body ?? {}
    const [row] = await sql`
      insert into public.setups (
        user_id, ticker_symbol, ticker_name, logo_url, timeframe,
        score, max_score, grade, rating_label, rating_color,
        quality_pct, sync_pct, confidence_pct, active_count, complete_count,
        bias, entry_price, factors_json
      ) values (
        ${user.id},
        ${body.tickerSymbol},
        ${body.tickerName ?? null},
        ${body.logoUrl ?? null},
        ${body.timeframe},
        ${body.score ?? 0},
        ${body.maxScore ?? 0},
        ${body.grade ?? null},
        ${body.ratingLabel ?? null},
        ${body.ratingColor ?? null},
        ${body.qualityPct ?? null},
        ${body.syncPct ?? null},
        ${body.confidencePct ?? null},
        ${body.activeCount ?? 0},
        ${body.completeCount ?? 0},
        ${body.bias ?? null},
        ${body.entryPrice ?? null},
        ${body.factorsJson ? sql.json(body.factorsJson) : null}
      )
      returning *
    `
    return res.status(201).json({ setup: row })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
