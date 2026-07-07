import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors } from '../_lib/market.js'
import { getSupabaseAdmin, requireMasterAdmin } from '../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auth = await requireMasterAdmin(req.headers.authorization)
    if (!auth.user) {
      const status = auth.error === 'Forbidden' ? 403 : 401
      return res.status(status).json({ error: auth.error })
    }

    const supabase = getSupabaseAdmin()

    const [
      { data: users, error: usersError },
      { count: setupsCount },
      { count: tradesCount },
      { count: marketBarsCount },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, display_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('setups').select('*', { count: 'exact', head: true }),
      supabase.from('trades').select('*', { count: 'exact', head: true }),
      supabase.from('market_bars').select('*', { count: 'exact', head: true }),
    ])

    if (usersError) throw usersError

    const finnhubConfigured = Boolean(process.env.FINNHUB_API_KEY)
    const supabaseConfigured = Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    return res.status(200).json({
      users: users ?? [],
      counts: {
        users: users?.length ?? 0,
        setups: setupsCount ?? 0,
        trades: tradesCount ?? 0,
        marketBars: marketBarsCount ?? 0,
      },
      apiPlugs: [
        {
          id: 'yahoo',
          name: 'Yahoo Finance',
          status: 'active',
          description: 'Primary OHLCV and quote source for stocks, crypto, forex, and metals.',
        },
        {
          id: 'coingecko',
          name: 'CoinGecko',
          status: 'active',
          description: 'Crypto fallback when Yahoo data is unavailable.',
        },
        {
          id: 'finnhub',
          name: 'Finnhub',
          status: finnhubConfigured ? 'configured' : 'not_configured',
          description: finnhubConfigured
            ? 'API key is set on the server.'
            : 'Optional — add FINNHUB_API_KEY in Vercel env vars.',
        },
      ],
      integrations: [
        {
          id: 'supabase',
          name: 'Supabase',
          status: supabaseConfigured ? 'connected' : 'not_configured',
          description: 'Auth, profiles, setups, trades, and market bar cache.',
        },
        {
          id: 'vercel',
          name: 'Vercel',
          status: 'connected',
          description: 'Hosting, serverless API routes, and environment secrets.',
        },
        {
          id: 'google-oauth',
          name: 'Google OAuth',
          status: 'needs_setup',
          description: 'Enable in Supabase Auth → Providers and add Google Cloud credentials.',
        },
        {
          id: 'apple-oauth',
          name: 'Apple OAuth',
          status: 'needs_setup',
          description: 'Enable in Supabase Auth → Providers and add Apple Developer credentials.',
        },
      ],
    })
  } catch (err) {
    console.error('admin overview error', err)
    return res.status(500).json({ error: 'Failed to load admin overview' })
  }
}
