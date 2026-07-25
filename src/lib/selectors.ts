import type { Completions, ExpenseCategory, Habit, Transaction } from '../types'
import { dateKey, monthDateKeys, monthKeys, todayKey, weekDateKeys, weekKeys } from './date'

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

function inDateRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to
}

export function todaysTransactions(transactions: Transaction[]): Transaction[] {
  const today = todayKey()
  return transactions.filter((t) => t.date === today)
}

export function thisWeek(transactions: Transaction[]): Transaction[] {
  const { from, to } = weekDateKeys()
  return transactions.filter((t) => inDateRange(t.date, from, to))
}

export function thisMonth(transactions: Transaction[]): Transaction[] {
  const { from, to } = monthDateKeys()
  return transactions.filter((t) => inDateRange(t.date, from, to))
}

export function spentToday(transactions: Transaction[]): number {
  return sum(todaysTransactions(transactions))
}

export function spentThisWeek(transactions: Transaction[]): number {
  return sum(thisWeek(transactions))
}

export function spentThisMonth(transactions: Transaction[]): number {
  return sum(thisMonth(transactions))
}

export interface CategoryTotal {
  category: ExpenseCategory
  total: number
  share: number
}

export function weekByCategory(transactions: Transaction[]): CategoryTotal[] {
  const week = thisWeek(transactions)
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

export function recent(transactions: Transaction[], limit = 12): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

function sum(list: Transaction[]): number {
  return list.reduce((acc, e) => acc + e.amount, 0)
}
