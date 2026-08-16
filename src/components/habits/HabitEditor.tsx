import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { Field, inputClass } from '../ui/Field'
import { Sheet } from '../ui/Sheet'
import { COLOUR_KEYS, EMOJI_CHOICES, FREQUENCIES, HABIT_COLOURS } from '../../lib/reference'
import { cx, id } from '../../lib/format'
import { clampDailyTarget } from '../../lib/habits'
import type { Frequency, Habit, HabitColour, HabitSubtask } from '../../types'

export interface HabitDraft {
  name: string
  emoji: string
  colour: HabitColour
  frequency: Frequency
  reminderTime: string | null
  timerMinutes: number | null
  dailyTarget: number
  subtasks: HabitSubtask[]
}

const BLANK: HabitDraft = {
  name: '',
  emoji: '🌿',
  colour: 'sage',
  frequency: 'daily',
  reminderTime: null,
  timerMinutes: null,
  dailyTarget: 1,
  subtasks: [],
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
      const subtasks = (habit.subtasks ?? []).map((s) => ({ id: s.id, title: s.title }))
      setDraft({
        name: habit.name,
        emoji: habit.emoji,
        colour: habit.colour,
        frequency: habit.frequency,
        reminderTime: habit.reminderTime,
        timerMinutes: habit.timerMinutes,
        dailyTarget,
        subtasks,
      })
      setCustomTarget(
        habit.frequency === 'daily' &&
          subtasks.length === 0 &&
          !(TARGET_PRESETS as readonly number[]).includes(dailyTarget)
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
  const hasDraftSteps = draft.subtasks.length > 0
  const quantityLocked = showTarget && draft.dailyTarget > 1
  const presetSelected = showTarget && !customTarget && !hasDraftSteps

  const selectPreset = (n: number) => {
    if (hasDraftSteps && n > 1) return
    setCustomTarget(false)
    set('dailyTarget', n)
  }

  const selectCustom = () => {
    if (hasDraftSteps) return
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

  const addSubtask = () => {
    if (quantityLocked) return
    setCustomTarget(false)
    setDraft((d) => ({
      ...d,
      dailyTarget: 1,
      subtasks: [...d.subtasks, { id: id('st'), title: '' }],
    }))
  }

  const updateSubtask = (subtaskId: string, title: string) => {
    setDraft((d) => ({
      ...d,
      subtasks: d.subtasks.map((s) => (s.id === subtaskId ? { ...s, title } : s)),
    }))
  }

  const removeSubtask = (subtaskId: string) => {
    setDraft((d) => ({ ...d, subtasks: d.subtasks.filter((s) => s.id !== subtaskId) }))
  }

  const handleSave = () => {
    if (showTarget && draft.dailyTarget > 1) {
      onSave({
        ...draft,
        dailyTarget: clampDailyTarget(draft.dailyTarget, 1),
        subtasks: habit?.subtasks ?? [],
      })
      return
    }
    const subtasks = draft.subtasks
      .map((s) => ({ id: s.id, title: s.title.trim() }))
      .filter((s) => s.title.length > 0)
    const dailyTarget =
      subtasks.length > 0
        ? 1
        : draft.frequency === 'daily'
          ? clampDailyTarget(draft.dailyTarget, 1)
          : 1
    onSave({ ...draft, dailyTarget, subtasks })
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
              {(hasDraftSteps ? ([1] as const) : TARGET_PRESETS).map((n) => (
                <Chip
                  key={n}
                  selected={(hasDraftSteps || presetSelected) && draft.dailyTarget === n}
                  onClick={() => selectPreset(n)}
                >
                  {targetLabel(n)}
                </Chip>
              ))}
              {hasDraftSteps ? null : (
                <Chip selected={customTarget} onClick={selectCustom}>
                  Custom
                </Chip>
              )}
            </div>
            {hasDraftSteps ? (
              <p className="mt-2.5 text-[12px] text-faint">Done when every step is ticked.</p>
            ) : null}
            {customTarget && !hasDraftSteps ? (
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

        <div>
          <span className="eyebrow mb-3 block">Subtasks</span>
          {quantityLocked ? (
            <p className="text-[12px] text-faint">
              Steps aren't available while a daily target is more than once.
            </p>
          ) : (
            <div className="space-y-2">
              {draft.subtasks.map((s, index) => (
                <div key={s.id} className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    value={s.title}
                    placeholder={index === 0 ? 'Take vitamins' : 'Another step'}
                    aria-label={`Subtask ${index + 1}`}
                    onChange={(e) => updateSubtask(s.id, e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={s.title.trim() ? `Remove ${s.title.trim()}` : 'Remove subtask'}
                    onClick={() => removeSubtask(s.id)}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-soft active:bg-white/70 active:scale-95"
                  >
                    <span className="text-[22px] leading-none" aria-hidden>
                      ×
                    </span>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSubtask}
                className="flex h-11 items-center text-[13px] font-medium text-soft active:text-ink"
              >
                Add subtask
              </button>
            </div>
          )}
        </div>

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
