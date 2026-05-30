'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      // Allow Supabase to process the URL hash fragment automatically
      await new Promise(r => setTimeout(r, 500))

      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        router.replace('/dashboard')
      } else {
        // PKCE: exchange auth code for session
        const code = new URLSearchParams(window.location.search).get('code')
        if (code) {
          await supabase.auth.exchangeCodeForSession(code)
          router.replace('/dashboard')
        } else {
          router.replace('/auth/login')
        }
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
      {/* Indigo spinner — Enarcle brand */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '3px solid rgba(99,102,241,0.15)',
        borderTopColor: '#6366f1',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <p style={{ color: '#71717a', fontFamily: 'Inter,sans-serif', fontSize: 14, margin: 0 }}>
        Signing you in…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
