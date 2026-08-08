export type Frequency = 'daily' | 'weekly' | 'monthly'

export type HabitColour = 'sage' | 'clay' | 'sky' | 'plum' | 'sand' | 'moss'

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
   */
  dailyTarget: number
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

export interface AppPreferences {
  /** True once the user has recorded their own spending (demo seed expenses are dropped). */
  spendingStarted: boolean
}

export interface AppState {
  version: number
  habits: Habit[]
  completions: Completions
  transactions: Transaction[]
  preferences: AppPreferences
}
