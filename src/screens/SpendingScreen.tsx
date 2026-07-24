import { useMemo } from 'react'
import { CategoryTotals } from '../components/spending/CategoryTotals'
import { LedgerRow } from '../components/spending/LedgerRow'
import { useStore } from '../hooks/useStore'
import { isToday } from '../lib/date'
import { money, moneyLoose } from '../lib/format'
import { recent, spentThisWeek, spentToday, weekByCategory } from '../lib/selectors'

export function SpendingScreen() {
  const { state, deleteExpense } = useStore()
  const day = spentToday(state.expenses)
  const week = spentThisWeek(state.expenses)
  const totals = useMemo(() => weekByCategory(state.expenses), [state.expenses])
  const latest = useMemo(() => recent(state.expenses, 14), [state.expenses])

  return (
    <div className="animate-rise">
      <header className="mb-8">
        <p className="eyebrow">Where it went</p>
        <h1 className="mt-2.5 font-display text-[34px] leading-[1.08] tracking-[-0.02em]">Spending</h1>
      </header>

      <section className="sheet-surface mb-10 px-6 py-6">
        <div className="flex items-baseline">
          <p className="eyebrow">Today</p>
          <span className="leader" aria-hidden />
          <p className="tnum font-display text-[34px] leading-none tracking-[-0.02em]">
            {moneyLoose(day)}
          </p>
        </div>
        <div className="mt-4 flex items-baseline border-t border-rule pt-4">
          <p className="eyebrow">This week</p>
          <span className="leader" aria-hidden />
          <p className="tnum text-[15px]">{money(week)}</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-[19px] tracking-[-0.01em] mb-3">This week by category</h2>
        <CategoryTotals totals={totals} />
      </section>

      <section>
        <h2 className="font-display text-[19px] tracking-[-0.01em] mb-3">Recent</h2>
        {latest.length === 0 ? (
          <p className="py-4 text-[14px] text-faint">
            Nothing recorded yet. Tap the plus to add the first one.
          </p>
        ) : (
          <ul>
            {latest.map((expense) => (
              <LedgerRow
                key={expense.id}
                expense={expense}
                showDate={!isToday(expense.spentAt)}
                onDelete={() => deleteExpense(expense.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
