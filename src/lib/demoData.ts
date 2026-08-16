import type { AppState, Completions, Habit, Transaction } from '../types'
import { STATE_VERSION } from './constants'
import { dateKey } from './date'

function daysAgo(days: number, hour = 9, minute = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d
}

const HABITS: Habit[] = [
  {
    id: 'h_water',
    name: 'Big glass of water',
    emoji: '💧',
    colour: 'sky',
    frequency: 'daily',
    reminderTime: '07:30',
    timerMinutes: null,
    dailyTarget: 5,
    subtasks: [],
    archived: false,
    createdAt: daysAgo(24).toISOString(),
  },
  {
    id: 'h_stretch',
    name: 'Stretch it out',
    emoji: '🧘',
    colour: 'sage',
    frequency: 'daily',
    reminderTime: '20:30',
    timerMinutes: 10,
    dailyTarget: 1,
    subtasks: [],
    archived: false,
    createdAt: daysAgo(24).toISOString(),
  },
  {
    id: 'h_walk',
    name: 'Walk without the phone',
    emoji: '🚶‍♀️',
    colour: 'moss',
    frequency: 'daily',
    reminderTime: '12:30',
    timerMinutes: 20,
    dailyTarget: 1,
    subtasks: [],
    archived: false,
    createdAt: daysAgo(18).toISOString(),
  },
  {
    id: 'h_read',
    name: 'Read a few pages',
    emoji: '📖',
    colour: 'plum',
    frequency: 'daily',
    reminderTime: '21:00',
    timerMinutes: 15,
    dailyTarget: 1,
    subtasks: [],
    archived: false,
    createdAt: daysAgo(12).toISOString(),
  },
  {
    id: 'h_reset',
    name: 'Reset the kitchen',
    emoji: '🧺',
    colour: 'clay',
    frequency: 'weekly',
    reminderTime: null,
    timerMinutes: null,
    dailyTarget: 1,
    subtasks: [],
    archived: false,
    createdAt: daysAgo(30).toISOString(),
  },
  {
    id: 'h_money',
    name: 'Look at the money',
    emoji: '✍️',
    colour: 'sand',
    frequency: 'monthly',
    reminderTime: '19:00',
    timerMinutes: null,
    dailyTarget: 1,
    subtasks: [],
    archived: false,
    createdAt: daysAgo(40).toISOString(),
  },
  {
    id: 'h_journal',
    name: 'Morning pages',
    emoji: '🌙',
    colour: 'plum',
    frequency: 'daily',
    reminderTime: '06:45',
    timerMinutes: 5,
    dailyTarget: 1,
    subtasks: [],
    archived: true,
    createdAt: daysAgo(60).toISOString(),
  },
]

function seedCompletions(): Completions {
  const out: Completions = {}
  // A believable recent history: mostly consistent, with a couple of missed days.
  // Counts use the new shape; water (target 5) is fully done on stronger days.
  const pattern: Record<number, Record<string, number>> = {
    1: { h_water: 5, h_stretch: 1, h_read: 1 },
    2: { h_water: 3, h_walk: 1 },
    3: { h_water: 5, h_stretch: 1, h_walk: 1, h_read: 1 },
    4: { h_water: 2 },
    5: { h_water: 5, h_stretch: 1, h_reset: 1 },
    6: { h_water: 4, h_read: 1 },
    7: { h_water: 5, h_walk: 1, h_stretch: 1 },
  }
  for (const [offset, counts] of Object.entries(pattern)) {
    out[dateKey(daysAgo(Number(offset)))] = counts
  }
  // Today starts empty so multi-target habits show 0/n.
  return out
}

const EXPENSE_SEED: Array<[number, number, Transaction['category'], string, number, number]> = [
  // [daysAgo, amount, category, note, hour, minute]
  [0, 5.8, 'food', 'Flat white', 8, 40],
  [0, 18.5, 'groceries', 'Milk, bread, bananas', 12, 10],
  [1, 62.35, 'groceries', 'Weekly shop', 17, 5],
  [1, 4.6, 'transport', 'Tram top up', 8, 15],
  [2, 9.5, 'food', 'Toastie and coffee', 13, 0],
  [2, 39, 'shopping', 'Toddler shoes', 15, 40],
  [3, 129.4, 'bills', 'Electricity', 9, 30],
  [3, 6.2, 'food', 'Coffee with Mum', 10, 20],
  [4, 24, 'entertainment', 'Cinema ticket', 19, 10],
  [4, 15.75, 'health', 'Magnesium', 11, 0],
  [5, 48.9, 'groceries', 'Top up shop', 16, 45],
  [6, 12, 'transport', 'Parking', 9, 5],
]

function seedTransactions(): Transaction[] {
  return EXPENSE_SEED.map(([offset, amount, category, note, hour, minute], i) => {
    const when = daysAgo(offset, hour, minute)
    return {
      id: `e_seed_${i}`,
      amount,
      category,
      note,
      date: dateKey(when),
      timestamp: when.toISOString(),
    }
  })
}

export function buildDemoState(): AppState {
  return {
    version: STATE_VERSION,
    habits: HABITS,
    completions: seedCompletions(),
    subtaskCompletions: {},
    transactions: seedTransactions(),
    preferences: { spendingStarted: false },
  }
}
