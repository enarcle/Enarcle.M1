'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Read persisted preference
    let saved: Theme = 'dark'
    try {
      const stored = localStorage.getItem('enarcle-theme') as Theme | null
      if (stored === 'light' || stored === 'dark') {
        saved = stored
      } else {
        // Respect OS preference for first-time visitors
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        saved = prefersDark ? 'dark' : 'light'
      }
    } catch {
      // localStorage unavailable (SSR guard)
    }
    setThemeState(saved)
    document.documentElement.setAttribute('data-theme', saved)
    setMounted(true)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    try {
      localStorage.setItem('enarcle-theme', t)
    } catch { /* ignore */ }
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  // Prevent flash — render children only after mount (theme is known)
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}
