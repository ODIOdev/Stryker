import type { CandlestickData, LineData, Time } from 'lightweight-charts'
import type { Ticker } from './tickers'

export type Timeframe = '5m' | '15m' | '30m' | '1h' | '4h' | '1D'

export const TIMEFRAMES: { id: Timeframe; label: string; count: number; interval: number }[] = [
  { id: '5m', label: '5m', count: 120, interval: 300 },
  { id: '15m', label: '15m', count: 96, interval: 900 },
  { id: '30m', label: '30m', count: 96, interval: 1800 },
  { id: '1h', label: '1h', count: 72, interval: 3600 },
  { id: '4h', label: '4h', count: 90, interval: 14400 },
  { id: '1D', label: '1D', count: 90, interval: 86400 },
]

const INTERVAL_WEIGHTS: Record<Timeframe, number> = {
  '5m': 1,
  '15m': 2,
  '30m': 3,
  '1h': 4,
  '4h': 5,
  '1D': 6,
}

/** Max score achievable at each chart interval (scales up from 5m → 1D). */
const TIMEFRAME_SCORE_CEILING: Record<Timeframe, number> = {
  '5m': 30,
  '15m': 45,
  '30m': 58,
  '1h': 70,
  '4h': 85,
  '1D': 100,
}

export function intervalWeight(tf: Timeframe): number {
  return INTERVAL_WEIGHTS[tf]
}

export function timeframeScoreCeiling(tf: Timeframe): number {
  return TIMEFRAME_SCORE_CEILING[tf]
}

export function timeframeLabel(tf: Timeframe): string {
  return TIMEFRAMES.find((t) => t.id === tf)?.label ?? tf
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashSymbol(symbol: string, tf: string): number {
  let h = 0
  const str = symbol + tf
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function generateCandles(
  ticker: Ticker,
  timeframe: Timeframe = '1h'
): CandlestickData<Time>[] {
  const config = TIMEFRAMES.find((t) => t.id === timeframe) ?? TIMEFRAMES[3]
  const rand = seededRandom(hashSymbol(ticker.symbol, timeframe))
  const candles: CandlestickData<Time>[] = []
  let price = ticker.basePrice * (0.92 + rand() * 0.16)
  const now = Math.floor(Date.now() / 1000)

  for (let i = config.count; i >= 0; i--) {
    const drift = (rand() - 0.48) * ticker.volatility * price
    const open = price
    const close = price + drift
    const wick = Math.abs(drift) * (0.4 + rand() * 0.8)
    const high = Math.max(open, close) + wick * rand()
    const low = Math.min(open, close) - wick * rand()
    const time = (now - i * config.interval) as Time

    candles.push({ time, open, high, low, close })
    price = close
  }

  return candles
}

export function candlesToLine(candles: CandlestickData<Time>[]): LineData<Time>[] {
  return candles.map((c) => ({ time: c.time, value: c.close }))
}

export function getPriceStats(ticker: Ticker, timeframe: Timeframe) {
  const candles = generateCandles(ticker, timeframe)
  const last = candles[candles.length - 1]?.close ?? ticker.basePrice
  const first = candles[0]?.close ?? last
  const change = ((last - first) / first) * 100
  const highs = candles.map((c) => c.high as number)
  const lows = candles.map((c) => c.low as number)
  return {
    price: last,
    change,
    isUp: change >= 0,
    high: Math.max(...highs),
    low: Math.min(...lows),
  }
}
