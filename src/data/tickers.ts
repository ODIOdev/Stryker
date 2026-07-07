export type AssetClass = 'crypto' | 'stock' | 'etf' | 'forex' | 'metal' | 'commodity'

export interface Ticker {
  symbol: string
  name: string
  basePrice: number
  volatility: number
  logoUrl: string
  assetClass: AssetClass
}

export const TICKERS: Ticker[] = [
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    basePrice: 67200,
    volatility: 0.018,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC--big.svg',
    assetClass: 'crypto',
  },
  {
    symbol: 'ETH/USD',
    name: 'Ethereum',
    basePrice: 3480,
    volatility: 0.022,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCETH--big.svg',
    assetClass: 'crypto',
  },
  {
    symbol: 'SOL/USD',
    name: 'Solana',
    basePrice: 142,
    volatility: 0.028,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCSOL--big.svg',
    assetClass: 'crypto',
  },
  {
    symbol: 'XRP/USD',
    name: 'Ripple',
    basePrice: 0.62,
    volatility: 0.025,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/crypto/XTVCXRP--big.svg',
    assetClass: 'crypto',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA',
    basePrice: 118,
    volatility: 0.015,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/nvidia--big.svg',
    assetClass: 'stock',
  },
  {
    symbol: 'AAPL',
    name: 'Apple',
    basePrice: 198,
    volatility: 0.008,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/apple--big.svg',
    assetClass: 'stock',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    basePrice: 248,
    volatility: 0.018,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/tesla--big.svg',
    assetClass: 'stock',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    basePrice: 420,
    volatility: 0.007,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/microsoft--big.svg',
    assetClass: 'stock',
  },
  {
    symbol: 'SPY',
    name: 'S&P 500 ETF',
    basePrice: 528,
    volatility: 0.006,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/spdr-s-p-500-etf-trust--big.svg',
    assetClass: 'etf',
  },
  {
    symbol: 'QQQ',
    name: 'Nasdaq 100 ETF',
    basePrice: 450,
    volatility: 0.008,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/invesco-qqq-trust--big.svg',
    assetClass: 'etf',
  },
  {
    symbol: 'GLD',
    name: 'Gold ETF',
    basePrice: 218,
    volatility: 0.006,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/spdr-gold-trust--big.svg',
    assetClass: 'etf',
  },
  {
    symbol: 'EUR/USD',
    name: 'Euro',
    basePrice: 1.084,
    volatility: 0.004,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/EU--big.svg',
    assetClass: 'forex',
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound',
    basePrice: 1.27,
    volatility: 0.005,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/GB--big.svg',
    assetClass: 'forex',
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Yen',
    basePrice: 157.5,
    volatility: 0.004,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/country/JP--big.svg',
    assetClass: 'forex',
  },
  {
    symbol: 'XAU/USD',
    name: 'Gold',
    basePrice: 2340,
    volatility: 0.007,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/metal-gold--big.svg',
    assetClass: 'metal',
  },
  {
    symbol: 'XAG/USD',
    name: 'Silver',
    basePrice: 28.5,
    volatility: 0.012,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/metal-silver--big.svg',
    assetClass: 'metal',
  },
  {
    symbol: 'USO',
    name: 'Oil ETF',
    basePrice: 72,
    volatility: 0.014,
    logoUrl: 'https://s3-symbol-logo.tradingview.com/united-states-oil-fund--big.svg',
    assetClass: 'commodity',
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
