import type { VercelRequest } from '@vercel/node'

export type AssetClass = 'crypto' | 'stock' | 'etf' | 'forex' | 'metal' | 'commodity'

export interface Bar {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface Quote {
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  source: 'finnhub' | 'coingecko' | 'yahoo' | 'synthetic'
}

const TIMEFRAME_CONFIG: Record<
  string,
  { resolution: string; count: number; intervalSec: number; aggregate?: number }
> = {
  '5m': { resolution: '5', count: 120, intervalSec: 300 },
  '15m': { resolution: '15', count: 96, intervalSec: 900 },
  '30m': { resolution: '30', count: 96, intervalSec: 1800 },
  '1h': { resolution: '60', count: 72, intervalSec: 3600 },
  '4h': { resolution: '60', count: 90 * 4, intervalSec: 14400, aggregate: 4 },
  '1D': { resolution: 'D', count: 90, intervalSec: 86400 },
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  DOGE: 'dogecoin',
}

export function resolveMarketSymbol(symbol: string, assetClass?: AssetClass): {
  finnhub: string
  yahoo?: string
  coingeckoId?: string
  assetClass: AssetClass
} {
  const upper = symbol.toUpperCase()

  if (upper.includes('/')) {
    const [base, quote] = upper.split('/')
    if (['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE'].includes(base)) {
      const q = quote === 'USD' ? 'USDT' : quote
      return {
        finnhub: `BINANCE:${base}${q}`,
        yahoo: `${base}-${quote}`,
        coingeckoId: COINGECKO_IDS[base],
        assetClass: 'crypto',
      }
    }
    if (base === 'XAU') {
      return { finnhub: `OANDA:${base}_${quote}`, yahoo: 'GC=F', assetClass: 'metal' }
    }
    if (base === 'XAG') {
      return { finnhub: `OANDA:${base}_${quote}`, yahoo: 'SI=F', assetClass: 'metal' }
    }
    return {
      finnhub: `OANDA:${base}_${quote}`,
      yahoo: `${base}${quote}=X`,
      assetClass: 'forex',
    }
  }

  if (assetClass) {
    return { finnhub: upper, yahoo: upper, assetClass }
  }

  const etfs = ['SPY', 'QQQ', 'IWM', 'GLD', 'SLV', 'USO', 'UNG']
  if (etfs.includes(upper)) return { finnhub: upper, yahoo: upper, assetClass: 'etf' }

  return { finnhub: upper, yahoo: upper, assetClass: 'stock' }
}

function aggregateBars(bars: Bar[], factor: number): Bar[] {
  const out: Bar[] = []
  for (let i = 0; i < bars.length; i += factor) {
    const chunk = bars.slice(i, i + factor)
    if (chunk.length === 0) continue
    out.push({
      time: chunk[0].time,
      open: chunk[0].open,
      high: Math.max(...chunk.map((b) => b.high)),
      low: Math.min(...chunk.map((b) => b.low)),
      close: chunk[chunk.length - 1].close,
      volume: chunk.reduce((s, b) => s + (b.volume ?? 0), 0),
    })
  }
  return out
}

async function fetchFinnhubCandles(
  finnhubSymbol: string,
  assetClass: AssetClass,
  resolution: string,
  from: number,
  to: number
): Promise<Bar[] | null> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) return null

  const endpoint =
    assetClass === 'crypto'
      ? 'crypto/candle'
      : assetClass === 'forex' || assetClass === 'metal'
        ? 'forex/candle'
        : 'stock/candle'

  const url = new URL(`https://finnhub.io/api/v1/${endpoint}`)
  url.searchParams.set('symbol', finnhubSymbol)
  url.searchParams.set('resolution', resolution)
  url.searchParams.set('from', String(from))
  url.searchParams.set('to', String(to))
  url.searchParams.set('token', apiKey)

  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as {
    s: string
    t?: number[]
    o?: number[]
    h?: number[]
    l?: number[]
    c?: number[]
    v?: number[]
  }
  if (data.s !== 'ok' || !data.t?.length) return null

  return data.t.map((time, i) => ({
    time,
    open: data.o![i],
    high: data.h![i],
    low: data.l![i],
    close: data.c![i],
    volume: data.v?.[i],
  }))
}

const YAHOO_TIMEFRAMES: Record<string, { interval: string; range: string }> = {
  '5m': { interval: '5m', range: '5d' },
  '15m': { interval: '15m', range: '5d' },
  '30m': { interval: '30m', range: '5d' },
  '1h': { interval: '1h', range: '1mo' },
  '4h': { interval: '1h', range: '3mo' },
  '1D': { interval: '1d', range: '3mo' },
}

async function fetchYahooBars(
  yahooSymbol: string,
  timeframe: string
): Promise<{ bars: Bar[]; meta?: { price: number; changePercent: number } } | null> {
  const cfg = YAHOO_TIMEFRAMES[timeframe] ?? YAHOO_TIMEFRAMES['1h']
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`)
  url.searchParams.set('interval', cfg.interval)
  url.searchParams.set('range', cfg.range)

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TradeStryker/1.0)' },
  })
  if (!res.ok) return null

  const data = (await res.json()) as {
    chart?: {
      result?: Array<{
        timestamp?: number[]
        indicators?: { quote?: Array<{ open?: number[]; high?: number[]; low?: number[]; close?: number[]; volume?: number[] }> }
        meta?: { regularMarketPrice?: number; chartPreviousClose?: number }
      }>
    }
  }

  const result = data.chart?.result?.[0]
  const timestamps = result?.timestamp
  const quote = result?.indicators?.quote?.[0]
  if (!timestamps?.length || !quote?.close?.length) return null

  const bars: Bar[] = []
  for (let i = 0; i < timestamps.length; i++) {
    const close = quote.close[i]
    if (close == null || Number.isNaN(close)) continue
    bars.push({
      time: timestamps[i],
      open: quote.open?.[i] ?? close,
      high: quote.high?.[i] ?? close,
      low: quote.low?.[i] ?? close,
      close,
      volume: quote.volume?.[i] ?? undefined,
    })
  }

  if (!bars.length) return null

  const price = result.meta?.regularMarketPrice ?? bars[bars.length - 1].close
  const prev = result.meta?.chartPreviousClose ?? bars[0].close
  const changePercent = prev ? ((price - prev) / prev) * 100 : 0

  return { bars, meta: { price, changePercent } }
}

async function fetchCoinGeckoBars(coingeckoId: string, days: number): Promise<Bar[] | null> {
  const url = `https://api.coingecko.com/api/v3/coins/${coingeckoId}/ohlc?vs_currency=usd&days=${days}`
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) return null
  const rows = (await res.json()) as [number, number, number, number, number][]
  return rows.map(([ms, open, high, low, close]) => ({
    time: Math.floor(ms / 1000),
    open,
    high,
    low,
    close,
  }))
}

function syntheticBars(symbol: string, timeframe: string, basePrice = 100): Bar[] {
  const cfg = TIMEFRAME_CONFIG[timeframe] ?? TIMEFRAME_CONFIG['1h']
  const bars: Bar[] = []
  let price = basePrice
  const now = Math.floor(Date.now() / 1000)
  let seed = 0
  for (const ch of symbol) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0

  for (let i = cfg.count; i >= 0; i--) {
    seed = (seed * 16807) % 2147483647
    const rand = (seed - 1) / 2147483646
    const drift = (rand - 0.48) * 0.012 * price
    const open = price
    const close = price + drift
    const wick = Math.abs(drift) * (0.4 + rand * 0.8)
    bars.push({
      time: now - i * cfg.intervalSec,
      open,
      high: Math.max(open, close) + wick * rand,
      low: Math.min(open, close) - wick * rand,
      close,
    })
    price = close
  }
  return bars
}

export async function fetchMarketBars(
  symbol: string,
  timeframe: string,
  basePrice?: number,
  assetClass?: AssetClass
): Promise<{ bars: Bar[]; source: Quote['source'] }> {
  const cfg = TIMEFRAME_CONFIG[timeframe] ?? TIMEFRAME_CONFIG['1h']
  const resolved = resolveMarketSymbol(symbol, assetClass)
  const now = Math.floor(Date.now() / 1000)
  const from = now - cfg.count * cfg.intervalSec * (cfg.aggregate ?? 1)
  let source: Quote['source'] = 'synthetic'

  let bars =
    (await fetchFinnhubCandles(
      resolved.finnhub,
      resolved.assetClass,
      cfg.resolution,
      from,
      now
    )) ?? null

  if (bars?.length) {
    source = 'finnhub'
  }

  if (bars && cfg.aggregate) {
    bars = aggregateBars(bars, cfg.aggregate)
  }

  if (!bars?.length && resolved.coingeckoId) {
    const days = timeframe === '1D' ? 90 : 30
    bars = await fetchCoinGeckoBars(resolved.coingeckoId, days)
    if (bars?.length) source = 'coingecko'
  }

  if (!bars?.length && resolved.yahoo) {
    const yahoo = await fetchYahooBars(resolved.yahoo, timeframe)
    if (yahoo?.bars.length) {
      bars = yahoo.bars
      if (cfg.aggregate) bars = aggregateBars(bars, cfg.aggregate)
      source = 'yahoo'
    }
  }

  if (!bars?.length) {
    return { bars: syntheticBars(symbol, timeframe, basePrice), source: 'synthetic' }
  }

  return { bars, source }
}

export async function fetchQuote(
  symbol: string,
  bars: Bar[],
  assetClass?: AssetClass
): Promise<Quote> {
  const resolved = resolveMarketSymbol(symbol, assetClass)
  const apiKey = process.env.FINNHUB_API_KEY

  if (apiKey && resolved.assetClass !== 'crypto') {
    const url = new URL('https://finnhub.io/api/v1/quote')
    url.searchParams.set('symbol', resolved.finnhub)
    url.searchParams.set('token', apiKey)
    const res = await fetch(url)
    if (res.ok) {
      const q = (await res.json()) as {
        c: number
        d: number
        dp: number
        h: number
        l: number
      }
      if (q.c > 0) {
        return {
          price: q.c,
          change: q.d ?? 0,
          changePercent: q.dp ?? 0,
          high: q.h,
          low: q.l,
          source: 'finnhub',
        }
      }
    }
  }

  if (resolved.coingeckoId) {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${resolved.coingeckoId}&vs_currencies=usd&include_24hr_change=true`
    const res = await fetch(url)
    if (res.ok) {
      const data = (await res.json()) as Record<string, { usd: number; usd_24h_change?: number }>
      const row = data[resolved.coingeckoId]
      if (row?.usd) {
        const changePercent = row.usd_24h_change ?? 0
        const change = (row.usd * changePercent) / 100
        return {
          price: row.usd,
          change,
          changePercent,
          high: Math.max(...bars.map((b) => b.high)),
          low: Math.min(...bars.map((b) => b.low)),
          source: 'coingecko',
        }
      }
    }
  }

  if (resolved.yahoo) {
    const yahoo = await fetchYahooBars(resolved.yahoo, '1h')
    if (yahoo?.meta) {
      return {
        price: yahoo.meta.price,
        change: (yahoo.meta.price * yahoo.meta.changePercent) / 100,
        changePercent: yahoo.meta.changePercent,
        high: Math.max(...bars.map((b) => b.high)),
        low: Math.min(...bars.map((b) => b.low)),
        source: 'yahoo',
      }
    }
  }

  const last = bars[bars.length - 1]?.close ?? 0
  const first = bars[0]?.close ?? last
  const changePercent = first ? ((last - first) / first) * 100 : 0
  return {
    price: last,
    change: last - first,
    changePercent,
    high: Math.max(...bars.map((b) => b.high)),
    low: Math.min(...bars.map((b) => b.low)),
    source: 'synthetic',
  }
}

export function cors(res: { setHeader: (k: string, v: string) => void }) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function handleOptions(req: VercelRequest) {
  return req.method === 'OPTIONS'
}
