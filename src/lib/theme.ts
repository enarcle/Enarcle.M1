/**
 * Enarcle Design System — Universal Color Token Object
 *
 * Dark mode:  black (#09090b) bg  +  #1772FF brand blue
 * Light mode: white (#ffffff) bg  +  #1772FF brand blue
 *
 * All values are CSS variable references so toggling [data-theme="light"]
 * on <html> instantly repaints every component — zero JS re-renders needed.
 *
 * LEGACY ALIASES at the bottom keep old page code compiling without
 * touching every individual file.
 */

export const C = {
  // ─── Backgrounds ────────────────────────────────────────────────────────────
  bg:           'var(--bg-base)',
  surface:      'var(--bg-surface)',
  card:         'var(--bg-card)',
  elevated:     'var(--bg-elevated)',
  overlay:      'var(--bg-overlay)',

  // ─── Brand Blue (#1772FF) ────────────────────────────────────────────────────
  blue:         'var(--brand-blue)',
  blueHover:    'var(--brand-blue-hover)',
  blueActive:   'var(--brand-blue-active)',
  blueLight:    'var(--brand-blue-light)',    // subtle tinted text / badges
  blueDim:      'var(--brand-blue-dim)',      // very subtle background tint
  blueBorder:   'var(--brand-blue-border)',   // 20% opacity border

  // ─── Typography ─────────────────────────────────────────────────────────────
  text:         'var(--text-primary)',
  textSub:      'var(--text-secondary)',
  textDim:      'var(--text-tertiary)',
  textMuted:    'var(--text-muted)',
  textInverse:  'var(--text-inverse)',

  // ─── Borders & Dividers ──────────────────────────────────────────────────────
  border:       'var(--border-default)',
  borderSub:    'var(--border-subtle)',
  borderFocus:  'var(--border-focus)',

  // ─── Semantic ────────────────────────────────────────────────────────────────
  success:      'var(--semantic-success)',
  successDim:   'var(--semantic-success-dim)',
  warning:      'var(--semantic-warning)',
  warningDim:   'var(--semantic-warning-dim)',
  red:          'var(--semantic-error)',
  redDim:       'var(--semantic-error-dim)',
  live:         'var(--semantic-live)',
  liveDim:      'var(--semantic-live-dim)',

  // ─── Interactive States ──────────────────────────────────────────────────────
  activeColor:  'var(--brand-blue)',          // active nav / selected element color
  activeBg:     'var(--brand-blue-dim)',      // active nav background
  hoverBg:      'var(--hover-bg)',
  focusRing:    'var(--focus-ring)',

  // ─── Typography Scale ────────────────────────────────────────────────────────
  fontSans:     "'Inter', 'DM Sans', system-ui, sans-serif",
  fontDisplay:  "'Sora', 'Inter', sans-serif",
  fontMono:     "'JetBrains Mono', monospace",

  // ─── LEGACY ALIASES ──────────────────────────────────────────────────────────
  // These keep old pages compiling after the import swap.
  // They map old token names → correct new token values.

  // Old indigo tokens (Gritclub used indigo, now brand blue)
  indigo:       'var(--brand-blue)',
  indigoHover:  'var(--brand-blue-hover)',
  indigoL:      'var(--brand-blue-light)',
  indigoDim:    'var(--brand-blue-dim)',
  indigoBorder: 'var(--brand-blue-border)',

  // Old violet tokens (mapped to blue-hover as nearest equivalent)
  violet:       'var(--brand-blue-hover)',
  violetL:      'var(--brand-blue-light)',
  violetDim:    'var(--brand-blue-dim)',

  // Old blueL alias
  blueL:        'var(--brand-blue-light)',

  // Old card/background aliases
  cardHover:    'var(--bg-elevated)',
  bgCard:       'var(--bg-card)',
  bgElevated:   'var(--bg-elevated)',
  bgSurface:    'var(--bg-surface)',

  // Old text aliases
  textPrimary:  'var(--text-primary)',
  textSecondary:'var(--text-secondary)',
  textTertiary: 'var(--text-tertiary)',

  // Old border aliases
  borderColor:  'var(--border-default)',
  borderSubtle: 'var(--border-subtle)',

  // Old semantic aliases
  error:        'var(--semantic-error)',
  errorDim:     'var(--semantic-error-dim)',
  danger:       'var(--semantic-error)',
  dangerDim:    'var(--semantic-error-dim)',
  amber:        'var(--semantic-warning)',
  amberDim:     'var(--semantic-warning-dim)',
  green:        'var(--semantic-success)',
  greenDim:     'var(--semantic-success-dim)',

  // Old active/selected aliases
  selectedBg:   'var(--brand-blue-dim)',
  selectedColor:'var(--brand-blue)',
  navActive:    'var(--brand-blue)',
  navActiveBg:  'var(--brand-blue-dim)',
} as const

export type ThemeColor = typeof C[keyof typeof C]
