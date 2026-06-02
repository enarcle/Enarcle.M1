/**
 * Enarcle Design System — Universal Color Token Object
 *
 * Dark mode:  #09090b black bg  +  #1772FF brand blue  +  chromic white text
 * Light mode: #ffffff white bg  +  #1772FF brand blue  +  chromic black text
 *
 * Every value is a CSS variable reference.
 * Toggling data-theme="light" on <html> instantly repaints everything.
 * 
 * ALL legacy token names are preserved as aliases at the bottom
 * so every page compiles without modification.
 */

export const C = {
  // ─── Backgrounds ─────────────────────────────────────────────────────────────
  bg:             'var(--bg-base)',
  surface:        'var(--bg-surface)',
  card:           'var(--bg-card)',
  elevated:       'var(--bg-elevated)',
  overlay:        'var(--bg-overlay)',

  // ─── Brand Blue (#1772FF) ─────────────────────────────────────────────────────
  blue:           'var(--brand-blue)',
  blueHover:      'var(--brand-blue-hover)',
  blueActive:     'var(--brand-blue-active)',
  blueLight:      'var(--brand-blue-light)',
  blueDim:        'var(--brand-blue-dim)',
  blueBorder:     'var(--brand-blue-border)',

  // ─── Typography ──────────────────────────────────────────────────────────────
  text:           'var(--text-primary)',
  textSub:        'var(--text-secondary)',
  textDim:        'var(--text-tertiary)',
  textMuted:      'var(--text-muted)',
  textInverse:    'var(--text-inverse)',

  // ─── Borders ─────────────────────────────────────────────────────────────────
  border:         'var(--border-default)',
  borderSub:      'var(--border-subtle)',
  borderFocus:    'var(--border-focus)',

  // ─── Semantic Colours ────────────────────────────────────────────────────────
  success:        'var(--semantic-success)',
  successDim:     'var(--semantic-success-dim)',
  warning:        'var(--semantic-warning)',
  warningDim:     'var(--semantic-warning-dim)',
  red:            'var(--semantic-error)',
  redDim:         'var(--semantic-error-dim)',
  live:           'var(--semantic-live)',
  liveDim:        'var(--semantic-live-dim)',

  // ─── Interactive ─────────────────────────────────────────────────────────────
  activeColor:    'var(--brand-blue)',
  activeBg:       'var(--brand-blue-dim)',
  hoverBg:        'var(--hover-bg)',
  focusRing:      'var(--focus-ring)',

  // ─── Shadows ─────────────────────────────────────────────────────────────────
  shadowBlue:     'var(--shadow-blue)',
  shadowXl:       'var(--shadow-xl)',

  // ─── Font Stacks ─────────────────────────────────────────────────────────────
  fontSans:       "'Inter', 'DM Sans', system-ui, sans-serif",
  fontDisplay:    "'Sora', 'Inter', sans-serif",
  fontMono:       "'JetBrains Mono', monospace",

  // ═══════════════════════════════════════════════════════════════════════════════
  // LEGACY ALIASES — keep every existing page compiling without changes
  // ═══════════════════════════════════════════════════════════════════════════════

  // Indigo → Brand Blue
  indigo:         'var(--brand-blue)',
  indigoHover:    'var(--brand-blue-hover)',
  indigoL:        'var(--brand-blue-light)',
  indigoDim:      'var(--brand-blue-dim)',
  indigoBorder:   'var(--brand-blue-border)',

  // Violet → Brand Blue (hover shade)
  violet:         'var(--brand-blue-hover)',
  violetL:        'var(--brand-blue-light)',
  violetDim:      'var(--brand-blue-dim)',

  // Purple → Brand Blue (dark shade)
  purple:         'var(--brand-blue-active)',
  purpleDim:      'var(--brand-blue-dim)',

  // Gold → Warning amber (premium / host badges, pricing highlights)
  gold:           'var(--semantic-warning)',
  goldDim:        'var(--semantic-warning-dim)',

  // Sky → Blue light tint
  sky:            'var(--brand-blue-light)',
  skyDim:         'var(--brand-blue-dim)',

  // Short text aliases
  dim:            'var(--text-tertiary)',
  muted:          'var(--text-muted)',

  // Border variants
  borderHover:    'var(--border-focus)',
  borderMd:       'var(--border-default)',
  borderValid:    'var(--semantic-success)',
  borderF:        'var(--border-focus)',

  // Font head alias
  fontHead:       "'Sora', 'Inter', sans-serif",

  // blueL alias
  blueL:          'var(--brand-blue-light)',

  // Background aliases
  cardHover:      'var(--bg-elevated)',
  bgCard:         'var(--bg-card)',
  bgElevated:     'var(--bg-elevated)',
  bgSurface:      'var(--bg-surface)',

  // Text aliases
  textPrimary:    'var(--text-primary)',
  textSecondary:  'var(--text-secondary)',
  textTertiary:   'var(--text-tertiary)',

  // Border aliases
  borderColor:    'var(--border-default)',
  borderSubtle:   'var(--border-subtle)',

  // Semantic aliases
  error:          'var(--semantic-error)',
  errorDim:       'var(--semantic-error-dim)',
  danger:         'var(--semantic-error)',
  dangerDim:      'var(--semantic-error-dim)',
  amber:          'var(--semantic-warning)',
  amberDim:       'var(--semantic-warning-dim)',
  green:          'var(--semantic-success)',
  greenDim:       'var(--semantic-success-dim)',

  // Nav / selected aliases
  selectedBg:     'var(--brand-blue-dim)',
  selectedColor:  'var(--brand-blue)',
  navActive:      'var(--brand-blue)',
  navActiveBg:    'var(--brand-blue-dim)',
} as const

export type ThemeColor = typeof C[keyof typeof C]
