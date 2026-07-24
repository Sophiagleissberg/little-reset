import { cx } from '../../lib/format'

export type Tab = 'today' | 'habits' | 'spending'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'habits', label: 'Habits' },
  { id: 'spending', label: 'Spending' },
]

export function TabBar({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center pointer-events-none">
      <div className="w-full max-w-[430px] px-5 pb-[calc(0.9rem+var(--safe-bottom))] pt-6
                      bg-gradient-to-t from-paper via-paper to-transparent pointer-events-auto">
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/90 backdrop-blur border border-rule shadow-card">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-current={active === tab.id ? 'page' : undefined}
              className={cx(
                'flex-1 h-11 rounded-full text-[13px] font-medium tracking-[0.01em]',
                'transition-all duration-200 ease-out active:scale-[0.97]',
                active === tab.id ? 'bg-ink text-paper' : 'text-soft'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
