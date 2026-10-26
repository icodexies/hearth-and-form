import { useEffect } from 'react'

const TRACKED_KEY = 'hearth-and-form:visit-tracked'

/**
 * Records one privacy-preserving page view per browser session in production.
 * No cookies, raw IP addresses, names, or email addresses are collected on the client.
 */
export function useVisitTracker(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !import.meta.env.PROD) return
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return
    }

    try {
      if (window.sessionStorage.getItem(TRACKED_KEY)) return
    } catch {
      // Storage can be unavailable in strict privacy modes; tracking can still proceed safely.
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(TRACKED_KEY, '1')
      } catch {
        // Ignore storage failures.
      }

      void fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: window.location.pathname,
          referrer: document.referrer,
        }),
        keepalive: true,
        signal: controller.signal,
      }).catch(() => {
        // Analytics must never interrupt the experience.
      })
    }, 900)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [enabled])
}
