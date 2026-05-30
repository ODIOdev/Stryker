import type { CandlestickData, LineData, Time } from 'lightweight-charts'
import type { Ticker } from './tickers'

export type Timeframe = '1H' | '1D' | '1W' | '1M' | '1Y'

export const TIMEFRAMES: { id: Timeframe; label: string; count: number; interval: number }[] = [
  { id: '1H', label: '1h', count: 120, interval: 3600 },
  { id: '1D', label: '24h', count: 90, interval: 86400 },
  { id: '1W', label: '1W', count: 52, interval: 604800 },
  { id: '1M', label: '1M', count: 24, interval: 2592000 },
  { id: '1Y', label: '1Y', count: 12, interval: 25920000 },
]

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
  timeframe: Timeframe = '1D'
): CandlestickData<Time>[] {
  const config = TIMEFRAMES.find((t) => t.id === timeframe) ?? TIMEFRAMES[1]
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
