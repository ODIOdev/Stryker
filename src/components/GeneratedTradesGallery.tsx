import type { GeneratedTrade } from '../hooks/useGeneratedTrades'
import { GeneratedTradeCard } from './GeneratedTradeCard'

interface GeneratedTradesGalleryProps {
  trades: GeneratedTrade[]
}

export function GeneratedTradesGallery({ trades }: GeneratedTradesGalleryProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-okx-border bg-okx-card">
      <div className="border-b border-okx-border bg-okx-elevated/80 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-okx-text">Generated setups</h3>
            <p className="mt-0.5 text-xs text-okx-muted">
              {trades.length === 0
                ? 'Use Generate on the Chart view to save a setup'
                : `${trades.length} saved setup${trades.length === 1 ? '' : 's'}`}
            </p>
          </div>
          {trades.length > 0 && (
            <span className="rounded-full bg-okx-lime/15 px-2.5 py-1 text-xs font-semibold text-okx-lime">
              {trades.length}
            </span>
          )}
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <p className="text-sm text-okx-muted">No generated trades yet.</p>
          <p className="mt-1 max-w-sm text-xs text-okx-muted">
            Configure confluences on the Chart page, then tap Generate to add a thumbnail here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {trades.map((trade) => (
            <GeneratedTradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}
    </section>
  )
}
