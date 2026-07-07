import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search } from 'lucide-react'
import { TICKERS, findTicker, type Ticker } from '../data/tickers'

interface TickerSearchProps {
  ticker: Ticker
  onSelect: (ticker: Ticker) => void
  compact?: boolean
}

interface DropdownRect {
  top: number
  left: number
  width: number
}

export function TickerSearch({ ticker, onSelect, compact }: TickerSearchProps) {
  const [query, setQuery] = useState(ticker.symbol)
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DropdownRect | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    setQuery(ticker.symbol)
  }, [ticker.symbol])

  const filtered = query.trim()
    ? TICKERS.filter(
        (t) =>
          t.symbol.toLowerCase().includes(query.toLowerCase()) ||
          t.name.toLowerCase().includes(query.toLowerCase())
      )
    : TICKERS

  const updateRect = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const box = el.getBoundingClientRect()
    setRect({
      top: box.bottom + 8,
      left: box.left,
      width: box.width,
    })
  }, [])

  useEffect(() => {
    if (!open) return
    updateRect()
    const onScrollOrResize = () => updateRect()
    window.addEventListener('resize', onScrollOrResize)
    window.addEventListener('scroll', onScrollOrResize, true)
    return () => {
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
    }
  }, [open, updateRect])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (wrapRef.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const selectTicker = (t: Ticker) => {
    onSelect(t)
    setQuery(t.symbol)
    setOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const match = findTicker(query) ?? filtered[0]
    if (match) selectTicker(match)
  }

  const dropdown =
    open && filtered.length > 0 && rect
      ? createPortal(
          <AnimatePresence>
            <motion.ul
              ref={listRef}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              id="ticker-search-listbox"
              className="fixed z-[9999] max-h-72 overflow-y-auto rounded-xl border border-okx-border bg-okx-card py-1 shadow-2xl"
              style={{ top: rect.top, left: rect.left, width: rect.width }}
              role="listbox"
            >
              {filtered.map((t) => (
                <li key={t.symbol} role="option" aria-selected={t.symbol === ticker.symbol}>
                  <button
                    type="button"
                    className={`flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-okx-hover ${
                      t.symbol === ticker.symbol ? 'text-okx-cyan' : 'text-okx-text'
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectTicker(t)}
                  >
                    <span>{t.name}</span>
                    <span className="text-okx-muted">{t.symbol}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>,
          document.body
        )
      : null

  return (
    <div ref={wrapRef} className="relative z-[60] w-full">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center gap-2 rounded-xl bg-okx-card transition-all focus-within:ring-1 focus-within:ring-okx-cyan/40 ${
            compact ? 'px-3 py-2' : 'px-4 py-2.5'
          }`}
        >
          <Search className="h-4 w-4 shrink-0 text-okx-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search"
            className="w-full bg-transparent text-sm text-okx-text outline-none placeholder:text-okx-muted"
            aria-label="Search ticker"
            aria-expanded={open}
            aria-controls="ticker-search-listbox"
            autoComplete="off"
          />
        </div>
      </form>
      {dropdown}
    </div>
  )
}
