import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/** A bottom sheet. Tap the scrim or the handle area to close. */
export function Sheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[#1B211D]/25 backdrop-blur-[2px] animate-fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[430px] bg-sheet rounded-t-sheet shadow-lift animate-slide-up
                   max-h-[92vh] overflow-y-auto pb-[calc(1.5rem+var(--safe-bottom))]"
      >
        <div className="sticky top-0 z-10 bg-sheet rounded-t-sheet pt-3 pb-1">
          <div className="mx-auto h-1 w-10 rounded-full bg-rule" />
          {title ? (
            <h2 className="px-6 pt-4 font-display text-[26px] leading-tight tracking-[-0.01em]">
              {title}
            </h2>
          ) : null}
        </div>
        <div className="px-6 pt-3">{children}</div>
      </div>
    </div>
  )
}
