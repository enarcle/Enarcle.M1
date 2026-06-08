'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { useRouter } from 'next/navigation'
import {
  Save, Loader2, Check, Shield, Globe, DollarSign,
  Mic, Users, AlertTriangle, RefreshCw,
} from 'lucide-react'
import { C } from '@/lib/theme'

interface Settings {
  maintenance_mode:   boolean
  new_registrations:  boolean
  host_applications:  boolean
  content_moderation: boolean
  platform_fee:       number
  min_payout_amount:  number
  max_group_members:  number
}

const DEFAULTS: Settings = {
  maintenance_mode:   false,
  new_registrations:  true,
  host_applications:  true,
  content_moderation: true,
  platform_fee:       20,
  min_payout_amount:  50,
  max_group_members:  5,
}

function Toggle({
  label, desc, value, onChange, icon: Icon, color = C.green,
}: {
  label: string; desc: string; value: boolean
  onChange: (v: boolean) => void; icon: any; color?: string
}) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, padding: '14px 16px', borderRadius: 14,
        background: C.surface,
        border: `1px solid ${value ? color + '40' : C.border}`,
        cursor: 'pointer', transition: 'border-color .15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: value ? color + '18' : C.border,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .15s',
        }}>
          <Icon style={{ width: 15, height: 15, color: value ? color : C.textDim }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'DM Sans,sans-serif' }}>{label}</p>
          <p style={{ fontSize: 11, color: C.textMuted, fontFamily: 'DM Sans,sans-serif', marginTop: 2 }}>{desc}</p>
        </div>
      </div>
      <div style={{
        width: 42, height: 24, borderRadius: 12, flexShrink: 0,
        background: value ? color : C.border, position: 'relative',
        transition: 'background .2s',
      }}>
        <div style={{
          position: 'absolute', top: 2, width: 20, height: 20,
          borderRadius: '50%', background: '#fff',
          left: value ? 20 : 2, transition: 'left .2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  const router   = useRouter()
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')

  // Load settings from DB on mount
  useEffect(() => {
    ;(async () => {
      // Auth guard — admin only
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }
      const { data: prof } = await supabase
        .from('users').select('role').eq('id', session.user.id).single()
      if (prof?.role !== 'admin') { router.push('/dashboard'); return }

      const { data, error: err } = await supabase
        .from('platform_settings').select('*').eq('id', 1).single()
      if (err) {
        setError('Could not load settings: ' + err.message)
      } else if (data) {
        setSettings({
          maintenance_mode:   data.maintenance_mode   ?? DEFAULTS.maintenance_mode,
          new_registrations:  data.new_registrations  ?? DEFAULTS.new_registrations,
          host_applications:  data.host_applications  ?? DEFAULTS.host_applications,
          content_moderation: data.content_moderation ?? DEFAULTS.content_moderation,
          platform_fee:       data.platform_fee       ?? DEFAULTS.platform_fee,
          min_payout_amount:  data.min_payout_amount  ?? DEFAULTS.min_payout_amount,
          max_group_members:  data.max_group_members  ?? DEFAULTS.max_group_members,
        })
      }
      setLoading(false)
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false)
    const { data: { session } } = await supabase.auth.getSession()
    const { error: err } = await supabase
      .from('platform_settings')
      .upsert({
        id: 1,
        ...settings,
        updated_at: new Date().toISOString(),
        updated_by: session?.user.id ?? null,
      }, { onConflict: 'id' })

    if (err) {
      setError('Save failed: ' + err.message)
      setSaving(false)
      return
    }
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const upd = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setSettings(p => ({ ...p, [k]: v }))

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 style={{ width: 28, height: 28, color: C.blue, animation: 'spin 1s linear infinite' }} />
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ background: C.bg, minHeight: '100%' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: C.blueLight, fontFamily: 'DM Sans,sans-serif', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Admin</p>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, fontFamily: 'Sora,sans-serif', letterSpacing: '-0.02em' }}>Platform Settings</h1>
              <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'DM Sans,sans-serif', marginTop: 4 }}>
                Changes save to the database and take effect immediately everywhere.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 12, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', background: saved ? C.success : C.blue, color: '#fff', fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: 14, transition: 'background .2s', opacity: saving ? 0.7 : 1 }}>
              {saving
                ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Saving…</>
                : saved
                ? <><Check style={{ width: 15, height: 15 }} />Saved!</>
                : <><Save style={{ width: 15, height: 15 }} />Save Settings</>
              }
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: C.redDim, border: `1px solid rgba(239,68,68,0.3)` }}>
              <AlertTriangle style={{ width: 15, height: 15, color: C.red, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: C.red, fontFamily: 'DM Sans,sans-serif' }}>{error}</p>
            </div>
          )}

          {/* Maintenance warning banner */}
          {settings.maintenance_mode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
              <AlertTriangle style={{ width: 15, height: 15, color: C.red, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: C.red, fontFamily: 'DM Sans,sans-serif', fontWeight: 600 }}>
                Maintenance mode is ON — all non-admin users are blocked from the platform.
              </p>
            </div>
          )}

          {/* Platform Controls */}
          <div style={{ borderRadius: 20, padding: 20, background: C.card, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, fontFamily: 'DM Sans,sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              Platform Controls
            </p>
            <Toggle
              label="Maintenance Mode"
              desc="Block all non-admin users from accessing the platform"
              value={settings.maintenance_mode}
              onChange={v => upd('maintenance_mode', v)}
              icon={Shield}
              color={C.red}
            />
            <Toggle
              label="New Registrations"
              desc="Allow new users to sign up"
              value={settings.new_registrations}
              onChange={v => upd('new_registrations', v)}
              icon={Globe}
              color={C.success}
            />
            <Toggle
              label="Host Applications"
              desc="Allow users to apply for host status from their profile"
              value={settings.host_applications}
              onChange={v => upd('host_applications', v)}
              icon={Mic}
              color={C.blue}
            />
            <Toggle
              label="Content Moderation"
              desc="Enable automated content filtering across posts and messages"
              value={settings.content_moderation}
              onChange={v => upd('content_moderation', v)}
              icon={Shield}
              color={C.warning}
            />
          </div>

          {/* Revenue & Limits */}
          <div style={{ borderRadius: 20, padding: 20, background: C.card, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, fontFamily: 'DM Sans,sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Revenue &amp; Limits
            </p>

            {/* Platform Fee */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'DM Sans,sans-serif' }}>Platform Fee</p>
                  <p style={{ fontSize: 11, color: C.textMuted, fontFamily: 'DM Sans,sans-serif', marginTop: 2 }}>Host keeps {100 - settings.platform_fee}% of ticket revenue</p>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.gold, fontFamily: 'Syne,sans-serif' }}>{settings.platform_fee}%</span>
              </div>
              <input type="range" min={5} max={50} step={1} value={settings.platform_fee}
                onChange={e => upd('platform_fee', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: C.gold }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: C.textDim, fontFamily: 'DM Mono,monospace' }}>5%</span>
                <span style={{ fontSize: 10, color: C.textDim, fontFamily: 'DM Mono,monospace' }}>50%</span>
              </div>
            </div>

            {/* Min Payout */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'DM Sans,sans-serif' }}>Minimum Payout</p>
                  <p style={{ fontSize: 11, color: C.textMuted, fontFamily: 'DM Sans,sans-serif', marginTop: 2 }}>Minimum earnings before a host can request payout</p>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.blueLight, fontFamily: 'Syne,sans-serif' }}>${settings.min_payout_amount}</span>
              </div>
              <input type="range" min={10} max={500} step={5} value={settings.min_payout_amount}
                onChange={e => upd('min_payout_amount', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: C.blue }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: C.textDim, fontFamily: 'DM Mono,monospace' }}>$10</span>
                <span style={{ fontSize: 10, color: C.textDim, fontFamily: 'DM Mono,monospace' }}>$500</span>
              </div>
            </div>

            {/* Max Group Members */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'DM Sans,sans-serif' }}>Free Group Member Limit</p>
                  <p style={{ fontSize: 11, color: C.textMuted, fontFamily: 'DM Sans,sans-serif', marginTop: 2 }}>Members allowed in a free circle before upgrade is required</p>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.success, fontFamily: 'Syne,sans-serif' }}>{settings.max_group_members}</span>
              </div>
              <input type="range" min={1} max={50} step={1} value={settings.max_group_members}
                onChange={e => upd('max_group_members', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: C.success }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: C.textDim, fontFamily: 'DM Mono,monospace' }}>1</span>
                <span style={{ fontSize: 10, color: C.textDim, fontFamily: 'DM Mono,monospace' }}>50</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: '14px 18px', borderRadius: 14, background: C.blueDim, border: `1px solid ${C.blueBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <RefreshCw style={{ width: 14, height: 14, color: C.blueLight, flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: C.blueLight, fontFamily: 'DM Sans,sans-serif', lineHeight: 1.6 }}>
                Settings are saved to the database and broadcast in real-time via Supabase. Every page that reads platform settings will reflect changes within seconds — no cache clear or redeploy needed.
              </p>
            </div>
          </div>

        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  )
}
