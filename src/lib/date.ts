/** All date maths runs in the device's local timezone, on purpose. */

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return dateKey()
}

/** Monday as the first day of the week. */
export function startOfWeek(d: Date = new Date()): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  const shift = (copy.getDay() + 6) % 7
  copy.setDate(copy.getDate() - shift)
  return copy
}

/** Sunday end of the Monday–Sunday week containing `d`. */
export function endOfWeek(d: Date = new Date()): Date {
  const end = startOfWeek(d)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

export function startOfMonth(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function endOfMonth(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function weekDateKeys(d: Date = new Date()): { from: string; to: string } {
  return { from: dateKey(startOfWeek(d)), to: dateKey(endOfWeek(d)) }
}

export function monthDateKeys(d: Date = new Date()): { from: string; to: string } {
  return { from: dateKey(startOfMonth(d)), to: dateKey(endOfMonth(d)) }
}

export function daysBetween(from: Date, to: Date): string[] {
  const keys: string[] = []
  const cursor = new Date(from)
  cursor.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(0, 0, 0, 0)
  while (cursor <= end) {
    keys.push(dateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return keys
}

export function weekKeys(d: Date = new Date()): string[] {
  return daysBetween(startOfWeek(d), d)
}

export function monthKeys(d: Date = new Date()): string[] {
  return daysBetween(startOfMonth(d), d)
}

const LONG_DATE = new Intl.DateTimeFormat('en-AU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const SHORT_DATE = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short' })
const TIME = new Intl.DateTimeFormat('en-AU', { hour: 'numeric', minute: '2-digit' })

export function formatLongDate(d: Date = new Date()): string {
  return LONG_DATE.format(d)
}

export function formatShortDate(isoOrKey: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrKey)) {
    const [y, m, day] = isoOrKey.split('-').map(Number)
    return SHORT_DATE.format(new Date(y, m - 1, day))
  }
  return SHORT_DATE.format(new Date(isoOrKey))
}

export function formatTime(iso: string): string {
  return TIME.format(new Date(iso)).toLowerCase().replace(' ', '')
}

/** "7:30" stored on a habit, shown as "7:30am". */
export function formatReminder(value: string | null): string | null {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return TIME.format(d).toLowerCase().replace(' ', '')
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function isToday(dateOrIso: string): boolean {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOrIso)) return dateOrIso === todayKey()
  return dateKey(new Date(dateOrIso)) === todayKey()
}
