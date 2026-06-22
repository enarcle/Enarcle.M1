import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import { AuthProvider }  from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import QueryProvider     from '@/components/QueryProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300','400','500','600','700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})
const sora = Sora({
  subsets: ['latin'],
  weight: ['400','500','600','700','800'],
  variable: '--font-sora',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: { default: 'Enarcle — Enterprise Live Events & Network', template: '%s · Enarcle' },
  description: 'Enarcle is the enterprise-grade platform for live events, private networks, and real-time collaboration.',
  keywords: ['live events','enterprise networking','webrtc','private network'],
  authors: [{ name: 'Enarcle' }],
  creator: 'Enarcle',
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: {
    title: 'Enarcle — Enterprise Live Events & Network',
    description: 'The enterprise platform for live events and private networks.',
    url: 'https://enarcle.com',
    siteName: 'Enarcle',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Enarcle', creator: '@enarcle' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <head>
        {/*
          Anti-flash script — runs before React hydrates.
          Reads saved theme from localStorage and applies data-theme to <html>
          so there is zero flash of wrong theme on page load.
        */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var saved = localStorage.getItem('enarcle-theme');
              var preferred = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
              document.documentElement.setAttribute('data-theme', preferred);
            } catch(e) {
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          })();
        `}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
