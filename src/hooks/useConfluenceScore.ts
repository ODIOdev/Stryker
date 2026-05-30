import { useMemo, useState } from 'react'
import { CONFLUENCE_FACTORS, scoreToRating } from '../data/confluence'

export interface FactorState {
  checked: boolean
  weight: number
}

export function useConfluenceScore() {
  const [factors, setFactors] = useState<Record<string, FactorState>>(() =>
    Object.fromEntries(
      CONFLUENCE_FACTORS.map((f) => [
        f.id,
        { checked: f.id === 'trend' || f.id === 'level' || f.id === 'rsi', weight: f.defaultWeight },
      ])
    )
  )

  const { earned, maxPossible, score } = useMemo(() => {
    let earned = 0
    let maxPossible = 0
    for (const f of CONFLUENCE_FACTORS) {
      const state = factors[f.id]
      if (!state) continue
      maxPossible += state.weight
      if (state.checked) earned += state.weight
    }
    const score = maxPossible > 0 ? Math.round((earned / maxPossible) * 100) : 0
    return { earned, maxPossible, score }
  }, [factors])

  const rating = useMemo(() => scoreToRating(score), [score])

  const toggle = (id: string) => {
    setFactors((prev) => ({
      ...prev,
      [id]: { ...prev[id], checked: !prev[id]?.checked },
    }))
  }

  const setWeight = (id: string, weight: number) => {
    setFactors((prev) => ({
      ...prev,
      [id]: { ...prev[id], weight },
    }))
  }

  return { factors, earned, maxPossible, score, rating, toggle, setWeight }
}
