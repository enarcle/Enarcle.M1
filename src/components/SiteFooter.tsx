'use client'

/**
 * SiteFooter — full legal + cache policy footer
 * Used on both the public landing page (variant="landing")
 * and the authenticated dashboard (variant="dashboard").
 *
 * Contains three policy sections:
 *   1. Cache Policy
 *   2. Privacy Policy (summary + link to /privacy)
 *   3. Terms & Conditions (summary + link to /terms)
 */

import Link from 'next/link'
import { Shield, RefreshCw, Clock, Lock, FileText, Scale } from 'lucide-react'

interface SiteFooterProps {
  variant?: 'landing' | 'dashboard'
}

const CACHE_POLICIES = [
  {
    icon: Clock,
    title: 'Local Cache · 5 min',
    body: 'All GET requests are cached in your browser for 5 minutes. Every page load after the first is served instantly from cache — no spinner, no wait.',
  },
  {
    icon: RefreshCw,
    title: 'Stale-While-Revalidate',
    body: 'While you read cached data, fresh data is fetched silently in the background and swapped in when ready — no interruption to your flow.',
  },
  {
    icon: Shield,
    title: 'Secure Session Storage',
    body: 'Auth tokens are stored in httpOnly cookies only — never in localStorage or exposed to scripts. Your session is safe even against XSS.',
  },
  {
    icon: Lock,
    title: 'Zero Ad Tracking',
    body: 'Enarcle carries no advertising trackers, no third-party pixels, and never sells your activity data. What you do here stays here.',
  },
]

const PRIVACY_POINTS = [
  'We collect only what you provide: name, email, profile photo, and usage data needed to run the platform.',
  'Your data is never sold or shared with advertisers. It is used solely to operate and improve Enarcle.',
  'You may request deletion of your account and all associated data at any time from your profile settings.',
  'We use industry-standard encryption (TLS 1.3) for all data in transit and at rest.',
]

const TERMS_POINTS = [
  'By using Enarcle you agree to our community standards — no spam, no harassment, no misrepresentation.',
  'Hosts keep 80% of ticket revenue. Enarcle retains 20% to cover infrastructure, payments, and support.',
  'Groups of up to 5 members are free. Larger groups require an active subscription.',
  'Enarcle may suspend accounts that violate these terms, with or without prior notice, at our sole discretion.',
]

export default function SiteFooter({ variant = 'landing' }: SiteFooterProps) {
  const isDash = variant === 'dashboard'

  // Colour tokens — work for both dark landing bg and dashboard surface
  const bg          = isDash ? 'transparent'              : '#09090A'
  const border      = 'rgba(255,255,255,0.07)'
  const text        = '#a1a1aa'
  const textDim     = '#52525b'
  const textStrong  = isDash ? '#e4e4e7' : '#d4d4d8'
  const cardBg      = 'rgba(255,255,255,0.025)'
  const cardBorder  = 'rgba(255,255,255,0.05)'
  const accentBlue  = 'rgba(99,102,241,0.7)'
  const accentGreen = 'rgba(34,197,94,0.7)'
  const accentAmber = 'rgba(245,158,11,0.7)'
  const tagBg       = 'rgba(99,102,241,0.08)'
  const tagBorder   = 'rgba(99,102,241,0.15)'

  const Label = ({ children }: { children: string }) => (
    <p style={{
      fontFamily:    "'Sora', sans-serif",
      fontSize:      10,
      letterSpacing: '0.22em',
      textTransform: 'uppercase' as const,
      color:         textDim,
      fontWeight:    700,
      marginBottom:  16,
    }}>
      {children}
    </p>
  )

  const PolicyCard = ({
    icon: Icon, title, body, accentColor = accentBlue,
  }: { icon: React.ElementType; title: string; body: string; accentColor?: string }) => (
    <div style={{
      background:   cardBg,
      border:       `1px solid ${cardBorder}`,
      borderRadius: 10,
      padding:      '14px 16px',
      display:      'flex',
      gap:          12,
      alignItems:   'flex-start',
    }}>
      <div style={{
        width:          30, height: 30, borderRadius: 7, flexShrink: 0,
        background:     tagBg, border: `1px solid ${tagBorder}`,
        display:        'flex', alignItems: 'center', justifyContent: 'center',
        marginTop:      1,
      }}>
        <Icon style={{ width: 14, height: 14, color: accentColor }} />
      </div>
      <div>
        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: textStrong, margin: '0 0 4px' }}>
          {title}
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: text, lineHeight: 1.6, margin: 0 }}>
          {body}
        </p>
      </div>
    </div>
  )

  return (
    <footer style={{
      background:  bg,
      borderTop:   `1px solid ${border}`,
      padding:     isDash ? '32px 20px 36px' : '48px 24px 36px',
      marginTop:   isDash ? 40 : 0,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── CACHE POLICY ─────────────────────────────────────────────────── */}
        <Label>Cache Policy</Label>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap:                 10,
          marginBottom:        36,
        }}>
          {CACHE_POLICIES.map(p => (
            <PolicyCard key={p.title} icon={p.icon} title={p.title} body={p.body} accentColor={accentBlue} />
          ))}
        </div>

        {/* ── PRIVACY POLICY ───────────────────────────────────────────────── */}
        <Label>Privacy Policy</Label>
        <div style={{
          background:   cardBg,
          border:       `1px solid ${cardBorder}`,
          borderRadius: 12,
          padding:      '18px 20px',
          marginBottom: 36,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield style={{ width: 15, height: 15, color: accentGreen }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: textStrong, margin: '0 0 3px' }}>
                Your privacy is not a product.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: text, margin: 0 }}>
                Summary of how Enarcle handles your data. &nbsp;
                <Link href="/privacy" style={{ color: accentGreen, textDecoration: 'none', fontWeight: 600 }}>
                  Read full policy →
                </Link>
              </p>
            </div>
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 4px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRIVACY_POINTS.map((point, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: accentGreen, flexShrink: 0, fontSize: 12, marginTop: 1 }}>✓</span>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: text, margin: 0, lineHeight: 1.55 }}>
                  {point}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* ── TERMS & CONDITIONS ────────────────────────────────────────────── */}
        <Label>Terms &amp; Conditions</Label>
        <div style={{
          background:   cardBg,
          border:       `1px solid ${cardBorder}`,
          borderRadius: 12,
          padding:      '18px 20px',
          marginBottom: 36,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale style={{ width: 15, height: 15, color: accentAmber }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: textStrong, margin: '0 0 3px' }}>
                Clear rules. No surprises.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: text, margin: 0 }}>
                Key terms at a glance. &nbsp;
                <Link href="/terms" style={{ color: accentAmber, textDecoration: 'none', fontWeight: 600 }}>
                  Read full terms →
                </Link>
              </p>
            </div>
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 4px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TERMS_POINTS.map((point, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: accentAmber, flexShrink: 0, fontSize: 12, marginTop: 1 }}>§</span>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: text, margin: 0, lineHeight: 1.55 }}>
                  {point}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* ── DIVIDER ──────────────────────────────────────────────────────── */}
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${border}, transparent)`, marginBottom: 20 }} />

        {/* ── BOTTOM ROW ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 14, color: textDim, letterSpacing: '-0.01em' }}>
            ENARCLE
          </span>

          <div style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Privacy Policy',    href: '/privacy' },
              { label: 'Terms of Service',  href: '/terms' },
              { label: 'Cookie Settings',   href: '/privacy#cookies' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: textDim, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = textStrong)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = textDim)}
              >
                {label}
              </Link>
            ))}
          </div>

          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: textDim, margin: 0 }}>
            &copy; {new Date().getFullYear()} Enarcle. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  )
}
