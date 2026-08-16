import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppState, Completions, DayCompletions, Habit, SubtaskCompletions, SubtaskDayCompletions, Transaction } from '../types'
import { DEMO_TRANSACTION_PREFIX } from '../lib/constants'
import { todayKey, weekDateKeys } from '../lib/date'
import { id } from '../lib/format'
import { clampDailyTarget, habitHasSubtasks, habitTarget, listedSubtasks, sanitizeSubtasks } from '../lib/habits'
import { loadState, resetStoredState, saveState } from '../lib/storage'

type NewHabit = Omit<Habit, 'id' | 'archived' | 'createdAt'>
type NewTransaction = Omit<Transaction, 'id' | 'date' | 'timestamp'> & {
  date?: string
  timestamp?: string
}

interface Store {
  state: AppState
  addHabit: (input: NewHabit) => void
  updateHabit: (habitId: string, patch: Partial<Habit>) => void
  setArchived: (habitId: string, archived: boolean) => void
  deleteHabit: (habitId: string) => void
  /** Target-1: toggle. Target>1: increment by one (capped). No-op for checklist habits. */
  toggleHabit: (habitId: string, key?: string) => void
  decrementHabit: (habitId: string, key?: string) => void
  completeHabit: (habitId: string) => void
  toggleSubtask: (habitId: string, subtaskId: string, key?: string) => void
  addExpense: (input: NewTransaction) => void
  deleteExpense: (expenseId: string) => void
  deleteTodaysTransactions: () => void
  deleteThisWeeksTransactions: () => void
  deleteAllTransactions: () => void
  resetApp: () => void
}

const StoreContext = createContext<Store | null>(null)

function setDayCount(
  completions: Completions,
  key: string,
  habitId: string,
  count: number
): Completions {
  const day: DayCompletions = { ...(completions[key] ?? {}) }
  if (count <= 0) {
    delete day[habitId]
  } else {
    day[habitId] = count
  }
  if (Object.keys(day).length === 0) {
    const next = { ...completions }
    delete next[key]
    return next
  }
  return { ...completions, [key]: day }
}

function setSubtaskFlag(
  store: SubtaskCompletions,
  key: string,
  habitId: string,
  subtaskId: string,
  done: boolean
): SubtaskCompletions {
  const day: SubtaskDayCompletions = { ...(store[key] ?? {}) }
  const steps: Record<string, true> = { ...(day[habitId] ?? {}) }
  if (done) steps[subtaskId] = true
  else delete steps[subtaskId]

  if (Object.keys(steps).length === 0) delete day[habitId]
  else day[habitId] = steps

  if (Object.keys(day).length === 0) {
    const next = { ...store }
    delete next[key]
    return next
  }
  return { ...store, [key]: day }
}

function allListedSubtasksDone(
  habit: Habit,
  store: SubtaskCompletions,
  key: string
): boolean {
  const list = listedSubtasks(habit)
  if (list.length === 0) return false
  const steps = store[key]?.[habit.id] ?? {}
  return list.every((s) => steps[s.id] === true)
}

function pruneHabitSubtasks(store: SubtaskCompletions, habitId: string): SubtaskCompletions {
  const out: SubtaskCompletions = {}
  for (const [key, day] of Object.entries(store)) {
    if (!(habitId in day)) {
      out[key] = day
      continue
    }
    const nextDay = { ...day }
    delete nextDay[habitId]
    if (Object.keys(nextDay).length > 0) out[key] = nextDay
  }
  return out
}

function normalizeIncomingHabit(input: NewHabit | Partial<Habit>): Partial<Habit> {
  const next = { ...input }
  if ('subtasks' in next) {
    next.subtasks = sanitizeSubtasks(next.subtasks)
  }
  if ('dailyTarget' in next) {
    next.dailyTarget = clampDailyTarget(next.dailyTarget, 1)
  }
  if (next.frequency && next.frequency !== 'daily') {
    next.dailyTarget = 1
  }
  if (next.subtasks && next.subtasks.length > 0) {
    next.dailyTarget = 1
  }
  return next
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const addHabit = useCallback((input: NewHabit) => {
    const normalized = normalizeIncomingHabit(input) as NewHabit
    setState((prev) => ({
      ...prev,
      habits: [
        ...prev.habits,
        {
          ...normalized,
          dailyTarget: clampDailyTarget(normalized.dailyTarget, 1),
          subtasks: sanitizeSubtasks(normalized.subtasks),
          id: id('h'),
          archived: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }))
  }, [])

  const updateHabit = useCallback((habitId: string, patch: Partial<Habit>) => {
    const normalized = normalizeIncomingHabit(patch)
    setState((prev) => {
      const habits = prev.habits.map((h) => (h.id === habitId ? { ...h, ...normalized } : h))
      const updated = habits.find((h) => h.id === habitId)
      if (!updated) return { ...prev, habits }

      // If the target was lowered below today's count, cap today's displayed count.
      // Checklist habits derive the parent tick from today's subtask progress.
      const key = todayKey()
      const subtaskCompletions = prev.subtaskCompletions ?? {}
      let completions = prev.completions
      if (habitHasSubtasks(updated)) {
        const nextCount = allListedSubtasksDone(updated, subtaskCompletions, key) ? 1 : 0
        const current = prev.completions[key]?.[habitId] ?? 0
        if (current !== nextCount) {
          completions = setDayCount(prev.completions, key, habitId, nextCount)
        }
      } else {
        const target = habitTarget(updated)
        const current = prev.completions[key]?.[habitId] ?? 0
        if (current > target) {
          completions = setDayCount(prev.completions, key, habitId, target)
        }
      }

      return { ...prev, habits, completions }
    })
  }, [])

  const setArchived = useCallback((habitId: string, archived: boolean) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? { ...h, archived } : h)),
    }))
  }, [])

  const deleteHabit = useCallback((habitId: string) => {
    setState((prev) => {
      const completions: Completions = {}
      for (const [key, day] of Object.entries(prev.completions)) {
        if (!(habitId in day)) {
          completions[key] = day
          continue
        }
        const nextDay = { ...day }
        delete nextDay[habitId]
        if (Object.keys(nextDay).length > 0) completions[key] = nextDay
      }
      return {
        ...prev,
        habits: prev.habits.filter((h) => h.id !== habitId),
        completions,
        subtaskCompletions: pruneHabitSubtasks(prev.subtaskCompletions ?? {}, habitId),
      }
    })
  }, [])

  const toggleHabit = useCallback((habitId: string, key = todayKey()) => {
    setState((prev) => {
      const habit = prev.habits.find((h) => h.id === habitId)
      if (!habit) return prev
      if (habitHasSubtasks(habit)) return prev
      const target = habitTarget(habit)
      const current = prev.completions[key]?.[habitId] ?? 0

      if (target <= 1) {
        const next = current > 0 ? 0 : 1
        return { ...prev, completions: setDayCount(prev.completions, key, habitId, next) }
      }

      if (current >= target) return prev
      return {
        ...prev,
        completions: setDayCount(prev.completions, key, habitId, current + 1),
      }
    })
  }, [])

  const decrementHabit = useCallback((habitId: string, key = todayKey()) => {
    setState((prev) => {
      const habit = prev.habits.find((h) => h.id === habitId)
      if (habit && habitHasSubtasks(habit)) return prev
      const current = prev.completions[key]?.[habitId] ?? 0
      if (current <= 0) return prev
      return {
        ...prev,
        completions: setDayCount(prev.completions, key, habitId, current - 1),
      }
    })
  }, [])

  const completeHabit = useCallback((habitId: string) => {
    setState((prev) => {
      const habit = prev.habits.find((h) => h.id === habitId)
      if (!habit) return prev
      if (habitHasSubtasks(habit)) return prev
      const key = todayKey()
      const target = habitTarget(habit)
      const current = prev.completions[key]?.[habitId] ?? 0
      if (current >= target) return prev
      return {
        ...prev,
        completions: setDayCount(prev.completions, key, habitId, current + 1),
      }
    })
  }, [])

  const toggleSubtask = useCallback((habitId: string, subtaskId: string, key = todayKey()) => {
    setState((prev) => {
      const habit = prev.habits.find((h) => h.id === habitId)
      if (!habit || !habitHasSubtasks(habit)) return prev
      if (!listedSubtasks(habit).some((s) => s.id === subtaskId)) return prev

      const store = prev.subtaskCompletions ?? {}
      const currentlyDone = store[key]?.[habitId]?.[subtaskId] === true
      const subtaskCompletions = setSubtaskFlag(store, key, habitId, subtaskId, !currentlyDone)
      const nextCount = allListedSubtasksDone(habit, subtaskCompletions, key) ? 1 : 0

      return {
        ...prev,
        subtaskCompletions,
        completions: setDayCount(prev.completions, key, habitId, nextCount),
      }
    })
  }, [])

  const addExpense = useCallback((input: NewTransaction) => {
    const timestamp = input.timestamp ?? new Date().toISOString()
    const date = input.date ?? todayKey()
    setState((prev) => {
      const withoutDemo = prev.preferences.spendingStarted
        ? prev.transactions
        : prev.transactions.filter((t) => !t.id.startsWith(DEMO_TRANSACTION_PREFIX))

      return {
        ...prev,
        preferences: { ...prev.preferences, spendingStarted: true },
        transactions: [
          ...withoutDemo,
          {
            id: id('e'),
            amount: input.amount,
            category: input.category,
            note: input.note.trim(),
            date,
            timestamp,
          },
        ],
      }
    })
  }, [])

  const deleteExpense = useCallback((expenseId: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((e) => e.id !== expenseId),
    }))
  }, [])

  const deleteTodaysTransactions = useCallback(() => {
    const today = todayKey()
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.date !== today),
    }))
  }, [])

  const deleteThisWeeksTransactions = useCallback(() => {
    const { from, to } = weekDateKeys()
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => !(t.date >= from && t.date <= to)),
    }))
  }, [])

  const deleteAllTransactions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transactions: [],
      preferences: { ...prev.preferences, spendingStarted: true },
    }))
  }, [])

  const resetApp = useCallback(() => {
    const empty = resetStoredState()
    setState(empty)
  }, [])

  const value = useMemo<Store>(
    () => ({
      state,
      addHabit,
      updateHabit,
      setArchived,
      deleteHabit,
      toggleHabit,
      decrementHabit,
      completeHabit,
      toggleSubtask,
      addExpense,
      deleteExpense,
      deleteTodaysTransactions,
      deleteThisWeeksTransactions,
      deleteAllTransactions,
      resetApp,
    }),
    [
      state,
      addHabit,
      updateHabit,
      setArchived,
      deleteHabit,
      toggleHabit,
      decrementHabit,
      completeHabit,
      toggleSubtask,
      addExpense,
      deleteExpense,
      deleteTodaysTransactions,
      deleteThisWeeksTransactions,
      deleteAllTransactions,
      resetApp,
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore has to sit inside StoreProvider')
  return ctx
}
