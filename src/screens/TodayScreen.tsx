import { useMemo } from 'react'
import { HabitLine } from '../components/habits/HabitLine'
import { Progress } from '../components/ui/Progress'
import { useStore } from '../hooks/useStore'
import { formatLongDate, greeting, todayKey } from '../lib/date'
import { moneyLoose, money } from '../lib/format'
import {
  dayProgress,
  getCompletionCount,
  isDoneOn,
  isSubtaskDoneOn,
  spentThisWeek,
  spentToday,
  todaysHabits,
} from '../lib/selectors'
import type { Habit } from '../types'

interface Props {
  onStartTimer: (habit: Habit) => void
  onOpenHabits: () => void
  onOpenSpending: () => void
  onOpenSettings: () => void
}

export function TodayScreen({ onStartTimer, onOpenHabits, onOpenSpending, onOpenSettings }: Props) {
  const { state, toggleHabit, decrementHabit, toggleSubtask } = useStore()
  const today = todayKey()

  const list = useMemo(
    () => todaysHabits(state.habits, state.completions),
    [state.habits, state.completions]
  )
  const progress = useMemo(
    () => dayProgress(state.habits, state.completions),
    [state.habits, state.completions]
  )
  const day = spentToday(state.transactions)
  const week = spentThisWeek(state.transactions)

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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">{greeting()}</p>
            <h1 className="mt-2.5 font-display text-[34px] leading-[1.08] tracking-[-0.02em]">
              {formatLongDate()}
            </h1>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-soft active:bg-white/70 active:text-ink"
          >
            <SettingsIcon />
          </button>
        </div>
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
                done={isDoneOn(state.completions, habit, today)}
                count={getCompletionCount(state.completions, habit.id, today)}
                onToggle={() => toggleHabit(habit.id)}
                onDecrement={() => decrementHabit(habit.id)}
                completedSubtaskIds={(habit.subtasks ?? [])
                  .filter((s) =>
                    isSubtaskDoneOn(state.subtaskCompletions, habit.id, s.id, today)
                  )
                  .map((s) => s.id)}
                onToggleSubtask={(subtaskId) => toggleSubtask(habit.id, subtaskId)}
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
              {day === 0 ? money(0) : moneyLoose(day)}
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

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M19.4 13.5a7.6 7.6 0 0 0 .05-1.5l2.05-1.6-2-3.46-2.45.7a7.7 7.7 0 0 0-1.3-.75L15.5 2h-7l-.25 2.89c-.46.2-.9.46-1.3.75l-2.45-.7-2 3.46L4.55 12a7.6 7.6 0 0 0 0 1.5l-2.05 1.6 2 3.46 2.45-.7c.4.29.84.55 1.3.75L8.5 22h7l.25-2.89c.46-.2.9-.46 1.3-.75l2.45.7 2-3.46-2.1-1.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
