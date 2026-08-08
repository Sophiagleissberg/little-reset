import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { Field, inputClass } from '../ui/Field'
import { Sheet } from '../ui/Sheet'
import { COLOUR_KEYS, EMOJI_CHOICES, FREQUENCIES, HABIT_COLOURS } from '../../lib/reference'
import { cx } from '../../lib/format'
import { clampDailyTarget } from '../../lib/habits'
import type { Frequency, Habit, HabitColour } from '../../types'

export interface HabitDraft {
  name: string
  emoji: string
  colour: HabitColour
  frequency: Frequency
  reminderTime: string | null
  timerMinutes: number | null
  dailyTarget: number
}

const BLANK: HabitDraft = {
  name: '',
  emoji: '🌿',
  colour: 'sage',
  frequency: 'daily',
  reminderTime: null,
  timerMinutes: null,
  dailyTarget: 1,
}

const TIMER_CHOICES = [null, 5, 10, 15, 20, 30]
const TARGET_PRESETS = [1, 2, 3, 5, 8] as const

function targetLabel(n: number): string {
  return n === 1 ? 'Once' : `${n} times`
}

interface Props {
  open: boolean
  habit: Habit | null
  onClose: () => void
  onSave: (draft: HabitDraft) => void
  onArchive?: () => void
  onRestore?: () => void
}

export function HabitEditor({ open, habit, onClose, onSave, onArchive, onRestore }: Props) {
  const [draft, setDraft] = useState<HabitDraft>(BLANK)
  const [customTarget, setCustomTarget] = useState(false)

  useEffect(() => {
    if (!open) return
    if (habit) {
      const dailyTarget = clampDailyTarget(habit.dailyTarget, 1)
      setDraft({
        name: habit.name,
        emoji: habit.emoji,
        colour: habit.colour,
        frequency: habit.frequency,
        reminderTime: habit.reminderTime,
        timerMinutes: habit.timerMinutes,
        dailyTarget,
      })
      setCustomTarget(
        habit.frequency === 'daily' && !(TARGET_PRESETS as readonly number[]).includes(dailyTarget)
      )
    } else {
      setDraft(BLANK)
      setCustomTarget(false)
    }
  }, [open, habit])

  const set = <K extends keyof HabitDraft>(key: K, value: HabitDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const canSave = draft.name.trim().length > 0
  const showTarget = draft.frequency === 'daily'
  const presetSelected = showTarget && !customTarget

  const selectPreset = (n: number) => {
    setCustomTarget(false)
    set('dailyTarget', n)
  }

  const selectCustom = () => {
    setCustomTarget(true)
    setDraft((d) => ({
      ...d,
      dailyTarget: (TARGET_PRESETS as readonly number[]).includes(d.dailyTarget)
        ? 2
        : clampDailyTarget(d.dailyTarget, 2),
    }))
  }

  const onCustomChange = (raw: string) => {
    if (raw === '') {
      set('dailyTarget', 2)
      return
    }
    const n = Number(raw)
    if (!Number.isFinite(n)) return
    set('dailyTarget', clampDailyTarget(Math.max(2, n), 2))
  }

  const handleSave = () => {
    const dailyTarget =
      draft.frequency === 'daily' ? clampDailyTarget(draft.dailyTarget, 1) : 1
    onSave({ ...draft, dailyTarget })
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={habit ? 'Edit habit' : 'New habit'}
      bodyClassName="habit-editor-scroll"
      footer={
        <div className="space-y-3">
          <Button full size="lg" disabled={!canSave} onClick={handleSave}>
            {habit ? 'Save changes' : 'Add habit'}
          </Button>
          {habit && onArchive ? (
            <Button full variant="quiet" onClick={onArchive}>
              Archive habit
            </Button>
          ) : null}
          {habit && onRestore ? (
            <Button full variant="quiet" onClick={onRestore}>
              Bring it back
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-7 pt-2">
        <Field label="What is it">
          <input
            className={inputClass}
            value={draft.name}
            autoFocus={!habit}
            placeholder="Ten quiet minutes"
            onChange={(e) => set('name', e.target.value)}
          />
        </Field>

        <div>
          <span className="eyebrow mb-3 block">Emoji</span>
          <div className="grid grid-cols-8 gap-1.5">
            {EMOJI_CHOICES.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => set('emoji', emoji)}
                className={cx(
                  'grid aspect-square place-items-center rounded-xl border text-[18px]',
                  'transition-transform duration-150 active:scale-90',
                  draft.emoji === emoji ? 'border-ink bg-white' : 'border-transparent bg-white/60'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="eyebrow mb-3 block">Colour</span>
          <div className="flex gap-2.5">
            {COLOUR_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-label={HABIT_COLOURS[key].label}
                onClick={() => set('colour', key)}
                style={{ backgroundColor: HABIT_COLOURS[key].wash }}
                className={cx(
                  'h-10 w-10 rounded-full transition-transform duration-150 active:scale-90',
                  draft.colour === key ? 'ring-2 ring-ink ring-offset-2 ring-offset-sheet' : ''
                )}
              >
                <span
                  className="mx-auto block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: HABIT_COLOURS[key].ink }}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="eyebrow mb-3 block">How often</span>
          <div className="flex gap-2">
            {FREQUENCIES.map((f) => (
              <Chip
                key={f.id}
                selected={draft.frequency === f.id}
                onClick={() => {
                  set('frequency', f.id)
                  if (f.id !== 'daily') {
                    setCustomTarget(false)
                    set('dailyTarget', 1)
                  }
                }}
              >
                {f.label}
              </Chip>
            ))}
          </div>
          <p className="mt-2.5 text-[12px] text-faint">
            {FREQUENCIES.find((f) => f.id === draft.frequency)?.note}
          </p>
        </div>

        {showTarget ? (
          <div>
            <span className="eyebrow mb-3 block">Daily target</span>
            <div className="flex flex-wrap gap-2">
              {TARGET_PRESETS.map((n) => (
                <Chip
                  key={n}
                  selected={presetSelected && draft.dailyTarget === n}
                  onClick={() => selectPreset(n)}
                >
                  {targetLabel(n)}
                </Chip>
              ))}
              <Chip selected={customTarget} onClick={selectCustom}>
                Custom
              </Chip>
            </div>
            {customTarget ? (
              <div className="mt-3">
                <input
                  type="number"
                  inputMode="numeric"
                  min={2}
                  max={99}
                  step={1}
                  className={inputClass}
                  value={draft.dailyTarget}
                  onChange={(e) => onCustomChange(e.target.value)}
                  aria-label="Custom daily target"
                />
                <p className="mt-2 text-[12px] text-faint">Whole number from 2 to 99.</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <Field label="Reminder time" hint="Saved with the habit as a note to yourself. Nothing pings you.">
          <input
            type="time"
            className={inputClass}
            value={draft.reminderTime ?? ''}
            onChange={(e) => set('reminderTime', e.target.value || null)}
          />
        </Field>

        <div>
          <span className="eyebrow mb-3 block">Timer</span>
          <div className="flex flex-wrap gap-2">
            {TIMER_CHOICES.map((mins) => (
              <Chip
                key={String(mins)}
                selected={draft.timerMinutes === mins}
                onClick={() => set('timerMinutes', mins)}
              >
                {mins === null ? 'None' : `${mins} min`}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  )
}
