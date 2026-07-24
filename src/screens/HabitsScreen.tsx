import { useMemo, useState } from 'react'
import { HabitEditor } from '../components/habits/HabitEditor'
import type { HabitDraft } from '../components/habits/HabitEditor'
import { Button } from '../components/ui/Button'
import { useStore } from '../hooks/useStore'
import { formatReminder } from '../lib/date'
import { HABIT_COLOURS } from '../lib/reference'
import type { Habit } from '../types'

export function HabitsScreen() {
  const { state, addHabit, updateHabit, setArchived } = useStore()
  const [editing, setEditing] = useState<Habit | null>(null)
  const [creating, setCreating] = useState(false)

  const active = useMemo(() => state.habits.filter((h) => !h.archived), [state.habits])
  const archived = useMemo(() => state.habits.filter((h) => h.archived), [state.habits])

  const save = (draft: HabitDraft) => {
    if (editing) updateHabit(editing.id, draft)
    else addHabit(draft)
    setEditing(null)
    setCreating(false)
  }

  return (
    <div className="animate-rise">
      <header className="mb-8">
        <p className="eyebrow">Your list</p>
        <h1 className="mt-2.5 font-display text-[34px] leading-[1.08] tracking-[-0.02em]">Habits</h1>
      </header>

      {active.length === 0 ? (
        <p className="mb-6 text-[14px] text-soft">
          Nothing here yet. Add the first thing you want to hold onto.
        </p>
      ) : (
        <ul className="mb-8">
          {active.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onEdit={() => setEditing(habit)} />
          ))}
        </ul>
      )}

      <Button full size="lg" onClick={() => setCreating(true)}>
        New habit
      </Button>

      {archived.length > 0 ? (
        <section className="mt-12">
          <h2 className="eyebrow mb-3">Archived</h2>
          <ul>
            {archived.map((habit) => (
              <li key={habit.id} className="border-b border-rule last:border-b-0">
                <div className="flex items-center gap-3 py-4">
                  <span className="text-[16px] opacity-50" aria-hidden>
                    {habit.emoji}
                  </span>
                  <span className="flex-1 truncate text-[15px] text-faint">{habit.name}</span>
                  <button
                    onClick={() => setArchived(habit.id, false)}
                    className="text-[11px] uppercase tracking-[0.14em] text-soft active:text-ink"
                  >
                    Restore
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <HabitEditor
        open={creating || editing !== null}
        habit={editing}
        onClose={() => {
          setEditing(null)
          setCreating(false)
        }}
        onSave={save}
        onArchive={
          editing
            ? () => {
                setArchived(editing.id, true)
                setEditing(null)
              }
            : undefined
        }
      />
    </div>
  )
}

function HabitCard({ habit, onEdit }: { habit: Habit; onEdit: () => void }) {
  const colour = HABIT_COLOURS[habit.colour]
  const reminder = formatReminder(habit.reminderTime)
  const meta = [
    habit.frequency === 'daily' ? 'Daily' : habit.frequency === 'weekly' ? 'Weekly' : 'Monthly',
    reminder,
    habit.timerMinutes ? `${habit.timerMinutes} min timer` : null,
  ].filter(Boolean)

  return (
    <li className="mb-2.5">
      <button
        onClick={onEdit}
        className="sheet-surface flex w-full items-center gap-4 px-5 py-4 text-left
                   transition-transform duration-150 ease-out active:scale-[0.99]"
      >
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[18px]"
          style={{ backgroundColor: colour.wash }}
          aria-hidden
        >
          {habit.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] text-ink">{habit.name}</span>
          <span className="mt-1 block truncate text-[12px] text-faint">{meta.join(' · ')}</span>
        </span>
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="shrink-0" aria-hidden>
          <path d="M1 1l5 5-5 5" stroke="#9AA29B" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  )
}
