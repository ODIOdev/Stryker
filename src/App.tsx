import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TICKERS, type Ticker } from './data/tickers'
import { useConfluenceScore } from './hooks/useConfluenceScore'
import { useGeneratedTrades } from './hooks/useGeneratedTrades'
import { useMarketData } from './hooks/useMarketData'
import { useAuth } from './hooks/useAuth'
import { useUserStats } from './hooks/useUserStats'
import { TradeChart } from './components/TradeChart'
import { ConfluenceScoreboard } from './components/ConfluenceScoreboard'
import { SetupScoreCard } from './components/SetupScoreCard'
import { StatsWidgets } from './components/StatsWidgets'
import { StatCardsRow } from './components/StatCardsRow'
import { TopNav, type DashboardView } from './components/TopNav'
import { AssetHeader } from './components/AssetHeader'
import { GenerateButton } from './components/ui/GenerateButton'
import { GeneratedTradesGallery } from './components/GeneratedTradesGallery'
import type { Timeframe } from './data/chartData'

export type ChartMode = 'line' | 'candlestick'

function App() {
  const [ticker, setTicker] = useState<Ticker>(TICKERS[0])
  const [chartMode, setChartMode] = useState<ChartMode>('line')
  const [timeframe, setTimeframe] = useState<Timeframe>('1h')
  const [activeTab, setActiveTab] = useState<DashboardView>('Chart')

  const { user, signOut } = useAuth()
  const isAuthenticated = Boolean(user)
  const { stats, refresh: refreshStats } = useUserStats(isAuthenticated)
  const confluence = useConfluenceScore(timeframe)
  const market = useMarketData(ticker, timeframe)
  const { trades: generatedTrades, addTrade } = useGeneratedTrades(isAuthenticated, refreshStats)

  const handleGenerate = () => {
    addTrade({
      ticker,
      timeframe,
      score: confluence.score,
      maxScore: confluence.scoreCeiling,
      rating: confluence.rating,
      qualityPct: confluence.qualityPct,
      syncPct: confluence.syncPct,
      confidencePct: confluence.confidencePct,
      activeCount: confluence.activeCount,
      completeCount: confluence.completeCount,
      factors: confluence.factors,
      entryPrice: market.stats.price,
    })
  }

  return (
    <div className="app-backdrop flex min-h-screen items-center justify-center overflow-auto p-6 scrollbar-none">
      <div className="dashboard-stage w-full max-w-[1440px]">
        <div className="dashboard-brand-mark" aria-hidden>
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
          </svg>
        </div>
        <div className="dashboard-shell flex flex-col overflow-hidden rounded-2xl">
        <TopNav
          ticker={ticker}
          onTickerSelect={setTicker}
          activeView={activeTab}
          onViewChange={setActiveTab}
          user={user}
          onSignOut={signOut}
        />

        <main className="scrollbar-none flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto px-6 py-5">
          {activeTab !== 'Chart' && (
            <div className="shrink-0">
              <AssetHeader ticker={ticker} onTickerSelect={setTicker} />
            </div>
          )}

          {activeTab === 'Chart' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-4">
                <AssetHeader
                  inline
                  ticker={ticker}
                  onTickerSelect={setTicker}
                  className="min-w-0"
                />
                <GenerateButton onClick={handleGenerate} />
              </div>

              <StatCardsRow stats={stats} isAuthenticated={isAuthenticated} />

              <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-4">
                <section
                  className="flex h-[666px] min-h-0 flex-col overflow-hidden rounded-2xl border border-okx-border bg-okx-card"
                  aria-label="Price chart"
                >
                  <TradeChart
                    ticker={ticker}
                    mode={chartMode}
                    onModeChange={setChartMode}
                    timeframe={timeframe}
                    onTimeframeChange={setTimeframe}
                    candles={market.candles}
                    lineData={market.lineData}
                    stats={market.stats}
                    dataSource={market.source}
                    score={confluence.score}
                    scoreCeiling={confluence.scoreCeiling}
                    rating={confluence.rating}
                    mainTradeBias={confluence.mainTradeBias}
                    qualityPct={confluence.qualityPct}
                    syncPct={confluence.syncPct}
                    confidencePct={confluence.confidencePct}
                    alignedCount={confluence.syncedCount}
                    activeCount={confluence.activeCount}
                  />
                </section>

                <aside
                  className="flex h-[666px] min-h-0 flex-col overflow-hidden"
                  aria-label="Setup scoreboard"
                >
                  <ConfluenceScoreboard
                    fillHeight
                    factors={confluence.factors}
                    factorScores={confluence.factorScores}
                    factorPoints={confluence.factorPoints}
                    factorSyncPct={confluence.factorSyncPct}
                    chartInterval={timeframe}
                    syncedCount={confluence.syncedCount}
                    completeCount={confluence.completeCount}
                    activeCount={confluence.activeCount}
                    confidencePct={confluence.confidencePct}
                    mainTradeBias={confluence.mainTradeBias}
                    onToggleExpand={confluence.toggleExpand}
                    onToggleEnabled={confluence.toggleEnabled}
                    onBiasChange={confluence.setBias}
                    onEmaBiasChange={confluence.setEmaBias}
                    onActiveEmaPeriodChange={confluence.setActiveEmaPeriod}
                    onPremDiscountSliderChange={confluence.setPremDiscountSlider}
                    onActivePremDiscountTfChange={confluence.setActivePremDiscountTf}
                  />
                </aside>
              </div>
            </div>
          )}

          {activeTab === 'Scoreboard' && (
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-2xl border border-okx-border bg-okx-card">
                <SetupScoreCard
                  score={confluence.score}
                  maxScore={confluence.scoreCeiling}
                  rating={confluence.rating}
                  mainTradeBias={confluence.mainTradeBias}
                  qualityPct={confluence.qualityPct}
                  syncPct={confluence.syncPct}
                  confidencePct={confluence.confidencePct}
                  alignedCount={confluence.syncedCount}
                  activeCount={confluence.activeCount}
                  embedded={false}
                />
              </div>
              <GeneratedTradesGallery trades={generatedTrades} />
              <ConfluenceScoreboard
                factors={confluence.factors}
                factorScores={confluence.factorScores}
                factorPoints={confluence.factorPoints}
                factorSyncPct={confluence.factorSyncPct}
                chartInterval={timeframe}
                syncedCount={confluence.syncedCount}
                completeCount={confluence.completeCount}
                activeCount={confluence.activeCount}
                confidencePct={confluence.confidencePct}
                mainTradeBias={confluence.mainTradeBias}
                onToggleExpand={confluence.toggleExpand}
                onToggleEnabled={confluence.toggleEnabled}
                onBiasChange={confluence.setBias}
                onEmaBiasChange={confluence.setEmaBias}
                onActiveEmaPeriodChange={confluence.setActiveEmaPeriod}
                onPremDiscountSliderChange={confluence.setPremDiscountSlider}
                onActivePremDiscountTfChange={confluence.setActivePremDiscountTf}
              />
            </div>
          )}

          {activeTab === 'Performance' && <StatsWidgets />}

          {activeTab === 'Journal' && (
            <div className="flex items-center justify-center py-8">
              <div className="w-full max-w-lg rounded-2xl border border-okx-border bg-okx-card p-8 text-center">
                <p className="text-okx-muted">
                  {isAuthenticated
                    ? 'Trade journal is synced to your account. Log trades from generated setups.'
                    : 'Sign in to save trades, setups, and track win rate.'}
                </p>
                {!isAuthenticated && (
                  <Link
                    to="/signin"
                    className="mt-4 inline-block rounded-full bg-okx-lime px-6 py-2.5 text-sm font-semibold text-black hover:bg-okx-lime-dim"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      </div>
    </div>
  )
}

export default App
