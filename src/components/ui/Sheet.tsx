import { useEffect } from 'react'
import type { AnimationEvent, ReactNode } from 'react'
import { useStandaloneVisualViewport } from '../../hooks/useStandaloneVisualViewport'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** Optional pinned footer (e.g. primary actions) outside the scroll area. */
  footer?: ReactNode
}

/** A bottom sheet. Tap the scrim or the handle area to close. */
export function Sheet({ open, onClose, title, children, footer }: Props) {
  useStandaloneVisualViewport(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    // Overflow lock only — avoid position:fixed + stored top on iOS standalone.
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const clearSlideTransform = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    // Drop the leftover translateY(0) from fill-mode so it cannot pin the sheet
    // in a transformed layer after the iOS keyboard moves the visual viewport.
    event.currentTarget.style.transform = 'none'
  }

  return (
    <div className="sheet-root">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="sheet-scrim animate-fade-in"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-panel animate-slide-up"
        onAnimationEnd={clearSlideTransform}
      >
        <div className="sheet-header">
          <div className="mx-auto h-1 w-10 rounded-full bg-rule" />
          {title ? (
            <h2 className="px-6 pt-4 font-display text-[26px] leading-tight tracking-[-0.01em]">
              {title}
            </h2>
          ) : null}
        </div>
        <div className="sheet-body">{children}</div>
        {footer ? <div className="sheet-footer">{footer}</div> : null}
      </div>
    </div>
  )
}
