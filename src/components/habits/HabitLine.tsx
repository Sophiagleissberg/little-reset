import { cx } from '../../lib/format'
import { HABIT_COLOURS } from '../../lib/reference'
import type { Habit } from '../../types'

interface Props {
  habit: Habit
  done: boolean
  onToggle: () => void
  onStartTimer?: () => void
}

/**
 * One ruled line of the day sheet. The whole row is the tick target, so a
 * single tap anywhere marks it off.
 */
export function HabitLine({ habit, done, onToggle, onStartTimer }: Props) {
  const colour = HABIT_COLOURS[habit.colour]

  return (
    <li className="border-b border-rule last:border-b-0">
      <div className="flex items-center gap-3 py-1">
        <button
          onClick={onToggle}
          aria-pressed={done}
          className="group flex flex-1 items-center gap-3.5 py-3 text-left"
        >
          <span
            className={cx(
              'tick-box relative grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ease-out',
              done ? 'tick-on border-transparent' : 'border-rule bg-white'
            )}
            style={done ? { backgroundColor: colour.wash } : undefined}
          >
            {done ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  className="tick-path"
                  d="M3.5 8.4l3 3 6-6.4"
                  stroke={colour.ink}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </span>

          <span className="text-[17px] leading-none" aria-hidden>
            {habit.emoji}
          </span>

          <span className="min-w-0 flex-1">
            <span
              className={cx(
                'block truncate text-[15px] transition-colors duration-300',
                done ? 'text-faint line-through decoration-rule' : 'text-ink'
              )}
            >
              {habit.name}
            </span>
            {habit.frequency !== 'daily' ? (
              <span className="mt-0.5 block text-[11px] uppercase tracking-[0.14em] text-faint">
                {habit.frequency === 'weekly' ? 'This week' : 'This month'}
              </span>
            ) : null}
          </span>
        </button>

        {habit.timerMinutes && !done && onStartTimer ? (
          <button
            onClick={onStartTimer}
            className="shrink-0 h-8 rounded-full border border-rule bg-white px-3.5 text-[12px] font-medium text-soft
                       transition-transform duration-150 active:scale-95"
          >
            Start {habit.timerMinutes}m
          </button>
        ) : null}
      </div>
    </li>
  )
}
