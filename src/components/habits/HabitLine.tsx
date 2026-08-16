import { cx } from '../../lib/format'
import { habitHasSubtasks, habitTarget, listedSubtasks } from '../../lib/habits'
import { HABIT_COLOURS } from '../../lib/reference'
import type { Habit } from '../../types'

interface Props {
  habit: Habit
  done: boolean
  count: number
  onToggle: () => void
  onDecrement?: () => void
  onStartTimer?: () => void
  completedSubtaskIds?: readonly string[]
  onToggleSubtask?: (subtaskId: string) => void
}

/**
 * One ruled line of the day sheet.
 * Target-1 habits: the whole row toggles complete.
 * Multi-target habits: the main control increments; the count / minus decrements.
 * Checklist habits: subtasks are the only completion controls; the parent tick is display-only.
 */
export function HabitLine({
  habit,
  done,
  count,
  onToggle,
  onDecrement,
  onStartTimer,
  completedSubtaskIds,
  onToggleSubtask,
}: Props) {
  const colour = HABIT_COLOURS[habit.colour]
  const target = habitTarget(habit)
  const multi = target > 1
  const displayCount = Math.min(count, target)
  const steps = habitHasSubtasks(habit) ? listedSubtasks(habit) : []
  const checklist = steps.length > 0 && onToggleSubtask
  const doneIds = new Set(completedSubtaskIds ?? [])
  const stepDone = steps.filter((s) => doneIds.has(s.id)).length

  return (
    <li className="border-b border-rule last:border-b-0">
      <div className="flex items-center gap-2 py-1">
        {checklist ? (
          <div
            className="flex min-w-0 flex-1 items-center gap-3.5 py-3"
            role="group"
            aria-label={
              done
                ? `${habit.name}, ${stepDone} of ${steps.length}, completed`
                : `${habit.name}, ${stepDone} of ${steps.length}`
            }
          >
            <Tick done={done} colour={colour} />
            <ParentLabel habit={habit} done={done} />
          </div>
        ) : (
          <button
            onClick={onToggle}
            aria-pressed={done}
            aria-label={
              multi
                ? done
                  ? `${habit.name}, ${displayCount} of ${target}, completed`
                  : `${habit.name}, ${displayCount} of ${target}`
                : done
                  ? `${habit.name}, completed`
                  : habit.name
            }
            className="group flex min-w-0 flex-1 items-center gap-3.5 py-3 text-left"
          >
            <Tick done={done} colour={colour} />
            <ParentLabel habit={habit} done={done} />
          </button>
        )}

        {checklist ? (
          <span
            className={cx(
              'tnum flex h-11 min-w-[2.75rem] shrink-0 items-center justify-center px-1',
              'text-[13px] font-medium tabular-nums',
              done ? 'text-faint' : 'text-soft'
            )}
            aria-hidden
          >
            {stepDone}/{steps.length}
          </span>
        ) : null}

        {multi && onDecrement ? (
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={onDecrement}
              disabled={displayCount <= 0}
              aria-label={`Reduce ${habit.name} count`}
              className={cx(
                'grid h-11 w-11 place-items-center rounded-full text-soft',
                'transition-transform duration-150 active:scale-95',
                displayCount <= 0 ? 'opacity-30' : 'active:bg-white/70'
              )}
            >
              <span className="text-[22px] leading-none font-medium" aria-hidden>
                −
              </span>
            </button>
            <button
              type="button"
              onClick={onDecrement}
              disabled={displayCount <= 0}
              aria-label={`${displayCount} of ${target}, tap to reduce`}
              className={cx(
                'tnum flex h-11 min-w-[2.75rem] items-center justify-center px-1',
                'text-[13px] font-medium tabular-nums',
                done ? 'text-faint' : 'text-soft',
                displayCount <= 0 ? 'opacity-40' : ''
              )}
            >
              {displayCount}/{target}
            </button>
          </div>
        ) : null}

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

      {checklist ? (
        <ul className="pb-2 pl-[2.75rem]">
          {steps.map((step) => {
            const stepComplete = doneIds.has(step.id)
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => onToggleSubtask(step.id)}
                  aria-pressed={stepComplete}
                  aria-label={
                    stepComplete
                      ? `${habit.name}: ${step.title}, completed`
                      : `${habit.name}: ${step.title}`
                  }
                  className="flex min-h-11 w-full items-center gap-3 py-1.5 text-left active:opacity-80"
                >
                  <span
                    className={cx(
                      'tick-box relative grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all duration-300 ease-out',
                      stepComplete ? 'tick-on border-transparent' : 'border-rule bg-white'
                    )}
                    style={stepComplete ? { backgroundColor: colour.wash } : undefined}
                  >
                    {stepComplete ? (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
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
                  <span
                    className={cx(
                      'min-w-0 flex-1 text-[14px] leading-snug transition-colors duration-300',
                      stepComplete ? 'text-faint line-through decoration-rule' : 'text-ink'
                    )}
                  >
                    {step.title}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </li>
  )
}

function Tick({
  done,
  colour,
}: {
  done: boolean
  colour: { ink: string; wash: string }
}) {
  return (
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
  )
}

function ParentLabel({ habit, done }: { habit: Habit; done: boolean }) {
  return (
    <>
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
    </>
  )
}
