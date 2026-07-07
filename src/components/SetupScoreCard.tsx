import type { TradeRating } from '../data/confluence'
import type { TradeBias } from '../lib/confluenceScoring'
import { MainTradeBiasPanel } from './MainTradeBiasPanel'
import { QualityMeter } from './QualityMeter'
import { ScoreGauge } from './ScoreGauge'

interface SetupScoreCardProps {
  score: number
  maxScore: number
  rating: TradeRating
  mainTradeBias: TradeBias | null
  qualityPct: number
  syncPct: number
  confidencePct: number
  alignedCount: number
  activeCount: number
  embedded?: boolean
}

export function SetupScoreCard({
  score,
  maxScore,
  rating,
  mainTradeBias,
  qualityPct,
  syncPct,
  confidencePct,
  alignedCount,
  activeCount,
  embedded = true,
}: SetupScoreCardProps) {
  if (embedded) {
    return (
      <div className="@container shrink-0 border-t border-okx-border/60 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-2.5">
          <div className="flex min-w-0 items-stretch gap-3">
            <ScoreGauge
              score={score}
              maxScore={maxScore}
              rating={rating}
              compact
              hideThresholds
            />
            <QualityMeter percent={qualityPct} compact className="min-w-0 flex-1 self-center" />
          </div>
          <MainTradeBiasPanel
            bias={mainTradeBias}
            qualityPct={qualityPct}
            syncPct={syncPct}
            confidencePct={confidencePct}
            alignedCount={alignedCount}
            activeCount={activeCount}
            layout="strip"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="@container p-5">
      <div className="flex flex-col items-stretch gap-5 @[520px]:flex-row @[520px]:items-center @[520px]:gap-4">
        <ScoreGauge score={score} maxScore={maxScore} rating={rating} />
        <MainTradeBiasPanel
          bias={mainTradeBias}
          qualityPct={qualityPct}
          syncPct={syncPct}
          confidencePct={confidencePct}
          alignedCount={alignedCount}
          activeCount={activeCount}
          layout="card"
        />
        <QualityMeter percent={qualityPct} className="min-w-0 flex-1" />
      </div>
    </div>
  )
}
