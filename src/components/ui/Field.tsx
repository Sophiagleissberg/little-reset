import type { ReactNode } from 'react'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {children}
      {hint ? <span className="mt-2 block text-[12px] text-faint">{hint}</span> : null}
    </label>
  )
}

export const inputClass =
  'w-full h-12 px-4 bg-white border border-rule rounded-2xl text-[15px] text-ink placeholder:text-faint ' +
  'focus:border-care focus:outline-none transition-colors'
