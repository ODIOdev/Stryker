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
    const status = req.query.status ? String(req.query.status) : null
    const limit = Math.min(Number(req.query.limit ?? 50), 100)
    const rows = status
      ? await sql`
          select * from public.trades
          where user_id = ${user.id} and status = ${status}
          order by created_at desc
          limit ${limit}
        `
      : await sql`
          select * from public.trades
          where user_id = ${user.id}
          order by created_at desc
          limit ${limit}
        `
    return res.status(200).json({ trades: rows })
  }

  if (req.method === 'POST') {
    const body = req.body ?? {}
    const [row] = await sql`
      insert into public.trades (
        user_id, setup_id, ticker_symbol, ticker_name, direction,
        entry_price, exit_price, quantity, status, pnl, pnl_percent, notes
      ) values (
        ${user.id},
        ${body.setupId ?? null},
        ${body.tickerSymbol},
        ${body.tickerName ?? null},
        ${body.direction},
        ${body.entryPrice ?? null},
        ${body.exitPrice ?? null},
        ${body.quantity ?? 1},
        ${body.status ?? 'open'},
        ${body.pnl ?? null},
        ${body.pnlPercent ?? null},
        ${body.notes ?? null}
      )
      returning *
    `
    return res.status(201).json({ trade: row })
  }

  if (req.method === 'PATCH') {
    const body = req.body ?? {}
    if (!body.id) return res.status(400).json({ error: 'id is required' })

    const [row] = await sql`
      update public.trades set
        exit_price = coalesce(${body.exitPrice ?? null}, exit_price),
        status = coalesce(${body.status ?? null}, status),
        pnl = coalesce(${body.pnl ?? null}, pnl),
        pnl_percent = coalesce(${body.pnlPercent ?? null}, pnl_percent),
        notes = coalesce(${body.notes ?? null}, notes),
        closed_at = case when ${body.status ?? null} = 'closed' then now() else closed_at end
      where id = ${body.id} and user_id = ${user.id}
      returning *
    `
    if (!row) return res.status(404).json({ error: 'Trade not found' })
    return res.status(200).json({ trade: row })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
