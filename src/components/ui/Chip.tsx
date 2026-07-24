import type { ReactNode } from 'react'
import { cx } from '../../lib/format'

interface Props {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  tint?: string
}

export function Chip({ selected, onClick, children, tint }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={selected && tint ? { backgroundColor: tint, borderColor: tint } : undefined}
      className={cx(
        'h-10 px-4 rounded-full border text-[13px] font-medium whitespace-nowrap',
        'transition-all duration-150 ease-out active:scale-[0.96]',
        selected ? 'bg-ink text-paper border-ink' : 'bg-white text-soft border-rule',
        selected && tint && 'text-ink'
      )}
    >
      {children}
    </button>
  )
}
