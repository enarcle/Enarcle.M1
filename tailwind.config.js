/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS variable bridge — responds to data-theme automatically
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',

        // Enarcle semantic tokens
        'en-base':     'var(--bg-base)',
        'en-surface':  'var(--bg-surface)',
        'en-card':     'var(--bg-card)',
        'en-elevated': 'var(--bg-elevated)',
        'en-overlay':  'var(--bg-overlay)',
        'en-border':   'var(--border)',
        'en-text':     'var(--text-primary)',
        'en-muted':    'var(--text-muted)',
        'en-dim':      'var(--text-dim)',

        // Brand blue — #1772FF
        'en-blue':      '#1772FF',
        'en-blue-h':    '#3888FF',
        'en-blue-dim':  'rgba(23,114,255,0.12)',

        // Status
        'en-green':  'var(--green)',
        'en-red':    'var(--red)',
        'en-amber':  'var(--amber)',
      },

      fontFamily: {
        sans:    ["'Inter'",  'system-ui', 'sans-serif'],
        display: ["'Sora'",   'system-ui', 'sans-serif'],
        mono:    ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
      },

      borderRadius: {
        sm: '4px', DEFAULT: '6px', md: '8px', lg: '12px', xl: '16px',
        '2xl': '20px', '3xl': '24px', full: '9999px',
      },

      boxShadow: {
        'en-sm':   'var(--shadow-sm)',
        'en-md':   'var(--shadow-md)',
        'en-lg':   'var(--shadow-lg)',
        'en-xl':   'var(--shadow-xl)',
        'en-blue': 'var(--shadow-blue)',
      },

      keyframes: {
        'fade-up':    { from: { opacity:'0', transform:'translateY(20px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        'fade-in':    { from: { opacity:'0' }, to: { opacity:'1' } },
        'scale-in':   { from: { opacity:'0', transform:'scale(0.96)' }, to: { opacity:'1', transform:'scale(1)' } },
        'live-pulse': { '0%,100%': { opacity:'1', transform:'scale(1)' }, '50%': { opacity:'0.5', transform:'scale(0.85)' } },
        shimmer:      { '0%': { backgroundPosition:'-1000px 0' }, '100%': { backgroundPosition:'1000px 0' } },
      },
      animation: {
        'fade-up':    'fade-up 0.5s ease-out forwards',
        'fade-in':    'fade-in 0.4s ease-out forwards',
        'scale-in':   'scale-in 0.3s ease-out forwards',
        'live-pulse': 'live-pulse 1.4s ease-in-out infinite',
        shimmer:      'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
