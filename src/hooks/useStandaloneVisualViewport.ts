import { useEffect } from 'react'
import { isIosStandalone } from '../lib/standalone'

/**
 * Keeps --visual-viewport-* CSS vars in sync while a sheet is open on an iOS
 * Home Screen PWA. No-ops in Safari browser tabs so existing behaviour is preserved.
 */
export function useStandaloneVisualViewport(active: boolean): void {
  useEffect(() => {
    if (!active || !isIosStandalone()) return

    const vv = window.visualViewport
    if (!vv) return

    const root = document.documentElement

    const sync = () => {
      root.style.setProperty('--visual-viewport-height', `${vv.height}px`)
      root.style.setProperty('--visual-viewport-offset-top', `${vv.offsetTop}px`)
    }

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT') {
        return
      }
      // Keep the field in view inside the sheet scroller without yanking it to the top.
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
      root.style.removeProperty('--visual-viewport-height')
      root.style.removeProperty('--visual-viewport-offset-top')
    }
  }, [active])
}
