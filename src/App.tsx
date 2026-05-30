import { useState } from 'react'
import { TICKERS, type Ticker } from './data/tickers'
import { useConfluenceScore } from './hooks/useConfluenceScore'
import { TradeChart } from './components/TradeChart'
import { ConfluenceScoreboard } from './components/ConfluenceScoreboard'
import { StatsWidgets } from './components/StatsWidgets'
import { StatCardsRow } from './components/StatCardsRow'
import { TopNav } from './components/TopNav'
import { AssetTabs } from './components/AssetTabs'
import { AssetHeader } from './components/AssetHeader'
import type { Timeframe } from './data/chartData'

export type ChartMode = 'line' | 'candlestick'

function App() {
  const [ticker, setTicker] = useState<Ticker>(TICKERS[0])
  const [chartMode, setChartMode] = useState<ChartMode>('line')
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')
  const [activeTab, setActiveTab] = useState('Chart')
  const confluence = useConfluenceScore()

  return (
    <div className="flex min-h-screen flex-col bg-okx-bg">
      <TopNav ticker={ticker} onTickerSelect={setTicker} />

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-10 sm:px-6">
        <div className="pt-6">
          <AssetHeader ticker={ticker} onTickerSelect={setTicker} />
          <div className="mt-5">
            <AssetTabs active={activeTab} onChange={setActiveTab} />
          </div>
        </div>

        {activeTab === 'Chart' && (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
            <div className="flex min-w-0 flex-col gap-4">
              <StatCardsRow />

              <section
                className="flex flex-col overflow-hidden rounded-2xl bg-okx-card"
                aria-label="Price chart"
              >
                <TradeChart
                  ticker={ticker}
                  mode={chartMode}
                  onModeChange={setChartMode}
                  timeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                />
              </section>
            </div>

            <aside
              className="flex flex-col gap-4 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto"
              aria-label="Setup scoreboard"
            >
              <ConfluenceScoreboard
                factors={confluence.factors}
                score={confluence.score}
                earned={confluence.earned}
                maxPossible={confluence.maxPossible}
                rating={confluence.rating}
                onToggle={confluence.toggle}
                onWeightChange={confluence.setWeight}
              />
            </aside>
          </div>
        )}

        {activeTab === 'Scoreboard' && (
          <div className="mt-6 max-w-lg">
            <ConfluenceScoreboard
              factors={confluence.factors}
              score={confluence.score}
              earned={confluence.earned}
              maxPossible={confluence.maxPossible}
              rating={confluence.rating}
              onToggle={confluence.toggle}
              onWeightChange={confluence.setWeight}
            />
          </div>
        )}

        {activeTab === 'Performance' && (
          <div className="mt-6">
            <StatsWidgets />
          </div>
        )}

        {activeTab === 'Journal' && (
          <div className="mt-6 rounded-2xl bg-okx-card p-8 text-center">
            <p className="text-okx-muted">Trade journal coming soon.</p>
            <button
              type="button"
              className="mt-4 rounded-full bg-okx-lime px-6 py-2.5 text-sm font-semibold text-black hover:bg-okx-lime-dim"
            >
              Log first trade
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
