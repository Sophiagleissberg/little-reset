import { useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useStore } from '../hooks/useStore'
import { APP_VERSION } from '../lib/constants'
import { todayKey, weekDateKeys } from '../lib/date'
import { money } from '../lib/format'
import { spentThisWeek, spentToday, todaysTransactions, thisWeek } from '../lib/selectors'

type ConfirmKind = 'today' | 'week' | 'all' | 'reset' | null

interface Props {
  onBack: () => void
  onAfterReset: () => void
  onToast: (message: string) => void
}

export function SettingsScreen({ onBack, onAfterReset, onToast }: Props) {
  const {
    state,
    deleteTodaysTransactions,
    deleteThisWeeksTransactions,
    deleteAllTransactions,
    resetApp,
  } = useStore()
  const [confirm, setConfirm] = useState<ConfirmKind>(null)

  const todayCount = useMemo(() => todaysTransactions(state.transactions).length, [state.transactions])
  const weekCount = useMemo(() => thisWeek(state.transactions).length, [state.transactions])
  const allCount = state.transactions.length
  const todayTotal = spentToday(state.transactions)
  const weekTotal = spentThisWeek(state.transactions)

  const dialog = useMemo(() => {
    const week = weekDateKeys()
    switch (confirm) {
      case 'today':
        return {
          title: 'Delete today’s spending',
          body: `This will permanently delete ${todayCount} transaction${todayCount === 1 ? '' : 's'} from today (${todayKey()}, ${money(todayTotal)}). Earlier days are kept.`,
          confirmLabel: 'Delete today’s spending',
        }
      case 'week':
        return {
          title: 'Delete this week’s spending',
          body: `This will permanently delete ${weekCount} transaction${weekCount === 1 ? '' : 's'} from this week (${money(weekTotal)}, Monday ${week.from} through Sunday ${week.to}). Other weeks are kept.`,
          confirmLabel: 'Delete this week’s spending',
        }
      case 'all':
        return {
          title: 'Delete all spending history',
          body: `This will permanently delete all ${allCount} spending transaction${allCount === 1 ? '' : 's'}. Habits and completion history are not affected.`,
          confirmLabel: 'Delete all spending',
        }
      case 'reset':
        return {
          title: 'Reset entire app',
          body: 'This will delete all habits, habit completions, spending transactions, and saved preferences. The app will return to an empty state. This cannot be undone.',
          confirmLabel: 'Reset app',
        }
      default:
        return null
    }
  }, [confirm, todayCount, weekCount, allCount, todayTotal, weekTotal])

  const runConfirm = () => {
    if (!confirm) return

    if (confirm === 'today') {
      deleteTodaysTransactions()
      setConfirm(null)
      onToast('Today’s spending deleted')
      onBack()
      return
    }

    if (confirm === 'week') {
      deleteThisWeeksTransactions()
      setConfirm(null)
      onToast('This week’s spending deleted')
      onBack()
      return
    }

    if (confirm === 'all') {
      deleteAllTransactions()
      setConfirm(null)
      onToast('All spending history deleted')
      onBack()
      return
    }

    if (confirm === 'reset') {
      resetApp()
      setConfirm(null)
      onToast('App reset')
      onAfterReset()
    }
  }

  return (
    <div className="animate-rise">
      <header className="mb-8">
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-soft active:text-ink"
        >
          ← Back
        </button>
        <p className="eyebrow mt-4">Preferences</p>
        <h1 className="mt-2.5 font-display text-[34px] leading-[1.08] tracking-[-0.02em]">Settings</h1>
      </header>

      <section className="mb-10">
        <h2 className="font-display text-[19px] tracking-[-0.01em]">Spending</h2>
        <p className="mt-1.5 mb-4 text-[13px] text-soft">
          Remove recorded transactions. Totals update from what is left.
        </p>
        <div className="sheet-surface divide-y divide-rule overflow-hidden">
          <SettingsRow
            label="Delete today’s transactions"
            hint={todayCount === 0 ? 'Nothing recorded today' : `${todayCount} · ${money(todayTotal)}`}
            onClick={() => {
              if (todayCount === 0) onToast('Nothing recorded today')
              else setConfirm('today')
            }}
          />
          <SettingsRow
            label="Delete this week’s transactions"
            hint={weekCount === 0 ? 'Nothing recorded this week' : `${weekCount} · ${money(weekTotal)}`}
            onClick={() => {
              if (weekCount === 0) onToast('Nothing recorded this week')
              else setConfirm('week')
            }}
          />
          <SettingsRow
            label="Delete all spending history"
            hint={allCount === 0 ? 'No history yet' : `${allCount} transaction${allCount === 1 ? '' : 's'}`}
            onClick={() => {
              if (allCount === 0) onToast('No spending history to delete')
              else setConfirm('all')
            }}
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-[19px] tracking-[-0.01em]">App data</h2>
        <p className="mt-1.5 mb-4 text-[13px] text-soft">
          Clear everything and start again on this device.
        </p>
        <div className="sheet-surface overflow-hidden">
          <SettingsRow label="Reset entire app" hint="Habits, spending, preferences" onClick={() => setConfirm('reset')} />
        </div>
      </section>

      <section className="mb-4">
        <h2 className="font-display text-[19px] tracking-[-0.01em]">About</h2>
        <div className="sheet-surface mt-4 px-5 py-5">
          <p className="text-[14px] leading-relaxed text-soft">
            Your data is stored locally on this device.
          </p>
          <div className="mt-4 flex items-baseline border-t border-rule pt-4">
            <p className="eyebrow">App version</p>
            <span className="leader" aria-hidden />
            <p className="tnum text-[14px]">{APP_VERSION}</p>
          </div>
          <div className="mt-3 flex items-baseline">
            <p className="eyebrow">Built by</p>
            <span className="leader" aria-hidden />
            <p className="text-[14px]">Studio of Little Dreams</p>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <Button full variant="quiet" onClick={onBack}>
          Done
        </Button>
      </div>

      <ConfirmDialog
        open={confirm !== null && dialog !== null}
        title={dialog?.title ?? ''}
        body={dialog?.body ?? ''}
        confirmLabel={dialog?.confirmLabel ?? 'Confirm'}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
    </div>
  )
}

function SettingsRow({
  label,
  hint,
  onClick,
}: {
  label: string
  hint: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-baseline px-5 py-4 text-left active:bg-[#F2F4F0]"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] text-ink">{label}</span>
        <span className="mt-1 block text-[12px] text-faint">{hint}</span>
      </span>
      <span className="ml-3 shrink-0 text-[13px] text-soft">›</span>
    </button>
  )
}
