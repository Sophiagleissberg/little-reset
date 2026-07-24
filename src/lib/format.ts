const CURRENCY = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2,
})

const CURRENCY_ROUND = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function money(amount: number): string {
  return CURRENCY.format(amount)
}

/** For big display numbers where cents only appear when they matter. */
export function moneyLoose(amount: number): string {
  return Number.isInteger(amount) ? CURRENCY_ROUND.format(amount) : CURRENCY.format(amount)
}

export function clockFace(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
