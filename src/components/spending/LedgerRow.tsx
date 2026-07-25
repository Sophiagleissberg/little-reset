import { formatShortDate, formatTime } from '../../lib/date'
import { money } from '../../lib/format'
import { categoryOf } from '../../lib/reference'
import type { Transaction } from '../../types'

interface Props {
  expense: Transaction
  showDate?: boolean
  onDelete?: () => void
}

/** A line in the ledger: label on the left, leader dots, amount on the right. */
export function LedgerRow({ expense, showDate, onDelete }: Props) {
  const category = categoryOf(expense.category)
  const label = expense.note || category.label

  return (
    <li className="group border-b border-rule last:border-b-0">
      <div className="flex items-baseline py-3.5">
        <span className="text-[15px] leading-none" aria-hidden>
          {category.emoji}
        </span>
        <span className="ml-3 min-w-0">
          <span className="block truncate text-[15px] text-ink">{label}</span>
          <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-faint">
            {showDate ? formatShortDate(expense.date) : formatTime(expense.timestamp)}
            {expense.note ? ` · ${category.label}` : ''}
          </span>
        </span>
        <span className="leader" aria-hidden />
        <span className="tnum shrink-0 text-[15px] text-ink">{money(expense.amount)}</span>
        {onDelete ? (
          <button
            onClick={onDelete}
            aria-label={`Remove ${label}`}
            className="ml-3 shrink-0 text-[11px] uppercase tracking-[0.14em] text-faint active:text-ink"
          >
            Undo
          </button>
        ) : null}
      </div>
    </li>
  )
}
