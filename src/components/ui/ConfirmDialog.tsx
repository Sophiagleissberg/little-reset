import { useEffect } from 'react'
import { Button } from './Button'

interface Props {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  cancelLabel?: string
  onCancel: () => void
  onConfirm: () => void
}

/** Explicit confirmation for destructive actions — never a vague “Are you sure?”. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  onCancel,
  onConfirm,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-[#1B211D]/25 backdrop-blur-[2px] animate-fade-in"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        className="relative w-full max-w-[360px] rounded-card bg-sheet px-6 py-6 shadow-lift animate-rise"
      >
        <h2 id="confirm-title" className="font-display text-[22px] leading-tight tracking-[-0.01em]">
          {title}
        </h2>
        <p id="confirm-body" className="mt-3 text-[14px] leading-relaxed text-soft">
          {body}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button full variant="danger" size="lg" onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button full variant="quiet" size="lg" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
