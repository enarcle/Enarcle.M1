'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme:       Theme
  toggleTheme: () => void
  isDark:      boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme:       'dark',
  toggleTheme: () => {},
  isDark:      true,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with dark — avoids flash before localStorage is read
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Read saved preference on mount
    const saved = localStorage.getItem('enarcle-theme') as Theme | null
    const preferred = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    setTheme(preferred)
    document.documentElement.setAttribute('data-theme', preferred)
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('enarcle-theme', next)
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }, [])

  // Prevent flash — render children immediately but CSS vars are already set
  // via the inline script in layout.tsx before React hydrates
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
