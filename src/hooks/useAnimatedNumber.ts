import { useEffect, useRef, useState } from 'react'

export function useAnimatedNumber(target: number, duration = 400) {
  const [display, setDisplay] = useState(target)
  const displayRef = useRef(target)

  useEffect(() => {
    const start = displayRef.current
    const diff = target - start
    if (diff === 0) return

    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(start + diff * eased)
      setDisplay(next)
      displayRef.current = next
      if (progress < 1) requestAnimationFrame(tick)
      else displayRef.current = target
    }

    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [target, duration])

  return display
}
