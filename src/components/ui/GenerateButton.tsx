import { useRef, useState } from 'react'

interface GenerateButtonProps {
  onClick?: () => void
  className?: string
}

export function GenerateButton({ onClick, className = '' }: GenerateButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [hovering, setHovering] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const handleMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`group relative w-auto shrink-0 overflow-hidden rounded-lg border border-okx-lime/60 bg-okx-lime px-3.5 py-2 text-xs font-semibold text-black shadow-[0_0_20px_rgba(188,255,47,0.35)] transition-[box-shadow,border-color] duration-300 hover:border-okx-lime hover:shadow-[0_0_28px_rgba(188,255,47,0.5)] ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: hovering ? 1 : 0,
          background: `radial-gradient(circle 100px at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.5), transparent 70%)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span className="relative z-10 tracking-wide">Generate</span>
    </button>
  )
}
