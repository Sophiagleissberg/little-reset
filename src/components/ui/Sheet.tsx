import { useEffect } from 'react'
import type { AnimationEvent, ReactNode } from 'react'
import { cx } from '../../lib/format'
import { useStandaloneVisualViewport } from '../../hooks/useStandaloneVisualViewport'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** Optional pinned footer (e.g. primary actions) outside the scroll area. */
  footer?: ReactNode
  /** Extra class names for the scrollable body (e.g. hide scrollbar). */
  bodyClassName?: string
}

/** A bottom sheet. Tap the scrim or the handle area to close. Unmounts when closed. */
export function Sheet({ open, onClose, title, children, footer, bodyClassName }: Props) {
  useStandaloneVisualViewport(open)

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const clearSlideTransform = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    // Avoid leaving a transformed containing block after the enter animation.
    event.currentTarget.style.transform = 'none'
  }

  return (
    <div className="sheet-root" role="presentation">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="sheet-scrim"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-panel sheet-panel-enter"
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
        <div className={cx('sheet-body', bodyClassName)}>{children}</div>
        {footer ? <div className="sheet-footer">{footer}</div> : null}
      </div>
    </div>
  )
}
