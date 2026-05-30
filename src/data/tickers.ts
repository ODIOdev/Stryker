export interface Ticker {
  symbol: string
  name: string
  basePrice: number
  volatility: number
}

export const TICKERS: Ticker[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin', basePrice: 67200, volatility: 0.018 },
  { symbol: 'ETH/USD', name: 'Ethereum', basePrice: 3480, volatility: 0.022 },
  { symbol: 'SOL/USD', name: 'Solana', basePrice: 142, volatility: 0.028 },
  { symbol: 'NVDA', name: 'NVIDIA', basePrice: 118, volatility: 0.015 },
  { symbol: 'AAPL', name: 'Apple', basePrice: 198, volatility: 0.008 },
  { symbol: 'SPY', name: 'S&P 500 ETF', basePrice: 528, volatility: 0.006 },
  { symbol: 'EUR/USD', name: 'Euro', basePrice: 1.084, volatility: 0.004 },
  { symbol: 'XAU/USD', name: 'Gold', basePrice: 2340, volatility: 0.007 },
]

export function findTicker(query: string): Ticker | undefined {
  const q = query.trim().toUpperCase()
  if (!q) return undefined
  return TICKERS.find(
    (t) =>
      t.symbol.toUpperCase().includes(q) ||
      t.name.toUpperCase().includes(q) ||
      t.symbol.split('/')[0] === q
  )
}
