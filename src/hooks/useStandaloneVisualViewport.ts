import { useEffect } from 'react'
import { isIosStandalone } from '../lib/standalone'

/**
 * While an iOS Home Screen sheet is open, expose the keyboard-aware visible
 * height as --sheet-visible-height for max-height only. Does not move overlays
 * or touch pointer-events / transforms on the app shell.
 */
export function useStandaloneVisualViewport(active: boolean): void {
  useEffect(() => {
    if (!active || !isIosStandalone()) return

    const vv = window.visualViewport
    if (!vv) return

    const root = document.documentElement

    const sync = () => {
      // Height only — never offsetTop. Repositioning fixed overlays with
      // offsetTop is what left an invisible full-screen scrim trapping taps.
      root.style.setProperty('--sheet-visible-height', `${vv.height}px`)
    }

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT') {
        return
      }
      const body = target.closest('.sheet-body')
      if (!body) return
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      })
    }

    sync()
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)
    window.addEventListener('focusin', onFocusIn)

    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
      window.removeEventListener('focusin', onFocusIn)
      root.style.removeProperty('--sheet-visible-height')
    }
  }, [active])
}
