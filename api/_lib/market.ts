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

interface YahooMeta {
  regularMarketPrice?: number
  previousClose?: number
  chartPreviousClose?: number
  regularMarketDayHigh?: number
  regularMarketDayLow?: number
}

const TIMEFRAME_CONFIG: Record<
  string,
  { resolution: string; count: number; intervalSec: number; aggregate?: number }
> = {
  '5m': { resolution: '5', count: 500, intervalSec: 300 },
  '15m': { resolution: '15', count: 400, intervalSec: 900 },
  '30m': { resolution: '30', count: 400, intervalSec: 1800 },
  '1h': { resolution: '60', count: 500, intervalSec: 3600 },
  '4h': { resolution: '60', count: 500 * 4, intervalSec: 14400, aggregate: 4 },
  '1D': { resolution: 'D', count: 500, intervalSec: 86400 },
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  DOGE: 'dogecoin',
  XAU: 'tether-gold',
  XAG: 'kinesis-silver',
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
        yahoo: `${base}-USD`,
        coingeckoId: COINGECKO_IDS[base],
        assetClass: 'crypto',
      }
    }
    if (base === 'XAU') {
      return {
        finnhub: `OANDA:${base}_${quote}`,
        yahoo: 'GC=F',
        coingeckoId: COINGECKO_IDS.XAU,
        assetClass: 'metal',
      }
    }
    if (base === 'XAG') {
      return {
        finnhub: `OANDA:${base}_${quote}`,
        yahoo: 'SI=F',
        coingeckoId: COINGECKO_IDS.XAG,
        assetClass: 'metal',
      }
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

function quoteFromYahooMeta(meta: YahooMeta, bars: Bar[]): Quote | null {
  const price = meta.regularMarketPrice
  if (!price || price <= 0) return null

  const prev = meta.previousClose ?? meta.chartPreviousClose ?? bars[bars.length - 1]?.close ?? price
  const change = price - prev
  const changePercent = prev ? (change / prev) * 100 : 0

  return {
    price,
    change,
    changePercent,
    high: meta.regularMarketDayHigh ?? Math.max(...bars.map((b) => b.high), price),
    low: meta.regularMarketDayLow ?? Math.min(...bars.map((b) => b.low), price),
    source: 'yahoo',
  }
}

function stitchLivePrice(bars: Bar[], livePrice: number, intervalSec: number): Bar[] {
  if (!bars.length || !Number.isFinite(livePrice) || livePrice <= 0) return bars

  const out = [...bars]
  const last = out[out.length - 1]
  const now = Math.floor(Date.now() / 1000)
  const stale = now - last.time > intervalSec * 2

  if (stale) {
    out.push({
      time: now,
      open: last.close,
      high: Math.max(last.close, livePrice),
      low: Math.min(last.close, livePrice),
      close: livePrice,
    })
    return out
  }

  out[out.length - 1] = {
    ...last,
    close: livePrice,
    high: Math.max(last.high, livePrice),
    low: Math.min(last.low, livePrice),
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
  '5m': { interval: '5m', range: '1mo' },
  '15m': { interval: '15m', range: '3mo' },
  '30m': { interval: '30m', range: '6mo' },
  '1h': { interval: '1h', range: '2y' },
  '4h': { interval: '1h', range: '2y' },
  '1D': { interval: '1d', range: '5y' },
}

async function fetchYahooBars(
  yahooSymbol: string,
  timeframe: string
): Promise<{ bars: Bar[]; meta?: YahooMeta } | null> {
  const cfg = YAHOO_TIMEFRAMES[timeframe] ?? YAHOO_TIMEFRAMES['1h']
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`)
  url.searchParams.set('interval', cfg.interval)
  url.searchParams.set('range', cfg.range)
  url.searchParams.set('includePrePost', 'false')

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TradeStryker/1.0)' },
  })
  if (!res.ok) return null

  const data = (await res.json()) as {
    chart?: {
      result?: Array<{
        timestamp?: number[]
        indicators?: {
          quote?: Array<{
            open?: number[]
            high?: number[]
            low?: number[]
            close?: number[]
            volume?: number[]
          }>
        }
        meta?: YahooMeta
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
  return { bars, meta: result.meta }
}

async function fetchCoinGeckoQuote(coingeckoId: string, bars: Bar[]): Promise<Quote | null> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd&include_24hr_change=true`
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) return null
  const data = (await res.json()) as Record<string, { usd: number; usd_24h_change?: number }>
  const row = data[coingeckoId]
  if (!row?.usd) return null

  const changePercent = row.usd_24h_change ?? 0
  return {
    price: row.usd,
    change: (row.usd * changePercent) / 100,
    changePercent,
    high: Math.max(...bars.map((b) => b.high), row.usd),
    low: Math.min(...bars.map((b) => b.low), row.usd),
    source: 'coingecko',
  }
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

export async function fetchQuote(
  symbol: string,
  bars: Bar[],
  assetClass?: AssetClass,
  yahooMeta?: YahooMeta
): Promise<Quote> {
  const resolved = resolveMarketSymbol(symbol, assetClass)
  const apiKey = process.env.FINNHUB_API_KEY

  if (apiKey) {
    const url = new URL('https://finnhub.io/api/v1/quote')
    url.searchParams.set('symbol', resolved.finnhub)
    url.searchParams.set('token', apiKey)
    const res = await fetch(url)
    if (res.ok) {
      const q = (await res.json()) as { c: number; d: number; dp: number; h: number; l: number }
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

  if (yahooMeta) {
    const yahooQuote = quoteFromYahooMeta(yahooMeta, bars)
    if (yahooQuote) return yahooQuote
  }

  if (resolved.yahoo) {
    const yahoo = await fetchYahooBars(resolved.yahoo, '1h')
    if (yahoo?.meta) {
      const yahooQuote = quoteFromYahooMeta(yahoo.meta, bars)
      if (yahooQuote) return yahooQuote
    }
  }

  if (resolved.coingeckoId) {
    const cgQuote = await fetchCoinGeckoQuote(resolved.coingeckoId, bars)
    if (cgQuote) return cgQuote
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
  let bars: Bar[] | null = null
  let yahooMeta: YahooMeta | undefined

  bars =
    (await fetchFinnhubCandles(
      resolved.finnhub,
      resolved.assetClass,
      cfg.resolution,
      from,
      now
    )) ?? null
  if (bars?.length) source = 'finnhub'

  if (!bars?.length && resolved.yahoo) {
    const yahoo = await fetchYahooBars(resolved.yahoo, timeframe)
    if (yahoo?.bars.length) {
      bars = yahoo.bars
      yahooMeta = yahoo.meta
      source = 'yahoo'
    }
  }

  if (bars && cfg.aggregate) {
    bars = aggregateBars(bars, cfg.aggregate)
  }

  if (!bars?.length) {
    return { bars: syntheticBars(symbol, timeframe, basePrice), source: 'synthetic' }
  }

  const quote = await fetchQuote(symbol, bars, assetClass, yahooMeta)
  bars = stitchLivePrice(bars, quote.price, cfg.intervalSec)

  return { bars, source }
}

export function cors(res: { setHeader: (k: string, v: string) => void }) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function handleOptions(req: VercelRequest) {
  return req.method === 'OPTIONS'
}
