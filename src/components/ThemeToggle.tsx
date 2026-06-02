'use client'

import { useTheme } from '@/context/ThemeContext'

interface ThemeToggleProps {
  variant?: 'icon' | 'full'
  size?: number
  className?: string
}

export function ThemeToggle({ variant = 'icon', size = 15, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: variant === 'full' ? '7px 14px' : '7px',
        borderRadius: 8,
        border: '1px solid var(--border-default)',
        background: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: 13,
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background = 'var(--bg-elevated)'
        el.style.color = 'var(--text-primary)'
        el.style.borderColor = 'var(--brand-blue-border)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background = 'var(--bg-card)'
        el.style.color = 'var(--text-secondary)'
        el.style.borderColor = 'var(--border-default)'
      }}
    >
      {isDark ? (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx={12} cy={12} r={5} />
          <line x1={12} y1={1}  x2={12} y2={3}  />
          <line x1={12} y1={21} x2={12} y2={23} />
          <line x1={4.22}  y1={4.22}  x2={5.64}  y2={5.64}  />
          <line x1={18.36} y1={18.36} x2={19.78} y2={19.78} />
          <line x1={1}  y1={12} x2={3}  y2={12} />
          <line x1={21} y1={12} x2={23} y2={12} />
          <line x1={4.22}  y1={19.78} x2={5.64}  y2={18.36} />
          <line x1={18.36} y1={5.64}  x2={19.78} y2={4.22}  />
        </svg>
      ) : (
        <svg width={size - 1} height={size - 1} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      {variant === 'full' && (
        <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
      )}
    </button>
  )
}

export default ThemeToggle
