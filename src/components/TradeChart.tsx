import { useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
} from 'lightweight-charts'
import type { Ticker } from '../data/tickers'
import {
  generateCandles,
  candlesToLine,
  getPriceStats,
  type Timeframe,
} from '../data/chartData'
import type { ChartMode } from '../App'
import { TimeframePills } from './ui/TimeframePills'
import { SegmentedControl } from './ui/SegmentedControl'

interface TradeChartProps {
  ticker: Ticker
  mode: ChartMode
  onModeChange: (mode: ChartMode) => void
  timeframe: Timeframe
  onTimeframeChange: (tf: Timeframe) => void
}

const LIME = '#bcff2f'

const chartOptions = {
  layout: {
    background: { color: 'transparent' },
    textColor: '#6b6b6b',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 11,
  },
  grid: {
    vertLines: { visible: false },
    horzLines: { color: '#1a1a1a' },
  },
  rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.12, bottom: 0.05 } },
  timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
  crosshair: {
    vertLine: { color: '#4da3ff30', labelBackgroundColor: '#141414' },
    horzLine: { color: '#2dd4bf30', labelBackgroundColor: '#141414' },
  },
}

const candleStyle = {
  upColor: LIME,
  downColor: '#ff5b5b',
  borderUpColor: LIME,
  borderDownColor: '#ff5b5b',
  wickUpColor: LIME,
  wickDownColor: '#ff5b5b',
}

const lineStyle = {
  color: LIME,
  lineWidth: 2 as const,
  crosshairMarkerVisible: true,
  crosshairMarkerRadius: 4,
  crosshairMarkerBorderColor: LIME,
  crosshairMarkerBackgroundColor: '#000',
}

const chartTypeOptions = [
  { value: 'line' as const, label: 'Line' },
  { value: 'candlestick' as const, label: 'Candles' },
]

export function TradeChart({
  ticker,
  mode,
  onModeChange,
  timeframe,
  onTimeframeChange,
}: TradeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null>(null)

  const candles = useMemo(
    () => generateCandles(ticker, timeframe),
    [ticker.symbol, timeframe]
  )
  const lineData = useMemo(() => candlesToLine(candles), [candles])
  const stats = useMemo(
    () => getPriceStats(ticker, timeframe),
    [ticker.symbol, timeframe]
  )

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      ...chartOptions,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    })
    chartRef.current = chart

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      chart.applyOptions({ width, height })
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current)
      seriesRef.current = null
    }

    if (mode === 'candlestick') {
      const series = chart.addSeries(CandlestickSeries, candleStyle)
      series.setData(candles)
      seriesRef.current = series
    } else {
      const series = chart.addSeries(LineSeries, lineStyle)
      series.setData(lineData)
      seriesRef.current = series
    }

    chart.timeScale().fitContent()
  }, [mode, candles, lineData])

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 pb-1 sm:px-5">
        <motion.div
          key={ticker.symbol + stats.price}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-sm text-okx-muted">
              {ticker.name}{' '}
              <span className="text-okx-subtle">{ticker.symbol.split('/')[0]}</span>
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {formatPrice(stats.price, ticker.symbol)}
            </p>
            <p
              className={`mt-1 text-sm font-medium tabular-nums ${
                stats.isUp ? 'text-okx-lime' : 'text-down'
              }`}
            >
              {stats.isUp ? '+' : ''}
              {stats.change.toFixed(2)}%
            </p>
          </div>
          <SegmentedControl
            options={chartTypeOptions}
            value={mode}
            onChange={onModeChange}
            layoutId="chart-type"
          />
        </motion.div>
      </div>

      <div
        ref={containerRef}
        className={`h-[260px] shrink-0 px-1 sm:h-[280px] ${mode === 'line' ? 'chart-glow-line' : ''}`}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-okx-border/60 px-4 py-3 sm:px-5">
        <TimeframePills value={timeframe} onChange={onTimeframeChange} />
      </div>
    </div>
  )
}

function formatPrice(price: number, symbol: string): string {
  if (symbol.includes('EUR') || price < 10) {
    return (
      '$' +
      price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    )
  }
  if (price > 1000) {
    return '$' + price.toLocaleString(undefined, { maximumFractionDigits: 0 })
  }
  return (
    '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  )
}
