import type { CSSProperties } from 'react'

/** Full heat-map spectrum aligned with QualityMeter segments. */
export function scoreAccentColor(score: number): string {
  if (score >= 85) return '#bcff2f'
  if (score >= 70) return '#d4ff5c'
  if (score >= 55) return '#e8b84a'
  if (score >= 40) return '#ff8a5b'
  return '#ff5b5b'
}

export function scoreHeatBg(score: number, alpha = 0.12): string {
  const color = scoreAccentColor(score)
  const hex = color.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function scoreHeatBorder(score: number, alpha = 0.35): string {
  const color = scoreAccentColor(score)
  const hex = color.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function scoreTextClass(score: number): string {
  if (score >= 85) return 'text-okx-lime'
  if (score >= 70) return 'text-okx-lime'
  if (score >= 55) return 'text-okx-amber'
  if (score >= 40) return 'text-orange-400'
  return 'text-down'
}

export function scoreGlowStyle(score: number): CSSProperties | undefined {
  const color = scoreAccentColor(score)
  if (score >= 70) {
    return { textShadow: `0 0 24px ${color}55` }
  }
  if (score >= 40) {
    return { textShadow: `0 0 16px ${color}44` }
  }
  if (score >= 25) {
    return { textShadow: `0 0 12px ${color}33` }
  }
  return undefined
}
