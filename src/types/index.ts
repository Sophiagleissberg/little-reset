export type Frequency = 'daily' | 'weekly' | 'monthly'

export type HabitColour = 'sage' | 'clay' | 'sky' | 'plum' | 'sand' | 'moss'

export interface HabitSubtask {
  id: string
  title: string
}

export interface Habit {
  id: string
  name: string
  emoji: string
  colour: HabitColour
  frequency: Frequency
  /** Stored only. Nothing schedules or fires from this. */
  reminderTime: string | null
  /** Minutes. Null means this habit has no timer. */
  timerMinutes: number | null
  /**
   * How many times a daily habit should be done in one local day.
   * Weekly/monthly habits ignore this and always use a single completion.
   * Habits with subtasks always use 1.
   */
  dailyTarget: number
  /**
   * Optional checklist that makes up this habit. Empty means the habit is
   * ticked as a single item, the way it always has been.
   */
  subtasks: HabitSubtask[]
  archived: boolean
  createdAt: string
}

export type ExpenseCategory =
  | 'groceries'
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'entertainment'
  | 'health'
  | 'other'

/** A single spending record. Totals are always derived from these. */
export interface Transaction {
  id: string
  amount: number
  category: ExpenseCategory
  note: string
  /** Local calendar date as YYYY-MM-DD. */
  date: string
  /** ISO timestamp for ordering and display. */
  timestamp: string
}

/** @deprecated Prefer Transaction. Kept as an alias for gradual rename. */
export type Expense = Transaction

/**
 * Completions keyed by local calendar date, then habit id → count for that day.
 * Count is incremented in place; we do not store one record per tap.
 */
export type DayCompletions = Record<string, number>
export type Completions = Record<string, DayCompletions>

/**
 * Subtask ticks keyed by local calendar date, then habit id, then subtask id.
 * Presence of true means that step was done on that local day.
 */
export type SubtaskDayCompletions = Record<string, Record<string, true>>
export type SubtaskCompletions = Record<string, SubtaskDayCompletions>

export interface AppPreferences {
  /** True once the user has recorded their own spending (demo seed expenses are dropped). */
  spendingStarted: boolean
}

export interface AppState {
  version: number
  habits: Habit[]
  completions: Completions
  subtaskCompletions: SubtaskCompletions
  transactions: Transaction[]
  preferences: AppPreferences
}
