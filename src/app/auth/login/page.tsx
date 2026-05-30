'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

function LoginForm() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [router])

  const handleGoogle = async () => {
    if (loading) return   // FIX: prevent double-click
    setLoading(true)
    setError('')

    const { error: authErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    })

    if (authErr) {
      setError(authErr.message)
      setLoading(false)
    }
    // If no error — we're navigating to Google, setLoading stays true
    // to keep the button disabled until the page unloads
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#09090b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter,system-ui,sans-serif',
      padding: 16,
    }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: 36,
        background: '#18181b',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            fontSize: 22, fontWeight: 800, color: '#fff',
            fontFamily: 'Sora,sans-serif',
            boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
          }}>
            E
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f4f4f5', margin: 0, fontFamily: 'Sora,sans-serif', letterSpacing: '-0.02em' }}>
            Enarcle
          </h1>
          <p style={{ fontSize: 14, color: '#71717a', marginTop: 6, fontFamily: 'Inter,sans-serif' }}>
            Sign in to continue
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, marginBottom: 20,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', fontSize: 14, fontFamily: 'Inter,sans-serif',
          }}>
            {error}
          </div>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.10)',
            background: loading ? '#1f2937' : '#1f2937',
            color: '#f4f4f5',
            fontSize: 15, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
            fontFamily: 'Inter,sans-serif',
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.18)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.10)' }}
        >
          {loading ? (
            <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite', color: '#818cf8' }}/>
          ) : (
            /* Google G icon */
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          )}
          {loading ? 'Redirecting to Google…' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 20px' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>
          <span style={{ fontSize: 11, color: '#52525b', fontFamily: 'Inter,sans-serif', letterSpacing: '0.08em' }}>SECURE LOGIN</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }}/>
        </div>

        {/* Trust line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span style={{ fontSize: 12, color: '#52525b', fontFamily: 'Inter,sans-serif' }}>
            Protected by Supabase Auth
          </span>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#52525b', fontFamily: 'Inter,sans-serif', margin: 0 }}>
          By signing in you agree to our{' '}
          <a href="/terms" style={{ color: '#818cf8', textDecoration: 'none' }}>Terms</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: '#818cf8', textDecoration: 'none' }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm/>
    </Suspense>
  )
}
