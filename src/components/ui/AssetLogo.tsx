import { useState } from 'react'
import type { Ticker } from '../../data/tickers'

interface AssetLogoProps {
  ticker: Ticker
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
}

export function AssetLogo({ ticker, size = 'md', className = '' }: AssetLogoProps) {
  const [failed, setFailed] = useState(false)
  const code = ticker.symbol.split('/')[0]
  const sizeClass = sizeClasses[size]

  if (failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-okx-elevated text-sm font-bold text-okx-violet ring-1 ring-okx-border/80 ${sizeClass} ${className}`}
      >
        {code.slice(0, 2)}
      </div>
    )
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-okx-elevated ring-1 ring-okx-border/80 ${sizeClass} ${className}`}
    >
      <img
        src={ticker.logoUrl}
        alt={`${ticker.name} logo`}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
