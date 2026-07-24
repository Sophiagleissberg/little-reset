import type { ReactNode } from 'react'

/** Phone width column, centred on anything larger. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-paper">
      <div className="mx-auto w-full max-w-[430px] px-5 pt-[calc(1.75rem+var(--safe-top))] pb-36">
        {children}
      </div>
    </div>
  )
}
