interface Props {
  onClick: () => void
  label: string
}

/** The one always available action: record what you just spent. */
export function AddButton({ onClick, label }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center pointer-events-none">
      <div className="relative w-full max-w-[430px]">
        <button
          onClick={onClick}
          aria-label={label}
          className="pointer-events-auto absolute right-5 bottom-[calc(5.9rem+var(--safe-bottom))]
                     h-14 w-14 rounded-full bg-ink text-paper shadow-lift
                     flex items-center justify-center
                     transition-transform duration-150 ease-out active:scale-90"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
