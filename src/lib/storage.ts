import type {
  AppPreferences,
  AppState,
  Completions,
  DayCompletions,
  ExpenseCategory,
  Frequency,
  Habit,
  HabitColour,
  SubtaskCompletions,
  SubtaskDayCompletions,
  Transaction,
} from '../types'
import { DEMO_TRANSACTION_PREFIX, STATE_VERSION, STORAGE_KEY as KEY } from './constants'
import { dateKey } from './date'
import { buildDemoState } from './demoData'
import { id } from './format'
import { clampDailyTarget, sanitizeSubtasks } from './habits'

const DEFAULT_PREFERENCES: AppPreferences = { spendingStarted: false }

export const EMPTY_STATE: AppState = {
  version: STATE_VERSION,
  habits: [],
  completions: {},
  subtaskCompletions: {},
  transactions: [],
  preferences: { ...DEFAULT_PREFERENCES },
}

const CATEGORIES: ExpenseCategory[] = [
  'groceries',
  'food',
  'transport',
  'shopping',
  'bills',
  'entertainment',
  'health',
  'other',
]

const FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly']
const COLOURS: HabitColour[] = ['sage', 'clay', 'sky', 'plum', 'sand', 'moss']

function isCategory(value: unknown): value is ExpenseCategory {
  return typeof value === 'string' && (CATEGORIES as string[]).includes(value)
}

function isFrequency(value: unknown): value is Frequency {
  return typeof value === 'string' && (FREQUENCIES as string[]).includes(value)
}

function isColour(value: unknown): value is HabitColour {
  return typeof value === 'string' && (COLOURS as string[]).includes(value)
}

/** Convert a legacy expense (spentAt) or partial transaction into the current shape. */
export function normalizeTransaction(raw: unknown): Transaction | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  const amount = typeof row.amount === 'number' && Number.isFinite(row.amount) ? row.amount : null
  if (amount === null || amount < 0) return null

  const timestamp =
    typeof row.timestamp === 'string' && row.timestamp
      ? row.timestamp
      : typeof row.spentAt === 'string' && row.spentAt
        ? row.spentAt
        : new Date().toISOString()

  let date: string
  if (typeof row.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
    date = row.date
  } else {
    const parsed = new Date(timestamp)
    date = Number.isNaN(parsed.getTime()) ? dateKey() : dateKey(parsed)
  }

  return {
    id: typeof row.id === 'string' && row.id ? row.id : id('e'),
    amount,
    category: isCategory(row.category) ? row.category : 'other',
    note: typeof row.note === 'string' ? row.note : '',
    date,
    timestamp,
  }
}

function migrateTransactions(parsed: Record<string, unknown>): Transaction[] {
  const source = Array.isArray(parsed.transactions)
    ? parsed.transactions
    : Array.isArray(parsed.expenses)
      ? parsed.expenses
      : []

  const out: Transaction[] = []
  for (const item of source) {
    const tx = normalizeTransaction(item)
    if (tx) out.push(tx)
  }
  return out
}

function migratePreferences(
  parsed: Record<string, unknown>,
  transactions: Transaction[]
): AppPreferences {
  const raw = parsed.preferences
  if (raw && typeof raw === 'object') {
    const prefs = raw as Record<string, unknown>
    if (typeof prefs.spendingStarted === 'boolean') {
      return { spendingStarted: prefs.spendingStarted }
    }
  }

  // Returning users who already have non-demo spending have clearly started.
  const hasOwnSpending = transactions.some((t) => !t.id.startsWith(DEMO_TRANSACTION_PREFIX))
  return { spendingStarted: hasOwnSpending }
}

/** Normalize a habit row; missing dailyTarget defaults to 1, missing subtasks to []. */
export function normalizeHabit(raw: unknown): Habit | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Record<string, unknown>
  if (typeof row.id !== 'string' || !row.id) return null
  if (typeof row.name !== 'string') return null

  const timerMinutes =
    typeof row.timerMinutes === 'number' && Number.isFinite(row.timerMinutes) && row.timerMinutes > 0
      ? Math.floor(row.timerMinutes)
      : null

  return {
    id: row.id,
    name: row.name,
    emoji: typeof row.emoji === 'string' && row.emoji ? row.emoji : '🌿',
    colour: isColour(row.colour) ? row.colour : 'sage',
    frequency: isFrequency(row.frequency) ? row.frequency : 'daily',
    reminderTime: typeof row.reminderTime === 'string' && row.reminderTime ? row.reminderTime : null,
    timerMinutes,
    dailyTarget: clampDailyTarget(row.dailyTarget, 1),
    subtasks: sanitizeSubtasks(row.subtasks),
    archived: row.archived === true,
    createdAt:
      typeof row.createdAt === 'string' && row.createdAt
        ? row.createdAt
        : new Date().toISOString(),
  }
}

function migrateHabits(parsed: Record<string, unknown>): Habit[] {
  if (!Array.isArray(parsed.habits)) return []
  const out: Habit[] = []
  for (const item of parsed.habits) {
    const habit = normalizeHabit(item)
    if (habit) out.push(habit)
  }
  return out
}

/**
 * Migrate completions to date → { habitId: count }.
 * Legacy shape was date → habitId[] (boolean presence). Each listed id becomes count: 1.
 */
export function migrateCompletions(parsed: Record<string, unknown>): Completions {
  if (!parsed.completions || typeof parsed.completions !== 'object') return {}

  const out: Completions = {}
  for (const [date, value] of Object.entries(parsed.completions as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue

    const day: DayCompletions = {}

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item) day[item] = 1
      }
    } else if (value && typeof value === 'object') {
      for (const [habitId, count] of Object.entries(value as Record<string, unknown>)) {
        if (!habitId) continue
        if (typeof count === 'number' && Number.isFinite(count) && count > 0) {
          day[habitId] = Math.min(99, Math.floor(count))
        } else if (count === true) {
          day[habitId] = 1
        }
      }
    }

    if (Object.keys(day).length > 0) out[date] = day
  }
  return out
}

/**
 * Missing field → {}. Corrupt rows are skipped. Previous days are kept.
 */
export function migrateSubtaskCompletions(parsed: Record<string, unknown>): SubtaskCompletions {
  if (!parsed.subtaskCompletions || typeof parsed.subtaskCompletions !== 'object') return {}

  const out: SubtaskCompletions = {}
  for (const [date, value] of Object.entries(
    parsed.subtaskCompletions as Record<string, unknown>
  )) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue

    const day: SubtaskDayCompletions = {}
    for (const [habitId, steps] of Object.entries(value as Record<string, unknown>)) {
      if (!habitId || !steps || typeof steps !== 'object' || Array.isArray(steps)) continue
      const done: Record<string, true> = {}
      for (const [subtaskId, flag] of Object.entries(steps as Record<string, unknown>)) {
        if (!subtaskId) continue
        if (flag === true || flag === 1) done[subtaskId] = true
      }
      if (Object.keys(done).length > 0) day[habitId] = done
    }

    if (Object.keys(day).length > 0) out[date] = day
  }
  return out
}

/**
 * Reads state from localStorage.
 * - Missing key → first launch, seed demo once.
 * - Present key (even empty arrays) → migrate and keep user data; never re-seed.
 */
export function loadState(): AppState {
  if (typeof window === 'undefined') return { ...EMPTY_STATE, preferences: { ...DEFAULT_PREFERENCES } }

  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) {
      const seeded = buildDemoState()
      saveState(seeded)
      return seeded
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>
    const transactions = migrateTransactions(parsed)
    const preferences = migratePreferences(parsed, transactions)

    // If the user has already started spending, drop leftover demo seed rows.
    const cleaned =
      preferences.spendingStarted
        ? transactions.filter((t) => !t.id.startsWith(DEMO_TRANSACTION_PREFIX))
        : transactions

    const state: AppState = {
      version: STATE_VERSION,
      habits: migrateHabits(parsed),
      completions: migrateCompletions(parsed),
      subtaskCompletions: migrateSubtaskCompletions(parsed),
      transactions: cleaned,
      preferences,
    }

    // Persist migrated shape so spentAt / expenses keys / legacy completions do not linger.
    saveState(state)
    return state
  } catch {
    return { ...EMPTY_STATE, preferences: { ...DEFAULT_PREFERENCES } }
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked. The session still works, it just won't persist.
  }
}

/** Wipe the app back to a genuine empty first-launch-after-reset state (no demo reseed). */
export function resetStoredState(): AppState {
  const empty = {
    ...EMPTY_STATE,
    preferences: { ...DEFAULT_PREFERENCES },
  }
  saveState(empty)
  return empty
}
