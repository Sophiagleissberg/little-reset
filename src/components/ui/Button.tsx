import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/format'

type Variant = 'primary' | 'quiet' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  children: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-paper active:bg-[#0F1411]',
  quiet: 'bg-white text-ink border border-rule active:bg-[#F2F4F0]',
  ghost: 'text-soft active:text-ink',
  danger: 'text-[#8A4F3D] border border-[#E7D3CC] bg-white active:bg-[#F7EEEA]',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-full',
  md: 'h-11 px-5 text-sm rounded-full',
  lg: 'h-14 px-6 text-[15px] rounded-full',
}

export function Button({ variant = 'primary', size = 'md', full, className, children, ...rest }: Props) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-transform duration-150 ease-out active:scale-[0.97]',
        'disabled:opacity-40 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        full && 'w-full',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
