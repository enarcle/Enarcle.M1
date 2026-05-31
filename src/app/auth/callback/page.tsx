'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      // Give Supabase time to process the URL hash fragment
      await new Promise(r => setTimeout(r, 500))

      // Try existing session first
      let { data: { session } } = await supabase.auth.getSession()

      // PKCE: exchange auth code if no session yet
      if (!session) {
        const code = new URLSearchParams(window.location.search).get('code')
        if (code) {
          const { data } = await supabase.auth.exchangeCodeForSession(code)
          session = data.session
        }
      }

      if (!session) {
        router.replace('/auth/login')
        return
      }

      // ── Onboarding gate ────────────────────────────────────────────────────
      // Check if this user has completed onboarding.
      // New Google sign-ins will have onboarding_done = false (set by trigger).
      // We check username too because some legacy rows may have onboarding_done
      // null if they pre-date the migration.
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_done, username, full_name')
        .eq('id', session.user.id)
        .single()

      const needsOnboarding =
        !profile ||
        !profile.onboarding_done ||
        !profile.username

      if (needsOnboarding) {
        router.replace('/onboarding')
      } else {
        router.replace('/dashboard')
      }
    }

    handle()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 800, color: '#fff',
        fontFamily: 'Sora,sans-serif',
        boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
        marginBottom: 4,
      }}>
        E
      </div>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '3px solid rgba(99,102,241,0.15)',
        borderTopColor: '#6366f1',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#71717a', fontFamily: 'Inter,sans-serif', fontSize: 14, margin: 0 }}>
        Signing you in…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
