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
      const limit = Math.min(Number(req.query.limit ?? 50), 100)
      const { data, error } = await supabase
        .from('setups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return res.status(200).json({ setups: data ?? [] })
    }

    if (req.method === 'POST') {
      const body = req.body ?? {}
      const { data, error } = await supabase
        .from('setups')
        .insert({
          user_id: user.id,
          ticker_symbol: body.tickerSymbol,
          ticker_name: body.tickerName ?? null,
          logo_url: body.logoUrl ?? null,
          timeframe: body.timeframe,
          score: body.score ?? 0,
          max_score: body.maxScore ?? 0,
          grade: body.grade ?? null,
          rating_label: body.ratingLabel ?? null,
          rating_color: body.ratingColor ?? null,
          quality_pct: body.qualityPct ?? null,
          sync_pct: body.syncPct ?? null,
          confidence_pct: body.confidencePct ?? null,
          active_count: body.activeCount ?? 0,
          complete_count: body.completeCount ?? 0,
          bias: body.bias ?? null,
          entry_price: body.entryPrice ?? null,
          factors_json: body.factorsJson ?? null,
        })
        .select()
        .single()

      if (error) throw error
      return res.status(201).json({ setup: data })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('setups error', err)
    return res.status(500).json({ error: 'Failed to process setup request' })
  }
}
