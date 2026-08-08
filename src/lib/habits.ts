import type { Habit } from '../types'

/** Clamp a raw daily target to a whole number between 1 and 99. */
export function clampDailyTarget(value: unknown, fallback = 1): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(99, Math.max(1, Math.floor(value)))
}

/**
 * Effective completion target for a habit on a given day.
 * Only daily habits use multi-count targets; weekly/monthly stay at 1.
 */
export function habitTarget(habit: Habit): number {
  if (habit.frequency !== 'daily') return 1
  return clampDailyTarget(habit.dailyTarget, 1)
}

export function formatDailyTarget(target: number): string {
  return target === 1 ? 'Once' : `${target} times`
}
