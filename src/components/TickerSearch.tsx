import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { TICKERS, findTicker, type Ticker } from '../data/tickers'

interface TickerSearchProps {
  ticker: Ticker
  onSelect: (ticker: Ticker) => void
  compact?: boolean
}

export function TickerSearch({ ticker, onSelect, compact }: TickerSearchProps) {
  const [query, setQuery] = useState(ticker.symbol)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const match = findTicker(query) ?? filtered[0]
    if (match) {
      onSelect(match)
      setQuery(match.symbol)
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} className="relative w-full">
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
            autoComplete="off"
          />
        </div>
      </form>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-okx-border bg-okx-card py-1 shadow-2xl"
            role="listbox"
          >
            {filtered.map((t) => (
              <li key={t.symbol}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-okx-hover ${
                    t.symbol === ticker.symbol ? 'text-okx-cyan' : 'text-okx-text'
                  }`}
                  onClick={() => {
                    onSelect(t)
                    setQuery(t.symbol)
                    setOpen(false)
                  }}
                >
                  <span>{t.name}</span>
                  <span className="text-okx-muted">{t.symbol}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
