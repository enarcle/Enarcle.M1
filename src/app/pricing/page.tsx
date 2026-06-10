'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Check, X, Users, Zap, Crown, Star, Building2 } from 'lucide-react'
import Link from 'next/link'
import { C } from '@/lib/theme'

// ── Plans ─────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id:          'free',
    name:        'Free',
    icon:        Users,
    monthlyPrice: 0,
    yearlyPrice:  0,
    yearlySaving: null,
    highlight:   false,
    badge:       null,
    description: 'Start exploring Enarcle',
    cta:         'Get Started Free',
    ctaStyle:    'outline',
    features: [
      'Messages kept for 50 days',
      'Groups (max 5 members)',
      'Community feed access',
      'Basic networking & DMs',
      'Mobile + desktop',
    ],
    missing: [
      'Weekly free event credit',
      'Session recordings',
      'Private group chat',
      'Host events',
    ],
  },
  {
    id:           'pro',
    name:         'Pro',
    icon:         Zap,
    monthlyPrice: 2.5,
    yearlyPrice:  24,
    yearlySaving: '20%',
    highlight:    false,
    badge:        null,
    description:  'Unlimited messaging & networking',
    cta:          'Get Pro',
    ctaStyle:     'blue',
    features: [
      'Unlimited message history',
      'Groups (max 5 members)',
      'Private group chat',
      'Full networking features',
      'Community feed',
      'Priority DMs',
    ],
    missing: [
      'Weekly free event credit',
      'Session recordings',
      'Larger group size',
    ],
  },
  {
    id:           'premium',
    name:         'Premium',
    icon:         Crown,
    monthlyPrice: 20,
    yearlyPrice:  192,
    yearlySaving: '20%',
    highlight:    true,
    badge:        '★ Most Popular',
    description:  'Recordings + bigger groups',
    cta:          'Get Premium',
    ctaStyle:     'gold',
    features: [
      'Everything in Pro',
      'Recordings of events you enrolled/paid for',
      'Recordings of free events you attended',
      'Groups up to 40 members',
      'Private group calls',
      'Shared group notes & files',
    ],
    missing: [
      'Weekly free event credit',
      'Unlimited group members',
    ],
  },
  {
    id:           'premium_pro',
    name:         'Premium Pro',
    icon:         Star,
    monthlyPrice: 50,
    yearlyPrice:  480,
    yearlySaving: '20%',
    highlight:    false,
    badge:        '⚡ All Access',
    description:  'The complete Enarcle experience',
    cta:          'Get Premium Pro',
    ctaStyle:     'purple',
    features: [
      'Everything in Premium',
      '1 free event credit every week',
      'Recordings of all enrolled events',
      'Groups up to 150 members',
      'VIP badge + priority access',
      'Host events — keep 80% revenue',
      'Priority 1:1 support',
    ],
    missing: [],
  },
]

// ── Comparison table rows ─────────────────────────────────────────────────────
const TABLE_ROWS = [
  { label: 'Message history',           free: '50 days',   pro: 'Unlimited', premium: 'Unlimited', premPro: 'Unlimited' },
  { label: 'Weekly free event credit',  free: false,       pro: false,       premium: false,       premPro: true        },
  { label: 'Group member limit',        free: '5',         pro: '5',         premium: '40',        premPro: '150'       },
  { label: 'Private group chat',        free: false,       pro: true,        premium: true,        premPro: true        },
  { label: 'Session recordings',        free: false,       pro: false,       premium: 'Enrolled',  premPro: 'Enrolled'  },
  { label: 'Group video calls',         free: false,       pro: false,       premium: true,        premPro: true        },
  { label: 'Shared notes & files',      free: false,       pro: false,       premium: true,        premPro: true        },
  { label: 'Host events',               free: false,       pro: false,       premium: false,       premPro: true        },
  { label: 'Host keeps 80% revenue',    free: false,       pro: false,       premium: false,       premPro: true        },
  { label: 'VIP badge',                 free: false,       pro: false,       premium: false,       premPro: true        },
  { label: 'Priority support',          free: false,       pro: false,       premium: false,       premPro: true        },
]

function Cell({ val }: { val: boolean | string }) {
  if (val === true)  return <span style={{ color: '#32D74B', fontSize: 17 }}>✓</span>
  if (val === false) return <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 15 }}>—</span>
  return <span style={{ fontSize: 12, color: C.textMuted }}>{val}</span>
}

function PricingNavButtons() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [checking,   setChecking]   = React.useState(true)
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
      setChecking(false)
    })
  }, [])
  if (checking) return null
  if (isLoggedIn) return (
    <Link href="/dashboard" style={{ textDecoration: 'none', fontSize: 13, fontWeight: 700, color: '#000', padding: '7px 18px', borderRadius: 8, background: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      Dashboard
    </Link>
  )
  return (
    <>
      <Link href="/auth/login" style={{ textDecoration: 'none', fontSize: 13, color: 'rgba(255,255,255,0.6)', padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)' }}>Sign In</Link>
      <Link href="/auth/login" style={{ textDecoration: 'none', fontSize: 13, fontWeight: 700, color: '#000', padding: '7px 16px', borderRadius: 8, background: '#FFFFFF' }}>Join Free</Link>
    </>
  )
}

export default function PricingPage() {
  const router  = useRouter()
  const [annual,  setAnnual]  = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleCta = async (plan: typeof PLANS[0]) => {
    if (plan.id === 'free') { router.push('/auth/login'); return }

    setLoading(plan.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/auth/login?plan=${plan.id}&billing=${annual ? 'yearly' : 'monthly'}`)
        setLoading(null)
        return
      }

      const res = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId:    plan.id,
          billing:   annual ? 'yearly' : 'monthly',
          userId:    user.id,
          userEmail: user.email,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Checkout error: ' + (data.error || 'Unknown error'))
    } catch (e: any) {
      alert('Error: ' + e.message)
    }
    setLoading(null)
  }

  const displayPrice = (plan: typeof PLANS[0]) => {
    if (plan.monthlyPrice === 0) return 'Free'
    const price = annual ? (plan.yearlyPrice / 12) : plan.monthlyPrice
    return `$${price % 1 === 0 ? price : price.toFixed(2)}`
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .plan-card { animation: fadeUp 0.5s ease both; transition: transform 0.25s, box-shadow 0.25s; }
        .plan-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.5); }
        .plan-card:nth-child(1){animation-delay:0.05s}
        .plan-card:nth-child(2){animation-delay:0.1s}
        .plan-card:nth-child(3){animation-delay:0.15s}
        .plan-card:nth-child(4){animation-delay:0.2s}
        * { box-sizing: border-box; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: 60, background: 'rgba(11,11,12,0.95)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px,4vw,48px)' }}>
        <Link href="/" style={{ textDecoration: 'none', fontWeight: 800, fontSize: 17, color: C.text, fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}>ENARCLE</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PricingNavButtons />
        </div>
      </nav>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '48px clamp(16px,4vw,32px) 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>Simple Pricing</p>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 'clamp(28px,5vw,52px)', letterSpacing: '-0.02em', marginBottom: 14 }}>
            Choose Your Plan
          </h1>
          <p style={{ fontSize: 16, color: C.textMuted, maxWidth: 480, margin: '0 auto 28px' }}>
            Start free. Upgrade when you need more history, bigger groups, or recordings.
          </p>

          {/* Annual toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '6px 6px 6px 16px', borderRadius: 40, background: C.card, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13, color: annual ? C.textMuted : C.text, fontWeight: annual ? 400 : 700 }}>Monthly</span>
            <button onClick={() => setAnnual(p => !p)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative', background: annual ? '#C7C7CC' : 'rgba(255,255,255,0.1)', transition: 'background .2s' }}>
              <div style={{ position: 'absolute', top: 3, left: annual ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
            </button>
            <span style={{ fontSize: 13, color: annual ? C.text : C.textMuted, fontWeight: annual ? 700 : 400 }}>Annual</span>
            {annual && <span style={{ fontSize: 11, fontWeight: 700, color: '#000', background: '#32D74B', padding: '2px 8px', borderRadius: 10 }}>Save 20%</span>}
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 64 }}>
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const isFree = plan.monthlyPrice === 0
            return (
              <div key={plan.id} className="plan-card" style={{
                borderRadius: 20,
                padding: 28,
                background: plan.highlight ? `linear-gradient(145deg, ${C.card}, #1a1a1c)` : C.card,
                border: `1px solid ${plan.highlight ? 'rgba(199,199,204,0.4)' : C.border}`,
                boxShadow: plan.highlight ? '0 0 40px rgba(199,199,204,0.08)' : 'none',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Badge */}
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: 20, background: plan.id === 'premium_pro' ? 'linear-gradient(135deg,#C7C7CC,#FFFFFF)' : 'linear-gradient(135deg,#C7C7CC,#FFFFFF)', fontSize: 11, fontWeight: 800, color: '#000', whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}

                {/* Icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: plan.badge ? 8 : 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: 19, height: 19, color: C.text }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: 'Sora, sans-serif', marginBottom: 2 }}>{plan.name}</h2>
                    <p style={{ fontSize: 12, color: C.textDim }}>{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
                  {isFree ? (
                    <div style={{ fontSize: 38, fontWeight: 800, color: C.text, fontFamily: 'Sora, sans-serif' }}>Free</div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                        <span style={{ fontSize: 14, color: C.textMuted }}>$</span>
                        <span style={{ fontSize: 42, fontWeight: 800, color: C.text, fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>
                          {annual
                            ? (plan.yearlyPrice / 12) % 1 === 0
                              ? plan.yearlyPrice / 12
                              : (plan.yearlyPrice / 12).toFixed(2)
                            : plan.monthlyPrice % 1 === 0
                              ? plan.monthlyPrice
                              : plan.monthlyPrice.toFixed(2)
                          }
                        </span>
                        <span style={{ fontSize: 13, color: C.textMuted }}>/mo</span>
                      </div>
                      {annual && plan.yearlyPrice ? (
                        <div style={{ fontSize: 12, color: '#32D74B', fontWeight: 600, marginTop: 4 }}>
                          ${plan.yearlyPrice}/yr — save {plan.yearlySaving}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
                          ${plan.yearlyPrice}/yr billed annually
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'rgba(50,215,75,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 9, color: '#32D74B', fontWeight: 700 }}>✓</span>
                      </div>
                      <span style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.slice(0, 2).map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, opacity: 0.35 }}>
                      <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <X style={{ width: 8, height: 8, color: C.textDim }} />
                      </div>
                      <span style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleCta(plan)}
                  disabled={loading === plan.id}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 12,
                    border: plan.ctaStyle === 'outline' ? `1px solid ${C.border}` : 'none',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    opacity: loading === plan.id ? 0.7 : 1,
                    transition: 'opacity .15s, transform .15s',
                    background:
                      plan.ctaStyle === 'gold'   ? 'linear-gradient(135deg,#C7C7CC,#FFFFFF)' :
                      plan.ctaStyle === 'blue'   ? 'linear-gradient(135deg,#FFFFFF,#C7C7CC)' :
                      plan.ctaStyle === 'purple' ? 'linear-gradient(135deg,#C7C7CC,#8A8A8F)' :
                      'transparent',
                    color: plan.ctaStyle === 'outline' ? C.textMuted : '#000',
                  }}
                  onMouseEnter={e => { if (loading !== plan.id) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                >
                  {loading === plan.id
                    ? <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                    : plan.cta
                  }
                </button>
              </div>
            )
          })}
        </div>

        {/* Comparison table */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${C.border}` }}>
          <div style={{ padding: '16px 20px', background: C.card, borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: 'Sora, sans-serif', margin: 0 }}>Full Comparison</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.card }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, width: '30%' }}>Feature</th>
                  {['Free', 'Pro', 'Premium', 'Premium Pro'].map((h, i) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, borderBottom: `1px solid ${C.border}`, color: i === 2 ? '#C7C7CC' : C.textMuted, letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr key={row.label} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '12px 20px', fontSize: 13, color: C.textMuted }}>{row.label}</td>
                    {[row.free, row.pro, row.premium, row.premPro].map((v, j) => (
                      <td key={j} style={{ padding: '12px 16px', textAlign: 'center' }}><Cell val={v as any} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', padding: '40px 0 0', borderTop: `1px solid ${C.border}`, marginTop: 48 }}>
          <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 8 }}>Questions about pricing?</p>
          <a href="mailto:enarclehq@gmail.com" style={{ fontSize: 14, color: C.text, textDecoration: 'none', fontWeight: 600 }}>enarclehq@gmail.com →</a>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
