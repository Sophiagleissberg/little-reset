import { cx } from '../../lib/format'

interface Props {
  done: number
  total: number
  className?: string
}

/**
 * Progress reads as a row of segments, one per habit, rather than a percentage.
 * Four things done out of six is easier to feel than sixty seven percent.
 */
export function Progress({ done, total, className }: Props) {
  if (total === 0) return null
  return (
    <div className={cx('flex items-center gap-1.5', className)} aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cx(
            'h-[3px] flex-1 rounded-full transition-colors duration-500 ease-out',
            i < done ? 'bg-care' : 'bg-rule'
          )}
        />
      ))}
    </div>
  )
}
