import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CandlestickData, Time } from 'lightweight-charts'
import type { Ticker } from '../data/tickers'
import type { Timeframe } from '../data/chartData'
import { generateCandles, getPriceStats } from '../data/chartData'
import { fetchMarketBars, fetchMarketQuote } from '../lib/api'

export interface PriceStats {
  price: number
  change: number
  isUp: boolean
  high: number
  low: number
  source?: string
}

const POLL_MS = 20_000

export function useMarketData(ticker: Ticker, timeframe: Timeframe) {
  const [candles, setCandles] = useState<CandlestickData<Time>[]>([])
  const [stats, setStats] = useState<PriceStats>(() => {
    const s = getPriceStats(ticker, timeframe)
    return { ...s, source: 'synthetic' }
  })
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<string>('synthetic')

  const load = useCallback(async () => {
    try {
      const [barsRes, quoteRes] = await Promise.all([
        fetchMarketBars(ticker.symbol, timeframe, ticker.basePrice, ticker.assetClass),
        fetchMarketQuote(ticker.symbol, timeframe, ticker.basePrice, ticker.assetClass),
      ])

      const nextCandles: CandlestickData<Time>[] = barsRes.bars.map((b) => ({
        time: b.time as Time,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
      }))

      setCandles(nextCandles.length ? nextCandles : generateCandles(ticker, timeframe))
      setSource(barsRes.source)
      setStats({
        price: quoteRes.quote.price,
        change: quoteRes.quote.changePercent,
        isUp: quoteRes.quote.changePercent >= 0,
        high: quoteRes.quote.high,
        low: quoteRes.quote.low,
        source: quoteRes.quote.source,
      })
    } catch {
      const fallback = generateCandles(ticker, timeframe)
      setCandles(fallback)
      const s = getPriceStats(ticker, timeframe)
      setStats({ ...s, source: 'synthetic' })
      setSource('synthetic')
    } finally {
      setLoading(false)
    }
  }, [ticker, timeframe])

  useEffect(() => {
    setLoading(true)
    load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [load])

  const lineData = useMemo(
    () => candles.map((c) => ({ time: c.time, value: c.close as number })),
    [candles]
  )

  return { candles, lineData, stats, loading, source, refresh: load }
}
