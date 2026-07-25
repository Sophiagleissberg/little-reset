import type { AppPreferences, AppState, ExpenseCategory, Habit, Transaction } from '../types'
import { DEMO_TRANSACTION_PREFIX, STATE_VERSION, STORAGE_KEY as KEY } from './constants'
import { dateKey } from './date'
import { buildDemoState } from './demoData'
import { id } from './format'

const DEFAULT_PREFERENCES: AppPreferences = { spendingStarted: false }

export const EMPTY_STATE: AppState = {
  version: STATE_VERSION,
  habits: [],
  completions: {},
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

function isCategory(value: unknown): value is ExpenseCategory {
  return typeof value === 'string' && (CATEGORIES as string[]).includes(value)
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

function migrateHabits(parsed: Record<string, unknown>): Habit[] {
  return Array.isArray(parsed.habits) ? (parsed.habits as Habit[]) : []
}

function migrateCompletions(parsed: Record<string, unknown>): AppState['completions'] {
  if (!parsed.completions || typeof parsed.completions !== 'object') return {}
  return parsed.completions as AppState['completions']
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
      transactions: cleaned,
      preferences,
    }

    // Persist migrated shape so spentAt / expenses keys do not linger.
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
