interface ToggleProps {
  checked: boolean
  onChange: () => void
  id?: string
  'aria-label'?: string
}

export function Toggle({ checked, onChange, id, 'aria-label': ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 ease-out ${
        checked ? 'bg-okx-lime' : 'bg-okx-border'
      }`}
    >
      <span
        className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-black shadow-sm transition-transform duration-200 ease-out will-change-transform"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  )
}
