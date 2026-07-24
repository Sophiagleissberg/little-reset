import { useMemo } from 'react'
import { HabitLine } from '../components/habits/HabitLine'
import { Progress } from '../components/ui/Progress'
import { useStore } from '../hooks/useStore'
import { formatLongDate, greeting, todayKey } from '../lib/date'
import { moneyLoose, money } from '../lib/format'
import { dayProgress, isDoneOn, spentThisWeek, spentToday, todaysHabits } from '../lib/selectors'
import type { Habit } from '../types'

interface Props {
  onStartTimer: (habit: Habit) => void
  onOpenHabits: () => void
  onOpenSpending: () => void
}

export function TodayScreen({ onStartTimer, onOpenHabits, onOpenSpending }: Props) {
  const { state, toggleHabit } = useStore()
  const today = todayKey()

  const list = useMemo(
    () => todaysHabits(state.habits, state.completions),
    [state.habits, state.completions]
  )
  const progress = useMemo(
    () => dayProgress(state.habits, state.completions),
    [state.habits, state.completions]
  )
  const day = spentToday(state.expenses)
  const week = spentThisWeek(state.expenses)

  const line =
    progress.total === 0
      ? 'Nothing on the list yet'
      : progress.done === 0
        ? 'Nothing ticked off yet, and that is fine'
        : progress.done === progress.total
          ? 'That is the whole list. Go and enjoy your evening'
          : `${progress.done} of ${progress.total} looked after`

  return (
    <div className="animate-rise">
      <header className="mb-9">
        <p className="eyebrow">{greeting()}</p>
        <h1 className="mt-2.5 font-display text-[34px] leading-[1.08] tracking-[-0.02em]">
          {formatLongDate()}
        </h1>
      </header>

      <section className="mb-10">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-[19px] tracking-[-0.01em]">Looking after yourself</h2>
          <span className="tnum text-[12px] uppercase tracking-[0.14em] text-faint">
            {progress.done}/{progress.total}
          </span>
        </div>

        <Progress done={progress.done} total={progress.total} className="mb-1" />

        {list.length === 0 ? (
          <button
            onClick={onOpenHabits}
            className="mt-6 w-full rounded-card border border-dashed border-rule bg-white/50 px-6 py-8 text-left"
          >
            <p className="font-display text-[18px]">Start with one small thing</p>
            <p className="mt-1.5 text-[14px] text-soft">
              A glass of water. Ten minutes outside. Tap here to add it.
            </p>
          </button>
        ) : (
          <ul className="mt-2">
            {list.map((habit) => (
              <HabitLine
                key={habit.id}
                habit={habit}
                done={isDoneOn(state.completions, habit.id, today)}
                onToggle={() => toggleHabit(habit.id)}
                onStartTimer={habit.timerMinutes ? () => onStartTimer(habit) : undefined}
              />
            ))}
          </ul>
        )}

        <p className="mt-5 text-[13px] text-soft">{line}</p>
      </section>

      <section>
        <button onClick={onOpenSpending} className="block w-full text-left">
          <div className="sheet-surface px-6 py-6">
            <div className="flex items-baseline">
              <p className="eyebrow">Spent today</p>
              <span className="leader" aria-hidden />
              <p className="tnum text-[11px] uppercase tracking-[0.14em] text-faint">
                {money(week)} this week
              </p>
            </div>
            <p className="tnum mt-3 font-display text-[42px] leading-none tracking-[-0.02em]">
              {moneyLoose(day)}
            </p>
            <p className="mt-3 text-[13px] text-soft">
              {day === 0 ? 'Nothing recorded yet today.' : 'Tap to see where it went.'}
            </p>
          </div>
        </button>
      </section>
    </div>
  )
}
