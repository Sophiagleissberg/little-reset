import { useTimer } from '../../hooks/useTimer'
import { clockFace } from '../../lib/format'
import { HABIT_COLOURS } from '../../lib/reference'
import type { Habit } from '../../types'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Sheet'

interface Props {
  habit: Habit | null
  onClose: () => void
  onFinish: (habitId: string) => void
}

const SIZE = 232
const STROKE = 3
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function TimerSheet({ habit, onClose, onFinish }: Props) {
  if (!habit || !habit.timerMinutes) return null
  return <TimerBody habit={habit} minutes={habit.timerMinutes} onClose={onClose} onFinish={onFinish} />
}

function TimerBody({
  habit,
  minutes,
  onClose,
  onFinish,
}: {
  habit: Habit
  minutes: number
  onClose: () => void
  onFinish: (habitId: string) => void
}) {
  const colour = HABIT_COLOURS[habit.colour]
  const timer = useTimer(minutes, () => onFinish(habit.id))
  const offset = CIRCUMFERENCE * (1 - timer.progress)

  return (
    <Sheet open onClose={onClose}>
      <div className="pb-4 pt-2 text-center">
        <p className="eyebrow">{habit.emoji} {habit.name}</p>

        <div className="relative mx-auto mt-8" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#DCE0D8"
              strokeWidth={STROKE}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={colour.ink}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 220ms linear' }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div>
              <p className="tnum font-display text-[56px] leading-none tracking-[-0.02em]">
                {clockFace(timer.remaining)}
              </p>
              <p className="mt-2 text-[12px] uppercase tracking-[0.18em] text-faint">
                {timer.status === 'finished'
                  ? 'Done'
                  : timer.status === 'running'
                    ? 'Counting down'
                    : timer.status === 'paused'
                      ? 'Paused'
                      : `${minutes} minutes`}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-9 flex items-center justify-center gap-3">
          {timer.status === 'finished' ? (
            <Button size="lg" onClick={onClose}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="quiet" size="lg" onClick={timer.reset} disabled={timer.status === 'idle'}>
                Reset
              </Button>
              {timer.status === 'running' ? (
                <Button size="lg" onClick={timer.pause}>
                  Pause
                </Button>
              ) : (
                <Button size="lg" onClick={timer.start}>
                  {timer.status === 'paused' ? 'Resume' : 'Start'}
                </Button>
              )}
            </>
          )}
        </div>

        <p className="mt-6 text-[12px] text-faint">
          {timer.status === 'finished'
            ? 'Ticked off for today.'
            : 'Finishing the timer ticks this off for you.'}
        </p>
      </div>
    </Sheet>
  )
}
