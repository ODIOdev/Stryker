import type { ReactNode } from 'react'

export type HighlightTone = 'lime' | 'cyan' | 'teal' | 'violet' | 'amber' | 'rose' | 'none'

const toneClass: Record<HighlightTone, string> = {
  lime: 'text-okx-lime',
  cyan: 'text-okx-cyan',
  teal: 'text-okx-teal',
  violet: 'text-okx-violet',
  amber: 'text-okx-amber',
  rose: 'text-okx-rose',
  none: 'text-okx-text',
}

interface DottedRowProps {
  label: string
  value: string
  highlight?: boolean
  tone?: HighlightTone
  onClick?: () => void
  trailing?: ReactNode
}

export function DottedRow({
  label,
  value,
  highlight,
  tone = 'cyan',
  onClick,
  trailing,
}: DottedRowProps) {
  const Wrapper = onClick ? 'button' : 'div'
  const valueClass = highlight ? toneClass[tone] : 'text-okx-text'

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-2 text-sm ${
        onClick ? 'cursor-pointer rounded-lg py-1.5 text-left transition-colors hover:bg-okx-hover' : 'py-1'
      }`}
    >
      <span className="shrink-0 text-okx-muted">{label}</span>
      <span
        className="min-w-[20px] flex-1 border-b border-dotted border-okx-border"
        aria-hidden
      />
      <span className={`shrink-0 tabular-nums ${highlight ? `font-medium ${valueClass}` : 'text-okx-text'}`}>
        {value}
      </span>
      {trailing}
    </Wrapper>
  )
}
