import type { ExpenseCategory, Frequency, HabitColour } from '../types'

export const CATEGORIES: Array<{ id: ExpenseCategory; label: string; emoji: string }> = [
  { id: 'groceries', label: 'Groceries', emoji: '🥬' },
  { id: 'food', label: 'Food & coffee', emoji: '☕️' },
  { id: 'transport', label: 'Transport', emoji: '🚊' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍' },
  { id: 'bills', label: 'Bills', emoji: '📄' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'health', label: 'Health', emoji: '🌿' },
  { id: 'other', label: 'Other', emoji: '•' },
]

export function categoryOf(id: ExpenseCategory) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}

/** Habit colours are quiet by design. Ink for text, wash for the tick and chip. */
export const HABIT_COLOURS: Record<HabitColour, { ink: string; wash: string; label: string }> = {
  sage: { ink: '#2F5D4E', wash: '#DDE7E1', label: 'Sage' },
  clay: { ink: '#8A4F3D', wash: '#F0E0DA', label: 'Clay' },
  sky: { ink: '#3A5670', wash: '#DCE5EC', label: 'Sky' },
  plum: { ink: '#5E3F5C', wash: '#E8DEE7', label: 'Plum' },
  sand: { ink: '#8A6320', wash: '#F0E7D8', label: 'Sand' },
  moss: { ink: '#4A5B2E', wash: '#E3E8D7', label: 'Moss' },
}

export const COLOUR_KEYS = Object.keys(HABIT_COLOURS) as HabitColour[]

export const FREQUENCIES: Array<{ id: Frequency; label: string; note: string }> = [
  { id: 'daily', label: 'Daily', note: 'Shows up every day' },
  { id: 'weekly', label: 'Weekly', note: `Stays on the list until it's done this week` },
  { id: 'monthly', label: 'Monthly', note: `Stays on the list until it's done this month` },
]

export const EMOJI_CHOICES = [
  '🌿', '💧', '📖', '🚶‍♀️', '🧘', '☀️', '🌙', '✍️',
  '🍋', '🎧', '🛁', '📵', '🥗', '💌', '🪴', '🧺',
]
