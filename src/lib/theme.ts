/**
 * ENARCLE UNIVERSAL COLOR SYSTEM
 *
 * Every page/component imports C from here instead of defining its own palette.
 * All values are CSS custom properties — they automatically switch between
 * dark and light mode when `data-theme` changes on <html>.
 *
 * Brand blue (#1772FF) is the ONLY accent color.
 * Dark mode:  obsidian black  + chromatic white + brand blue
 * Light mode: pure white      + deep charcoal   + brand blue
 */
export const C = {
  // ── Backgrounds ────────────────────────────────────────────────────────────
  bg:         'var(--bg-base)',
  surface:    'var(--bg-surface)',
  card:       'var(--bg-card)',
  elevated:   'var(--bg-elevated)',
  overlay:    'var(--bg-overlay)',

  // ── Borders ────────────────────────────────────────────────────────────────
  border:     'var(--border)',
  borderMd:   'var(--border-md)',
  borderLg:   'var(--border-lg)',

  // ── Typography ─────────────────────────────────────────────────────────────
  text:       'var(--text-primary)',
  textMuted:  'var(--text-muted)',
  textDim:    'var(--text-dim)',

  // ── Brand blue (constant across modes) ─────────────────────────────────────
  blue:       'var(--blue)',
  blueHover:  'var(--blue-hover)',
  blueDim:    'var(--blue-dim)',
  blueBorder: 'var(--blue-border)',

  // ── Semantic ────────────────────────────────────────────────────────────────
  green:      'var(--green)',
  greenDim:   'var(--green-dim)',
  red:        'var(--red)',
  redDim:     'var(--red-dim)',
  amber:      'var(--amber)',
  amberDim:   'var(--amber-dim)',

  // ── Shadows ─────────────────────────────────────────────────────────────────
  shadowSm:   'var(--shadow-sm)',
  shadowMd:   'var(--shadow-md)',
  shadowLg:   'var(--shadow-lg)',
  shadowXl:   'var(--shadow-xl)',
  shadowBlue: 'var(--shadow-blue)',

  // ── Component tokens ────────────────────────────────────────────────────────
  inputBg:    'var(--input-bg)',
  inputBorder:'var(--input-border)',
  navActiveBg:'var(--nav-active-bg)',

  // ── Typography families ─────────────────────────────────────────────────────
  fontSans:   "'Inter', system-ui, sans-serif",
  fontDisplay:"'Sora', system-ui, sans-serif",
  fontMono:   "'JetBrains Mono', monospace",
} as const

/**
 * Returns inline styles for a primary CTA button using brand blue
 */
export const btnPrimary = (disabled = false): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '11px 22px', borderRadius: 10, border: 'none',
  background: disabled ? 'var(--bg-elevated)' : 'var(--blue)',
  color: disabled ? 'var(--text-dim)' : '#ffffff',
  fontFamily: C.fontSans, fontWeight: 700, fontSize: 14,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  boxShadow: disabled ? 'none' : 'var(--shadow-blue)',
  transition: 'opacity 0.15s, box-shadow 0.15s',
})

export const btnSecondary = (): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '10px 18px', borderRadius: 10,
  background: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-md)',
  fontFamily: C.fontSans, fontWeight: 500, fontSize: 14,
  cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
})

export const btnGhost = (): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '10px 18px', borderRadius: 10,
  background: 'transparent',
  color: 'var(--text-muted)',
  border: '1px solid transparent',
  fontFamily: C.fontSans, fontWeight: 500, fontSize: 14,
  cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
})

export const inputStyle = (focused = false, error = false): React.CSSProperties => ({
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  background: 'var(--input-bg)',
  color: 'var(--text-primary)',
  border: `1px solid ${error ? 'var(--red)' : focused ? 'var(--blue)' : 'var(--input-border)'}`,
  fontFamily: C.fontSans, fontSize: 14,
  outline: 'none',
  boxShadow: focused ? '0 0 0 3px var(--blue-dim)' : 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
})

export const cardStyle = (elevated = false): React.CSSProperties => ({
  background: elevated ? 'var(--bg-elevated)' : 'var(--bg-card)',
  border: `1px solid ${elevated ? 'var(--border-md)' : 'var(--border)'}`,
  borderRadius: 12,
  boxShadow: elevated ? 'var(--shadow-md)' : 'none',
})
