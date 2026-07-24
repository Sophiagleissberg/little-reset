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

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  note: string
  /** ISO timestamp. */
  spentAt: string
}

/** Date key (YYYY-MM-DD) mapped to the habit ids ticked off that day. */
export type Completions = Record<string, string[]>

export interface AppState {
  version: number
  habits: Habit[]
  completions: Completions
  expenses: Expense[]
}
