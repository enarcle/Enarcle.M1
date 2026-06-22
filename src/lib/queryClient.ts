/**
 * Enarcle – React Query client configuration
 *
 * Strategy:
 *  • staleTime  5 min  → data served from cache immediately; no spinner on re-visit
 *  • gcTime     10 min → inactive cache entries stay in memory for 10 min after
 *                        the last subscriber unmounts (allows instant back-nav)
 *  • refetchOnWindowFocus true → silent background revalidation when tab regains focus
 *  • retry 1          → one silent retry on network failure before showing error
 *
 * Together these give "stale-while-revalidate": the user sees local cache
 * instantly and React Query silently updates it in the background.
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            5 * 60 * 1000,   // 5 minutes — serve cache immediately
      gcTime:               10 * 60 * 1000,  // 10 minutes — keep inactive cache alive
      refetchOnWindowFocus: true,             // silent background revalidation on focus
      refetchOnReconnect:   true,             // revalidate when network comes back
      retry:                1,               // one silent retry before surfacing error
    },
  },
})
