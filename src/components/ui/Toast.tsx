import { useEffect } from 'react'

interface Props {
  message: string | null
  onDone: () => void
  durationMs?: number
}

/** Subtle success notice. Sits above the tab bar so it stays readable. */
export function Toast({ message, onDone, durationMs = 2400 }: Props) {
  useEffect(() => {
    if (!message) return
    const t = window.setTimeout(onDone, durationMs)
    return () => window.clearTimeout(t)
  }, [message, onDone, durationMs])

  if (!message) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pb-[calc(5.5rem+var(--safe-bottom))]">
      <div
        role="status"
        className="max-w-[430px] rounded-full border border-rule bg-ink px-5 py-2.5 text-[13px] text-paper shadow-card animate-fade-in"
      >
        {message}
      </div>
    </div>
  )
}
