import type { Habit, HabitSubtask } from '../types'

/** Clamp a raw daily target to a whole number between 1 and 99. */
export function clampDailyTarget(value: unknown, fallback = 1): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(99, Math.max(1, Math.floor(value)))
}

/**
 * Effective completion target for a habit on a given day.
 * Only daily habits use multi-count targets; weekly/monthly stay at 1.
 * Subtask habits always complete as a single parent tick.
 */
export function habitTarget(habit: Habit): number {
  if (habitHasSubtasks(habit)) return 1
  if (habit.frequency !== 'daily') return 1
  return clampDailyTarget(habit.dailyTarget, 1)
}

export function formatDailyTarget(target: number): string {
  return target === 1 ? 'Once' : `${target} times`
}

export function formatSubtaskCount(count: number): string {
  return count === 1 ? '1 step' : `${count} steps`
}

/** Checklist items with a title. Empty draft rows are ignored. */
export function listedSubtasks(habit: Pick<Habit, 'subtasks'>): HabitSubtask[] {
  return (habit.subtasks ?? []).filter((s) => s.title.trim().length > 0)
}

/**
 * Whether Today should treat this habit as a checklist.
 * Quantity targets greater than 1 win if both somehow exist.
 */
export function habitHasSubtasks(habit: Habit): boolean {
  if (habit.frequency === 'daily' && clampDailyTarget(habit.dailyTarget, 1) > 1) return false
  return listedSubtasks(habit).length > 0
}

/** Drop empty titles; keep ids so completion history stays attached. */
export function sanitizeSubtasks(raw: unknown): HabitSubtask[] {
  if (!Array.isArray(raw)) return []
  const out: HabitSubtask[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const title = typeof row.title === 'string' ? row.title.trim() : ''
    if (!title) continue
    const id = typeof row.id === 'string' && row.id ? row.id : ''
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push({ id, title })
  }
  return out
}
