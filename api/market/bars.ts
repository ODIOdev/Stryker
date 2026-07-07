import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cors, fetchMarketBars, handleOptions } from '../_lib/market.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (handleOptions(req)) return res.status(200).end()

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const symbol = String(req.query.symbol ?? '')
  const timeframe = String(req.query.timeframe ?? '1h')
  const basePrice = req.query.basePrice ? Number(req.query.basePrice) : undefined
  const assetClass = req.query.assetClass
    ? (String(req.query.assetClass) as 'crypto' | 'stock' | 'etf' | 'forex' | 'metal' | 'commodity')
    : undefined

  if (!symbol) {
    return res.status(400).json({ error: 'symbol is required' })
  }

  try {
    const { bars, source } = await fetchMarketBars(symbol, timeframe, basePrice, assetClass)
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30')
    return res.status(200).json({ symbol, timeframe, source, bars })
  } catch (err) {
    console.error('market/bars error', err)
    return res.status(500).json({ error: 'Failed to fetch market data' })
  }
}
