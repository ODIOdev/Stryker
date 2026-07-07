export interface Ticker {
  symbol: string
  name: string
  basePrice: number
  volatility: number
  logoUrl: string
}

export const TICKERS: Ticker[] = [
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    basePrice: 67200,
    volatility: 0.018,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC--big.svg',
  },
  {
    symbol: 'ETH/USD',
    name: 'Ethereum',
    basePrice: 3480,
    volatility: 0.022,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCETH--big.svg',
  },
  {
    symbol: 'SOL/USD',
    name: 'Solana',
    basePrice: 142,
    volatility: 0.028,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCSOL--big.svg',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA',
    basePrice: 118,
    volatility: 0.015,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/nvidia--big.svg',
  },
  {
    symbol: 'AAPL',
    name: 'Apple',
    basePrice: 198,
    volatility: 0.008,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/apple--big.svg',
  },
  {
    symbol: 'SPY',
    name: 'S&P 500 ETF',
    basePrice: 528,
    volatility: 0.006,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/spdr-s-p-500-etf-trust--big.svg',
  },
  {
    symbol: 'EUR/USD',
    name: 'Euro',
    basePrice: 1.084,
    volatility: 0.004,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/EU--big.svg',
  },
  {
    symbol: 'XAU/USD',
    name: 'Gold',
    basePrice: 2340,
    volatility: 0.007,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/metal-gold--big.svg',
  },
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
