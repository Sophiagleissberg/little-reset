import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppState, Habit, Transaction } from '../types'
import { DEMO_TRANSACTION_PREFIX } from '../lib/constants'
import { todayKey, weekDateKeys } from '../lib/date'
import { id } from '../lib/format'
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
  toggleHabit: (habitId: string, key?: string) => void
  completeHabit: (habitId: string) => void
  addExpense: (input: NewTransaction) => void
  deleteExpense: (expenseId: string) => void
  deleteTodaysTransactions: () => void
  deleteThisWeeksTransactions: () => void
  deleteAllTransactions: () => void
  resetApp: () => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const addHabit = useCallback((input: NewHabit) => {
    setState((prev) => ({
      ...prev,
      habits: [
        ...prev.habits,
        { ...input, id: id('h'), archived: false, createdAt: new Date().toISOString() },
      ],
    }))
  }, [])

  const updateHabit = useCallback((habitId: string, patch: Partial<Habit>) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? { ...h, ...patch } : h)),
    }))
  }, [])

  const setArchived = useCallback((habitId: string, archived: boolean) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? { ...h, archived } : h)),
    }))
  }, [])

  const deleteHabit = useCallback((habitId: string) => {
    setState((prev) => {
      const completions = Object.fromEntries(
        Object.entries(prev.completions).map(([key, ids]) => [key, ids.filter((i) => i !== habitId)])
      )
      return { ...prev, habits: prev.habits.filter((h) => h.id !== habitId), completions }
    })
  }, [])

  const toggleHabit = useCallback((habitId: string, key = todayKey()) => {
    setState((prev) => {
      const current = prev.completions[key] ?? []
      const next = current.includes(habitId)
        ? current.filter((i) => i !== habitId)
        : [...current, habitId]
      return { ...prev, completions: { ...prev.completions, [key]: next } }
    })
  }, [])

  const completeHabit = useCallback((habitId: string) => {
    setState((prev) => {
      const key = todayKey()
      const current = prev.completions[key] ?? []
      if (current.includes(habitId)) return prev
      return { ...prev, completions: { ...prev.completions, [key]: [...current, habitId] } }
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
      completeHabit,
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
      completeHabit,
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
