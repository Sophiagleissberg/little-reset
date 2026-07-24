import { useCallback, useEffect, useRef, useState } from 'react'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

/**
 * Wall clock countdown. It works off timestamps rather than counting ticks, so
 * a backgrounded phone doesn't leave the timer behind.
 */
export function useTimer(minutes: number, onFinish?: () => void) {
  const total = Math.max(1, Math.round(minutes * 60))
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [remaining, setRemaining] = useState(total)
  const endAt = useRef<number | null>(null)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    setRemaining(total)
    setStatus('idle')
    endAt.current = null
  }, [total])

  useEffect(() => {
    if (status !== 'running') return
    const tick = () => {
      if (endAt.current === null) return
      const left = Math.max(0, (endAt.current - Date.now()) / 1000)
      setRemaining(left)
      if (left <= 0) {
        setStatus('finished')
        endAt.current = null
        finishRef.current?.()
      }
    }
    tick()
    const handle = window.setInterval(tick, 200)
    return () => window.clearInterval(handle)
  }, [status])

  const start = useCallback(() => {
    endAt.current = Date.now() + remaining * 1000
    setStatus('running')
  }, [remaining])

  const pause = useCallback(() => {
    if (endAt.current !== null) setRemaining(Math.max(0, (endAt.current - Date.now()) / 1000))
    endAt.current = null
    setStatus('paused')
  }, [])

  const reset = useCallback(() => {
    endAt.current = null
    setRemaining(total)
    setStatus('idle')
  }, [total])

  return {
    status,
    remaining,
    total,
    progress: 1 - remaining / total,
    start,
    pause,
    reset,
  }
}
