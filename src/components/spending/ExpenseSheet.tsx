import { useEffect, useMemo, useState } from 'react'
import { money } from '../../lib/format'
import { CATEGORIES } from '../../lib/reference'
import type { ExpenseCategory, Transaction } from '../../types'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { Sheet } from '../ui/Sheet'
import { AmountPad } from './AmountPad'

interface Props {
  open: boolean
  expenses: Transaction[]
  onClose: () => void
  onSave: (input: { amount: number; category: ExpenseCategory; note: string }) => void
}

/** Whatever you reach for most often is already selected when the sheet opens. */
function likelyCategory(expenses: Transaction[]): ExpenseCategory {
  const counts = new Map<ExpenseCategory, number>()
  for (const e of expenses.slice(-40)) counts.set(e.category, (counts.get(e.category) ?? 0) + 1)
  let best: ExpenseCategory = 'groceries'
  let bestCount = -1
  for (const [category, count] of counts) {
    if (count > bestCount) {
      best = category
      bestCount = count
    }
  }
  return best
}

export function ExpenseSheet({ open, expenses, onClose, onSave }: Props) {
  const suggested = useMemo(() => likelyCategory(expenses), [expenses])
  const [cents, setCents] = useState(0)
  const [category, setCategory] = useState<ExpenseCategory>(suggested)
  const [note, setNote] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setCents(0)
    setCategory(suggested)
    setNote('')
    setNoteOpen(false)
  }, [open, suggested])

  const save = () => {
    if (cents <= 0) return
    onSave({ amount: cents / 100, category, note })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="pt-2">
        <p className="eyebrow text-center">What did you spend</p>
        <p className="tnum mt-3 text-center font-display text-[52px] leading-none tracking-[-0.02em]">
          <span className={cents === 0 ? 'text-faint' : 'text-ink'}>{money(cents / 100)}</span>
        </p>

        <div className="-mx-6 mt-6 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.id} selected={category === c.id} onClick={() => setCategory(c.id)}>
                <span className="mr-1.5" aria-hidden>
                  {c.emoji}
                </span>
                {c.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <AmountPad cents={cents} onChange={setCents} />
        </div>

        <div className="mt-4">
          {noteOpen ? (
            <input
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note, if it helps"
              className="w-full h-12 px-4 bg-white border border-rule rounded-2xl text-[15px] placeholder:text-faint focus:border-care focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setNoteOpen(true)}
              className="w-full h-12 rounded-2xl border border-dashed border-rule text-[13px] text-faint"
            >
              Add a note
            </button>
          )}
        </div>

        <div className="mt-4">
          <Button full size="lg" disabled={cents <= 0} onClick={save}>
            Record it
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
