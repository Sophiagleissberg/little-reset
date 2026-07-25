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

/** Date key (YYYY-MM-DD) mapped to the habit ids ticked off that day. */
export type Completions = Record<string, string[]>

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
