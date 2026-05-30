/** Score number + gauge color by tier */
export function scoreAccentColor(score: number): string {
  if (score >= 85) return '#bcff2f'
  if (score >= 70) return '#d4ff5c'
  if (score >= 50) return '#e8b84a'
  return '#9a9a9a'
}

export function scoreTextClass(score: number): string {
  if (score >= 85) return 'text-okx-lime'
  if (score >= 70) return 'text-okx-lime'
  if (score >= 50) return 'text-okx-amber'
  return 'text-okx-muted'
}

import type { CSSProperties } from 'react'

export function scoreGlowStyle(score: number): CSSProperties | undefined {
  if (score >= 70) {
    return { textShadow: '0 0 24px #bcff2f55' }
  }
  if (score >= 50) {
    return { textShadow: '0 0 16px #e8b84a44' }
  }
  return undefined
}
