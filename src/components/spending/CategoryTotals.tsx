import { money } from '../../lib/format'
import { categoryOf } from '../../lib/reference'
import type { CategoryTotal } from '../../lib/selectors'

/** Sorted biggest first, so the answer to "where did it go" is the first line. */
export function CategoryTotals({ totals }: { totals: CategoryTotal[] }) {
  if (totals.length === 0) {
    return <p className="py-4 text-[14px] text-faint">Nothing recorded this week yet.</p>
  }

  return (
    <ul>
      {totals.map((row) => {
        const category = categoryOf(row.category)
        return (
          <li key={row.category} className="border-b border-rule last:border-b-0">
            <div className="flex items-baseline py-3.5">
              <span className="text-[14px] leading-none" aria-hidden>
                {category.emoji}
              </span>
              <span className="ml-3 text-[15px] text-ink">{category.label}</span>
              <span className="leader" aria-hidden />
              <span className="tnum text-[15px] text-ink">{money(row.total)}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
