/** Installed Home Screen / display-mode: standalone (any platform). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

/** iOS (and iPadOS) Home Screen PWA — where the keyboard/visualViewport bug shows up. */
export function isIosStandalone(): boolean {
  if (!isStandalone()) return false
  const ua = window.navigator.userAgent
  const iOS = /iPad|iPhone|iPod/.test(ua)
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return iOS || iPadOs
}

/** Marks <html> for the iOS-standalone sheet max-height rule only. */
export function markStandaloneMode(): void {
  if (typeof document === 'undefined') return
  if (isIosStandalone()) document.documentElement.classList.add('is-ios-standalone')
}
