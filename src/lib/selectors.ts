import type { Completions, Expense, ExpenseCategory, Habit } from '../types'
import { dateKey, monthKeys, startOfWeek, todayKey, weekKeys } from './date'

export function isDoneOn(completions: Completions, habitId: string, key: string): boolean {
  return (completions[key] ?? []).includes(habitId)
}

function doneWithin(completions: Completions, habitId: string, keys: string[]): boolean {
  return keys.some((k) => isDoneOn(completions, habitId, k))
}

/**
 * A habit earns a place on today's list if it is daily, or if its weekly or
 * monthly turn hasn't been taken yet. Once a weekly habit is ticked it stays
 * visible for the rest of the day, then steps back until next week.
 */
export function isOnToday(habit: Habit, completions: Completions): boolean {
  if (habit.archived) return false
  const today = todayKey()
  if (isDoneOn(completions, habit.id, today)) return true
  if (habit.frequency === 'daily') return true
  if (habit.frequency === 'weekly') return !doneWithin(completions, habit.id, weekKeys())
  return !doneWithin(completions, habit.id, monthKeys())
}

export function todaysHabits(habits: Habit[], completions: Completions): Habit[] {
  return habits.filter((h) => isOnToday(h, completions))
}

export interface DayProgress {
  done: number
  total: number
  ratio: number
}

export function dayProgress(habits: Habit[], completions: Completions): DayProgress {
  const list = todaysHabits(habits, completions)
  const done = list.filter((h) => isDoneOn(completions, h.id, todayKey())).length
  return { done, total: list.length, ratio: list.length === 0 ? 0 : done / list.length }
}

/** Consecutive days ending today, or yesterday, where every due habit was ticked. */
export function streakDays(habits: Habit[], completions: Completions): number {
  const active = habits.filter((h) => !h.archived && h.frequency === 'daily')
  if (active.length === 0) return 0
  let streak = 0
  const cursor = new Date()
  for (let i = 0; i < 365; i += 1) {
    const key = dateKey(cursor)
    const ticked = completions[key] ?? []
    const all = active.every((h) => ticked.includes(h.id))
    if (all) {
      streak += 1
    } else if (i > 0) {
      break
    }
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function spentToday(expenses: Expense[]): number {
  const today = todayKey()
  return sum(expenses.filter((e) => dateKey(new Date(e.spentAt)) === today))
}

export function spentThisWeek(expenses: Expense[]): number {
  return sum(thisWeek(expenses))
}

export function thisWeek(expenses: Expense[]): Expense[] {
  const from = startOfWeek().getTime()
  return expenses.filter((e) => new Date(e.spentAt).getTime() >= from)
}

export interface CategoryTotal {
  category: ExpenseCategory
  total: number
  share: number
}

export function weekByCategory(expenses: Expense[]): CategoryTotal[] {
  const week = thisWeek(expenses)
  const total = sum(week)
  const buckets = new Map<ExpenseCategory, number>()
  for (const e of week) buckets.set(e.category, (buckets.get(e.category) ?? 0) + e.amount)
  return [...buckets.entries()]
    .map(([category, value]) => ({
      category,
      total: value,
      share: total === 0 ? 0 : value / total,
    }))
    .sort((a, b) => b.total - a.total)
}

export function recent(expenses: Expense[], limit = 12): Expense[] {
  return [...expenses]
    .sort((a, b) => new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime())
    .slice(0, limit)
}

function sum(list: Expense[]): number {
  return list.reduce((acc, e) => acc + e.amount, 0)
}
