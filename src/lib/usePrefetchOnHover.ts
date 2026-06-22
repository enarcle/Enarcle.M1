'use client'

/**
 * usePrefetchOnHover
 *
 * Predictive router prefetching — prefetches a Next.js route's JS bundle
 * in the background when the user hovers a nav link for more than 100 ms.
 *
 * The 100 ms gate prevents expensive prefetch work for accidental mouse
 * passes.  Once prefetched, the bundle is cached by the browser so the
 * next navigation renders the target page instantly.
 *
 * Usage:
 *   const { onMouseEnter, onMouseLeave } = usePrefetchOnHover('/dashboard/network')
 *   <Link href="…" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>…</Link>
 */

import { useRouter }   from 'next/navigation'
import { useCallback, useRef } from 'react'

const HOVER_DELAY_MS = 100   // minimum hover dwell before prefetch fires

export function usePrefetchOnHover(href: string) {
  const router    = useRouter()
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prefetched = useRef(false)

  const onMouseEnter = useCallback(() => {
    if (prefetched.current) return           // already done — nothing to do
    timerRef.current = setTimeout(() => {
      router.prefetch(href)
      prefetched.current = true
    }, HOVER_DELAY_MS)
  }, [href, router])

  const onMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return { onMouseEnter, onMouseLeave }
}

/**
 * usePrefetchLinks
 *
 * Batch version: given an array of href strings, returns a map of
 * { href → { onMouseEnter, onMouseLeave } } that a nav list can spread
 * onto each <Link> element.
 *
 * Example:
 *   const prefetch = usePrefetchLinks(['/dashboard', '/dashboard/network'])
 *   <Link href="/dashboard" {...prefetch['/dashboard']}>…</Link>
 */
export function usePrefetchLinks(hrefs: string[]) {
  const router     = useRouter()
  const timers     = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const prefetched = useRef<Record<string, boolean>>({})

  const onMouseEnter = useCallback((href: string) => () => {
    if (prefetched.current[href]) return
    timers.current[href] = setTimeout(() => {
      router.prefetch(href)
      prefetched.current[href] = true
    }, HOVER_DELAY_MS)
  }, [router])

  const onMouseLeave = useCallback((href: string) => () => {
    clearTimeout(timers.current[href])
    delete timers.current[href]
  }, [])

  // Return a stable map so the component doesn't re-render on every call
  const map: Record<string, { onMouseEnter: () => void; onMouseLeave: () => void }> = {}
  for (const href of hrefs) {
    map[href] = {
      onMouseEnter: onMouseEnter(href),
      onMouseLeave: onMouseLeave(href),
    }
  }
  return map
}
