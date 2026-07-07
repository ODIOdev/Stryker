import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors } from './_lib/market.js'
import { ensureProfile, getSupabaseAdmin, getUserFromRequest } from './_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const user = await getUserFromRequest(req.headers.authorization)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    await ensureProfile(user)
    const supabase = getSupabaseAdmin()

    if (req.method === 'GET') {
      const status = req.query.status ? String(req.query.status) : null
      const limit = Math.min(Number(req.query.limit ?? 50), 100)
      let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (status) query = query.eq('status', status)

      const { data, error } = await query
      if (error) throw error
      return res.status(200).json({ trades: data ?? [] })
    }

    if (req.method === 'POST') {
      const body = req.body ?? {}
      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          setup_id: body.setupId ?? null,
          ticker_symbol: body.tickerSymbol,
          ticker_name: body.tickerName ?? null,
          direction: body.direction,
          entry_price: body.entryPrice ?? null,
          exit_price: body.exitPrice ?? null,
          quantity: body.quantity ?? 1,
          status: body.status ?? 'open',
          pnl: body.pnl ?? null,
          pnl_percent: body.pnlPercent ?? null,
          notes: body.notes ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json({ trade: data })
    }

    if (req.method === 'PATCH') {
      const body = req.body ?? {}
      if (!body.id) return res.status(400).json({ error: 'id is required' })

      const updates: Record<string, unknown> = {}
      if (body.exitPrice != null) updates.exit_price = body.exitPrice
      if (body.status != null) updates.status = body.status
      if (body.pnl != null) updates.pnl = body.pnl
      if (body.pnlPercent != null) updates.pnl_percent = body.pnlPercent
      if (body.notes != null) updates.notes = body.notes
      if (body.status === 'closed') updates.closed_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', body.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      if (!data) return res.status(404).json({ error: 'Trade not found' })
      return res.status(200).json({ trade: data })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('trades error', err)
    return res.status(500).json({ error: 'Failed to process trade request' })
  }
}
