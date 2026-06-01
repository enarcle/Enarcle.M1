'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  Home, Ticket, Users, MessageSquare, MessageCircle, User, BarChart2,
  Calendar, DollarSign, Menu, X, LogOut, Radio, Zap, UserCheck,
  BookOpen, Settings, ChevronRight, Crown, Video,
} from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  id:              string
  full_name:       string | null
  email:           string | null
  username:        string | null
  photo_url:       string | null
  role:            string | null
  is_premium:      boolean | null
  onboarding_done: boolean | null
}

interface AuthUser {
  id:    string
  email: string | null
  user_metadata: {
    full_name?:  string
    avatar_url?: string
  }
}

// ─── Enarcle Design Tokens ────────────────────────────────────────────────────
const C = {
  bg:        '#09090b',
  sidebar:   '#0f0f11',
  card:      '#18181b',
  surface:   '#1f1f23',
  border:    'rgba(255,255,255,0.06)',
  borderMd:  'rgba(255,255,255,0.10)',
  text:      '#f4f4f5',
  textMuted: '#a1a1aa',
  textDim:   '#71717a',
  indigo:    '#6366f1',
  indigoDim: 'rgba(99,102,241,0.12)',
  violet:    '#8b5cf6',
  violetDim: 'rgba(139,92,246,0.12)',
  red:       '#ef4444',
  redDim:    'rgba(239,68,68,0.10)',
  green:     '#22c55e',
  gold:      '#f59e0b',
  goldDim:   'rgba(245,158,11,0.10)',
  fontSora:  "'Sora', system-ui, sans-serif",
  fontInter: "'Inter', system-ui, sans-serif",
}

// ─── Nav Definitions ──────────────────────────────────────────────────────────
const AUDIENCE_NAV = [
  { href: '/dashboard',            label: 'Discover',   icon: Home },
  { href: '/dashboard/tickets',    label: 'My Tickets', icon: Ticket },
  { href: '/dashboard/network',    label: 'Network',    icon: Users },
  { href: '/groups',               label: 'Groups',     icon: Zap },
  { href: '/dashboard/community',  label: 'Community',  icon: MessageSquare },
  { href: '/dashboard/messages',   label: 'Messages',   icon: MessageCircle },
  { href: '/dashboard/recordings', label: 'Recordings', icon: Video },
  { href: '/dashboard/profile',    label: 'Profile',    icon: User },
]
const HOST_NAV = [
  { href: '/host',                 label: 'Dashboard',    icon: BarChart2 },
  { href: '/host/create',          label: 'Create Event', icon: Calendar },
  { href: '/host/earnings',        label: 'Earnings',     icon: DollarSign },
  { href: '/dashboard/network',    label: 'Network',      icon: Users },
  { href: '/groups',               label: 'Groups',       icon: Zap },
  { href: '/dashboard/community',  label: 'Community',    icon: MessageSquare },
  { href: '/dashboard/recordings', label: 'Recordings',   icon: Video },
  { href: '/dashboard/profile',    label: 'Profile',      icon: User },
]
const ADMIN_NAV = [
  { href: '/admin',          label: 'Overview',       icon: BarChart2 },
  { href: '/admin/users',    label: 'Users',          icon: Users },
  { href: '/admin/hosts',    label: 'Host Approvals', icon: UserCheck },
  { href: '/admin/events',   label: 'Events',         icon: Radio },
  { href: '/admin/groups',   label: 'Groups',         icon: Zap },
  { href: '/admin/content',  label: 'Content',        icon: BookOpen },
  { href: '/admin/revenue',  label: 'Revenue',        icon: DollarSign },
  { href: '/admin/settings', label: 'Settings',       icon: Settings },
]

// ─── Sign Out Modal ───────────────────────────────────────────────────────────
function SignOutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={onCancel} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 360, margin: '0 16px', borderRadius: 16, padding: 28, background: C.card, border: `1px solid ${C.borderMd}`, boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.redDim, border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut style={{ width: 20, height: 20, color: C.red }} />
          </div>
          <div>
            <p style={{ fontFamily: C.fontSora, fontWeight: 600, color: C.text, marginBottom: 6, fontSize: 15 }}>Sign out of Enarcle?</p>
            <p style={{ fontSize: 13, color: C.textDim, fontFamily: C.fontInter, lineHeight: 1.5 }}>You'll need to sign back in to continue.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: C.fontInter, fontWeight: 500, fontSize: 13 }}>Cancel</button>
            <button onClick={onConfirm} style={{ flex: 1, padding: '10px', borderRadius: 10, background: C.red, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: C.fontInter, fontWeight: 600, fontSize: 13 }}>Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ href, label, Icon, active, onClick }: {
  href: string; label: string; Icon: React.ElementType; active: boolean; onClick: () => void
}) {
  return (
    <Link href={href} onClick={onClick} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, margin: '1px 0', cursor: 'pointer', transition: 'background 0.15s, color 0.15s', background: active ? C.indigoDim : 'transparent', color: active ? C.indigo : C.textDim, borderLeft: `2px solid ${active ? C.indigo : 'transparent'}`, fontFamily: C.fontInter, fontSize: 13, fontWeight: active ? 500 : 400 }}
        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.035)'; (e.currentTarget as HTMLElement).style.color = C.textMuted } }}
        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = C.textDim } }}
      >
        <Icon style={{ width: 15, height: 15, flexShrink: 0, opacity: active ? 1 : 0.5 }} />
        {label}
        {active && <ChevronRight style={{ width: 11, height: 11, marginLeft: 'auto', opacity: 0.4 }} />}
      </div>
    </Link>
  )
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────
function SidebarContent({ navItems, role, profile, user, displayName, photoUrl, initials, pathname, onNavClick, onSignOutClick }: {
  navItems: { href: string; label: string; icon: React.ElementType }[]
  role: string; profile: UserProfile | null; user: AuthUser | null
  displayName: string; photoUrl: string | null; initials: string
  pathname: string; onNavClick: () => void; onSignOutClick: () => void
}) {
  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/host')      return pathname === '/host'
    if (href === '/admin')     return pathname === '/admin'
    return pathname.startsWith(href)
  }
  const roleBadge = role !== 'audience' ? {
    bg:     role === 'admin' ? C.redDim    : role === 'host' ? C.violetDim : C.indigoDim,
    color:  role === 'admin' ? C.red       : role === 'host' ? C.violet    : C.indigo,
    border: role === 'admin' ? 'rgba(239,68,68,0.2)' : role === 'host' ? 'rgba(139,92,246,0.2)' : 'rgba(99,102,241,0.2)',
  } : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo */}
      <div style={{ padding: '18px 14px 14px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.fontSora, fontWeight: 800, fontSize: 12, color: '#fff', boxShadow: '0 2px 8px rgba(99,102,241,0.4)' }}>E</div>
          <div>
            <div style={{ fontFamily: C.fontSora, fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#6366f1 0%,#818cf8 50%,#8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ENARCLE</div>
            {roleBadge && <span style={{ display: 'inline-block', marginTop: 2, fontSize: 9, fontFamily: C.fontInter, fontWeight: 700, padding: '1px 6px', borderRadius: 3, letterSpacing: '0.1em', textTransform: 'uppercase', background: roleBadge.bg, color: roleBadge.color, border: `1px solid ${roleBadge.border}` }}>{role}</span>}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        {navItems.map(item => (
          <NavItem key={item.href} href={item.href} label={item.label} Icon={item.icon} active={isActive(item.href)} onClick={onNavClick} />
        ))}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
          <Link href="/pricing" onClick={onNavClick} style={{ textDecoration: 'none', display: 'block' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, color: profile?.is_premium ? C.gold : C.textDim, fontFamily: C.fontInter, fontSize: 13, cursor: 'pointer', transition: 'background 0.15s', background: profile?.is_premium ? C.goldDim : 'transparent', border: profile?.is_premium ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent' }}
              onMouseEnter={e => { if (!profile?.is_premium) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.035)' }}
              onMouseLeave={e => { if (!profile?.is_premium) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Crown style={{ width: 14, height: 14, flexShrink: 0, opacity: 0.7 }} />
              {profile?.is_premium ? '✦ Premium' : 'Upgrade Plan'}
            </div>
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div style={{ flexShrink: 0, padding: '6px 6px 8px', borderTop: `1px solid ${C.border}` }}>
        <Link href="/dashboard/profile" onClick={onNavClick} style={{ textDecoration: 'none', display: 'block', marginBottom: 2 }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.025)', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
          >
            <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontFamily: C.fontSora, fontWeight: 700, fontSize: 11, color: '#fff' }}>
              {photoUrl ? <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: C.fontSora, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{displayName}</p>
              <p style={{ fontSize: 11, color: C.textDim, fontFamily: C.fontInter, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{user?.email}</p>
            </div>
          </div>
        </Link>
        <button
          onClick={onSignOutClick}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: C.textDim, fontFamily: C.fontInter, fontSize: 12, fontWeight: 400, transition: 'background 0.15s, color 0.15s' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = C.redDim; el.style.color = C.red }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = C.textDim }}
        >
          <LogOut style={{ width: 13, height: 13, flexShrink: 0 }} /> Sign Out
        </button>
      </div>
    </div>
  )
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()

  const [user,        setUser]        = useState<AuthUser | null>(null)
  const [profile,     setProfile]     = useState<UserProfile | null>(null)
  const [role,        setRole]        = useState('audience')
  const [showSignOut, setShowSignOut] = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (!u) { router.push('/auth/login'); return }
        setUser(u as AuthUser)

        // ── FIX: wrapped in try/catch ──────────────────────────────────────
        // If the users table is missing columns, Supabase returns an error
        // object. Without this catch, the unhandled rejection becomes the
        // "client-side exception" shown in the browser.
        try {
          const { data: prof, error: profErr } = await supabase
            .from('users')
            .select('id, full_name, email, username, photo_url, role, is_premium, onboarding_done')
            .eq('id', u.id)
            .single()

          if (profErr) {
            // Log for debugging but don't crash — fall through with no profile
            console.warn('[DashboardLayout] profile fetch error:', profErr.message)
            return
          }

          if (prof) {
            const p = prof as UserProfile
            setProfile(p)
            setRole(p.role || 'audience')
            // Redirect to onboarding if setup is incomplete
            if (!p.username && !p.onboarding_done && pathname !== '/onboarding') {
              router.push('/onboarding')
            }
          }
        } catch (profileErr) {
          console.warn('[DashboardLayout] profile error (non-fatal):', profileErr)
        }

      } catch (authErr) {
        console.error('[DashboardLayout] auth error:', authErr)
        router.push('/auth/login')
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/')
  }, [router])

  const closeMobile   = useCallback(() => setMobileOpen(false), [])
  const openSignOut   = useCallback(() => setShowSignOut(true), [])
  const cancelSignOut = useCallback(() => setShowSignOut(false), [])

  const navItems = role === 'admin' ? ADMIN_NAV : role === 'host' ? HOST_NAV : AUDIENCE_NAV

  const displayName = profile?.full_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'User'

  const photoUrl = profile?.photo_url || user?.user_metadata?.avatar_url || null
  const initials = displayName.slice(0, 2).toUpperCase()

  const sidebarProps = {
    navItems, role, profile, user, displayName, photoUrl, initials,
    pathname, onNavClick: closeMobile, onSignOutClick: openSignOut,
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .en-sidebar     { display: flex !important; }
          .en-mobile-top  { display: none !important; }
          .en-mobile-nav  { display: none !important; }
          .en-desktop-bar { display: flex !important; }
        }
        .en-mobile-nav { padding-bottom: env(safe-area-inset-bottom, 0px); }
      `}</style>

      {showSignOut && <SignOutModal onConfirm={handleSignOut} onCancel={cancelSignOut} />}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={closeMobile} />
          <aside style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 240, background: C.sidebar, borderRight: `1px solid ${C.border}`, overflow: 'hidden', zIndex: 1 }}>
            <button onClick={closeMobile} style={{ position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: C.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              <X style={{ width: 13, height: 13 }} />
            </button>
            <SidebarContent {...sidebarProps} />
          </aside>
        </div>
      )}

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg }}>
        {/* Desktop sidebar */}
        <aside className="en-sidebar" style={{ display: 'none', flexDirection: 'column', width: 216, flexShrink: 0, height: '100%', background: C.sidebar, borderRight: `1px solid ${C.border}` }}>
          <SidebarContent {...sidebarProps} />
        </aside>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
          {/* Desktop topbar */}
          <div className="en-desktop-bar" style={{ display: 'none', alignItems: 'center', justifyContent: 'flex-end', padding: '0 18px', height: 44, background: C.sidebar, borderBottom: `1px solid ${C.border}`, flexShrink: 0, gap: 10 }}>
            {user && <NotificationBell userId={user.id} />}
          </div>

          {/* Mobile topbar */}
          <div className="en-mobile-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', height: 52, background: C.sidebar, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, padding: 4, display: 'flex' }}>
              <Menu style={{ width: 20, height: 20 }} />
            </button>
            <span style={{ fontFamily: C.fontSora, fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#6366f1 0%,#818cf8 50%,#8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ENARCLE</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user && <NotificationBell userId={user.id} />}
              <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: C.fontSora, flexShrink: 0 }}>
                {photoUrl ? <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
            </div>
          </div>

          {/* Page content */}
          <main style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {children}
          </main>

          {/* Mobile bottom nav */}
          <nav className="en-mobile-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: 58, background: C.sidebar, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
            {navItems.slice(0, 5).map(item => {
              const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/host' && item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '5px 10px', flex: 1 }}>
                  <item.icon style={{ width: 18, height: 18, color: active ? C.indigo : C.textDim }} />
                  <span style={{ fontSize: 9, color: active ? C.indigo : C.textDim, fontFamily: C.fontInter, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
