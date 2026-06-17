'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { useRouter } from 'next/navigation'
import { C } from '@/lib/theme'
import { Users, AlertCircle, Lock, Globe, CheckSquare, Loader2 } from 'lucide-react'

const CATEGORIES = ['SaaS', 'Fintech', 'Health', 'E-commerce', 'AI', 'Social', 'Web3', 'Other']

export default function CreateGroupPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({
    name:             '',
    description:      '',
    category:         'SaaS',
    is_private:       false,
    require_approval: false,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) { router.push('/auth/login'); return }
      setUser(u)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !form.name.trim()) return
    setLoading(true)
    setError('')

    const { data: group, error: gErr } = await supabase
      .from('groups')
      .insert({
        name:             form.name.trim(),
        description:      form.description.trim() || null,
        category:         form.category,
        owner_id:         user.id,
        created_by:       user.id,
        is_private:       form.is_private,
        require_approval: form.is_private ? true : form.require_approval,
        member_count:     1,
      })
      .select()
      .single()

    if (gErr) { setError(gErr.message); setLoading(false); return }

    // Owner row — always active, never pending. This MUST succeed, otherwise
    // the group page will see 0 members and overwrite member_count to 0.
    const { error: memErr } = await supabase.from('group_members').insert({
      group_id: group.id,
      user_id:  user.id,
      role:     'owner',
      status:   'active',
    })
    if (memErr) {
      console.error('[CreateGroup] owner member_members insert failed:', memErr.message)
      setError('Circle created but failed to add you as owner: ' + memErr.message + '. Please contact support.')
      setLoading(false)
      return
    }

    // Blank shared note — non-critical, ignore failure
    await supabase.from('group_notes').insert({
      group_id:   group.id,
      content:    '# Circle Notes\n\nStart collaborating here...',
      updated_by: user.id,
    }).maybeSingle()

    router.push(`/groups/${group.id}`)
  }

  // When is_private is toggled ON, require_approval is force-true
  const setPrivate = (val: boolean) =>
    setForm(f => ({ ...f, is_private: val, require_approval: val ? true : f.require_approval }))

  const Toggle = ({ on, onToggle, label, sub }: { on: boolean; onToggle: () => void; label: string; sub: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: C.surface, border: `1px solid ${on ? C.blueBorder : C.border}`, transition: 'border-color .15s', cursor: 'pointer' }} onClick={onToggle}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'DM Sans,sans-serif' }}>{label}</p>
        <p style={{ fontSize: 11, color: C.textMuted, fontFamily: 'DM Sans,sans-serif', marginTop: 2 }}>{sub}</p>
      </div>
      <div style={{ width: 44, height: 24, borderRadius: 12, background: on ? C.blue : C.border, position: 'relative', flexShrink: 0, transition: 'background .15s' }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 4px rgba(0,0,0,0.35)' }} />
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.blueLight, fontFamily: 'DM Sans,sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            Circles
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.text, fontFamily: 'Syne,sans-serif', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Create a Circle
          </h1>
          <p style={{ fontSize: 13, color: C.textMuted, fontFamily: 'DM Sans,sans-serif' }}>
            Build a high-performance group around a shared goal.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20, borderRadius: 16, background: C.card, border: `1px solid ${C.border}`, marginBottom: 16 }}>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textSub, fontFamily: 'DM Sans,sans-serif', marginBottom: 6 }}>
                Circle Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. AI Scheduling SaaS, DeFi Protocol..."
                required
                maxLength={60}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none', fontFamily: 'DM Sans,sans-serif', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = C.blue)}
                onBlur={e  => (e.target.style.borderColor = C.border)}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textSub, fontFamily: 'DM Sans,sans-serif', marginBottom: 6 }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What are you building? What kind of members are you looking for?"
                rows={3}
                maxLength={400}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'DM Sans,sans-serif', lineHeight: 1.5, boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = C.blue)}
                onBlur={e  => (e.target.style.borderColor = C.border)}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textSub, fontFamily: 'DM Sans,sans-serif', marginBottom: 8 }}>
                Category
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CATEGORIES.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, category: c })}
                    style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', cursor: 'pointer', border: `1px solid ${form.category === c ? C.blue : C.border}`, background: form.category === c ? C.blueDim : 'transparent', color: form.category === c ? C.blueLight : C.textMuted, transition: 'all .12s' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visibility section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.textDim, fontFamily: 'DM Sans,sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Access & Visibility
            </p>

            <Toggle
              on={form.is_private}
              onToggle={() => setPrivate(!form.is_private)}
              label={form.is_private ? '🔒 Private Circle' : '🌐 Public Circle'}
              sub={form.is_private
                ? 'Only invited members can find and see this circle'
                : 'Anyone can discover and request to join this circle'}
            />

            {/* Require approval — only shown when NOT private (private always requires approval) */}
            {!form.is_private && (
              <Toggle
                on={form.require_approval}
                onToggle={() => setForm(f => ({ ...f, require_approval: !f.require_approval }))}
                label={form.require_approval ? '📋 Approval Required' : '⚡ Instant Join'}
                sub={form.require_approval
                  ? 'You review and approve every join request'
                  : 'Members join instantly with no approval needed'}
              />
            )}

            {/* Summary pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: C.surface, border: `1px solid ${C.borderSub}` }}>
              {form.is_private
                ? <Lock style={{ width: 13, height: 13, color: C.gold, flexShrink: 0 }} />
                : <Globe style={{ width: 13, height: 13, color: C.blueLight, flexShrink: 0 }} />
              }
              <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'DM Sans,sans-serif' }}>
                {form.is_private
                  ? 'Private · All joins need your approval'
                  : form.require_approval
                    ? 'Public · You approve every join request'
                    : 'Public · Members join instantly — no approval needed'
                }
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: C.redDim, border: `1px solid rgba(239,68,68,0.3)`, marginBottom: 14 }}>
              <AlertCircle style={{ width: 14, height: 14, color: C.red, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: C.red, fontFamily: 'DM Sans,sans-serif' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.name.trim()}
            style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: (!loading && form.name.trim()) ? C.blue : C.border, color: (!loading && form.name.trim()) ? '#fff' : C.textDim, fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, cursor: (!loading && form.name.trim()) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .15s' }}
          >
            {loading
              ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />Creating...</>
              : <><Users style={{ width: 16, height: 16 }} />Create Circle</>
            }
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  )
}
