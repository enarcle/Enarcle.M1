/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Semantic tokens wired to CSS variables (set in globals.css) ─────────
      colors: {
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        // ── Enarcle raw palette tokens ─────────────────────────────────────
        // Backgrounds — obsidian-to-charcoal scale
        'en-base':     '#09090b',   // root page background
        'en-surface':  '#0f0f11',   // primary surface / sidebar
        'en-card':     '#18181b',   // card backgrounds
        'en-elevated': '#1f1f23',   // elevated cards, dropdowns
        'en-overlay':  '#27272a',   // tooltips, hover chips

        // Borders
        'en-border':   'rgba(255,255,255,0.06)',
        'en-border-md':'rgba(255,255,255,0.10)',
        'en-border-lg':'rgba(255,255,255,0.16)',

        // Typography
        'en-text':     '#f4f4f5',   // primary text
        'en-muted':    '#a1a1aa',   // secondary / metadata text
        'en-dim':      '#71717a',   // placeholder, disabled

        // Accent — indigo/violet pair
        'en-indigo':   '#6366f1',   // primary CTA, active state
        'en-indigo-d': '#4f46e5',   // indigo hover / pressed
        'en-violet':   '#8b5cf6',   // live status badge, gradient end
        'en-violet-d': '#7c3aed',   // violet hover

        // Status / semantic
        'en-green':    '#22c55e',   // success
        'en-red':      '#ef4444',   // error / destructive
        'en-amber':    '#f59e0b',   // warning / pending
        'en-blue':     '#3b82f6',   // info

        // Accent dim backgrounds (for badges, chips)
        'en-indigo-dim': 'rgba(99,102,241,0.12)',
        'en-violet-dim': 'rgba(139,92,246,0.12)',
        'en-green-dim':  'rgba(34,197,94,0.10)',
        'en-red-dim':    'rgba(239,68,68,0.10)',
        'en-amber-dim':  'rgba(245,158,11,0.10)',
      },

      // ── Typography ──────────────────────────────────────────────────────────
      fontFamily: {
        // Inter for body copy — tightly legible at small sizes
        sans:    ["'Inter'", 'system-ui', 'sans-serif'],
        body:    ["'Inter'", 'system-ui', 'sans-serif'],
        // Sora for headings, marketing, wordmarks
        display: ["'Sora'",  'system-ui', 'sans-serif'],
        heading: ["'Sora'",  'system-ui', 'sans-serif'],
        // Mono for code blocks, IDs
        mono:    ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
      },

      // ── Font sizes with tight leading ───────────────────────────────────────
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs:    ['0.75rem',  { lineHeight: '1rem' }],
        sm:    ['0.8125rem',{ lineHeight: '1.125rem' }],
        base:  ['0.9375rem',{ lineHeight: '1.5rem' }],
        lg:    ['1.0625rem',{ lineHeight: '1.75rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl': ['3rem',     { lineHeight: '1' }],
        '6xl': ['3.75rem',  { lineHeight: '1' }],
      },

      // ── Border radius ───────────────────────────────────────────────────────
      borderRadius: {
        none: '0',
        sm:   '4px',
        DEFAULT: '6px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        '2xl':'20px',
        '3xl':'24px',
        full: '9999px',
      },

      // ── Spacing extras ──────────────────────────────────────────────────────
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },

      // ── Box shadows ─────────────────────────────────────────────────────────
      boxShadow: {
        'en-sm':    '0 1px 2px rgba(0,0,0,0.4)',
        'en-md':    '0 4px 12px rgba(0,0,0,0.5)',
        'en-lg':    '0 8px 28px rgba(0,0,0,0.6)',
        'en-xl':    '0 16px 48px rgba(0,0,0,0.7)',
        'en-indigo':'0 0 0 3px rgba(99,102,241,0.25)',
        'en-glow':  '0 0 20px rgba(99,102,241,0.3)',
        'en-card':  '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
      },

      // ── Keyframe animations ─────────────────────────────────────────────────
      keyframes: {
        // Accordion (Radix UI compatible)
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to:   { height: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to:   { height: '0', opacity: '0' },
        },
        // Marketing / landing
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        // Live badge pulse
        'live-pulse': {
          '0%, 100%': { opacity: '1',   transform: 'scale(1)' },
          '50%':      { opacity: '0.6', transform: 'scale(0.9)' },
        },
        // Subtle float for hero illustrations
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        // Ticker / marquee scroll
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        // Shimmer loading skeleton
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        // Indigo gradient border spin
        'border-spin': {
          '0%':   { '--border-angle': '0deg' } as Record<string,string>,
          '100%': { '--border-angle': '360deg' } as Record<string,string>,
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-up':        'fade-up 0.5s ease-out forwards',
        'fade-in':        'fade-in 0.4s ease-out forwards',
        'scale-in':       'scale-in 0.3s ease-out forwards',
        'live-pulse':     'live-pulse 1.5s ease-in-out infinite',
        float:            'float 6s ease-in-out infinite',
        ticker:           'ticker 30s linear infinite',
        shimmer:          'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
