import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

/* ── Fonts — loaded via next/font for zero-FOUT, self-hosted, tree-shaken ── */
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
  preload: true,
})

/* ── Metadata ────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: 'Enarcle — Enterprise Live Events & Network',
    template: '%s · Enarcle',
  },
  description:
    'Enarcle is the enterprise-grade platform for live events, private networks, and real-time collaboration. Host, connect, and grow.',
  keywords: ['live events', 'enterprise networking', 'webrtc', 'private network', 'virtual events'],
  authors: [{ name: 'Enarcle' }],
  creator: 'Enarcle',
  icons: {
    icon:  '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title:       'Enarcle — Enterprise Live Events & Network',
    description: 'The enterprise-grade platform for live events, private networks, and real-time collaboration.',
    url:         'https://enarcle.com',
    siteName:    'Enarcle',
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Enarcle',
    description: 'Enterprise-grade live events and private networks.',
    creator:     '@enarcle',
  },
  robots: {
    index:  true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor:    '#09090b',
  width:         'device-width',
  initialScale:  1,
  maximumScale:  1,
}

/* ── Root Layout ─────────────────────────────────────────────────────────── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          JetBrains Mono — loaded separately (code/mono usage is sparse enough
          that next/font's inline CSS is overkill here; a targeted preconnect is
          lighter).  We only load the weights actually used.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          background: '#09090b',
          color:      '#f4f4f5',
          /*
            Wire up next/font CSS variables so our Tailwind font-family
            utilities (font-sans, font-display) reference them correctly.
          */
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        }}
      >
        {/*
          AuthProvider — preserved exactly from original codebase.
          Handles Supabase session hydration, onAuthStateChange,
          and exposes useAuth() hook to the entire tree.
        */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
