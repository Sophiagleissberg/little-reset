import { cx } from '../../lib/format'

interface Props {
  /** Amount in cents. Digits fill from the right, the way a card reader does. */
  cents: number
  onChange: (cents: number) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'del']

export function AmountPad({ cents, onChange }: Props) {
  const press = (key: string) => {
    if (key === 'del') {
      onChange(Math.floor(cents / 10))
      return
    }
    const next = key === '00' ? cents * 100 : cents * 10 + Number(key)
    if (next > 99_999_999) return
    onChange(next)
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => press(key)}
          aria-label={key === 'del' ? 'Delete last digit' : key}
          className={cx(
            'h-14 rounded-2xl bg-white border border-rule',
            'font-display text-[22px] text-ink tnum',
            'transition-all duration-100 ease-out active:scale-95 active:bg-[#F2F4F0]'
          )}
        >
          {key === 'del' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mx-auto" aria-hidden>
              <path
                d="M9 5h11v14H9L3 12l6-7z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M12 10l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ) : (
            key
          )}
        </button>
      ))}
    </div>
  )
}
