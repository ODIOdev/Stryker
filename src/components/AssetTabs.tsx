import { motion } from 'framer-motion'

const TABS = ['Chart', 'Scoreboard', 'Performance', 'Journal']

interface AssetTabsProps {
  active: string
  onChange: (tab: string) => void
}

export function AssetTabs({ active, onChange }: AssetTabsProps) {
  return (
    <div className="flex gap-6 overflow-x-auto border-b border-okx-border" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={`relative shrink-0 pb-3 text-sm font-medium transition-colors ${
            active === tab ? 'text-okx-text' : 'text-okx-muted hover:text-okx-subtle'
          }`}
        >
          {tab}
          {active === tab && (
            <motion.span
              layoutId="asset-tab"
              className="absolute right-0 bottom-0 left-0 h-0.5 bg-okx-lime"
            />
          )}
        </button>
      ))}
    </div>
  )
}
