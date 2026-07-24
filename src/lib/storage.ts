import type { AppState } from '../types'
import { STATE_VERSION, STORAGE_KEY as KEY } from './constants'
import { buildDemoState } from './demoData'

const EMPTY: AppState = { version: STATE_VERSION, habits: [], completions: {}, expenses: [] }

/**
 * Reads state from localStorage. First launch seeds a small set of demo data so
 * the app never opens as a blank page.
 */
export function loadState(): AppState {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) {
      const seeded = buildDemoState()
      saveState(seeded)
      return seeded
    }
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      version: STATE_VERSION,
      habits: parsed.habits ?? [],
      completions: parsed.completions ?? {},
      expenses: parsed.expenses ?? [],
    }
  } catch {
    return { ...EMPTY }
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

export function clearState(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
}
