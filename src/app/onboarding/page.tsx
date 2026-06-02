'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  Upload, Check, X, AlertCircle, User, AtSign,
  ChevronRight, ChevronLeft, Loader2, Calendar,
  Briefcase, Sparkles, ArrowRight,
} from 'lucide-react'

// ─── Enarcle Design Tokens ────────────────────────────────────────────────────
import { C } from '@/lib/theme'

// ─── Field options ────────────────────────────────────────────────────────────
const GENDER_OPTIONS = [
  { value: 'male',              label: 'Male' },
  { value: 'female',            label: 'Female' },
  { value: 'non-binary',        label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const INTEREST_OPTIONS = [
  { value: 'entrepreneur',    label: '🚀 Entrepreneur',       desc: 'Building your own venture' },
  { value: 'startup_founder', label: '⚡ Startup Founder',    desc: 'Early-stage company' },
  { value: 'investor',        label: '💰 Investor / VC',      desc: 'Funding startups' },
  { value: 'product',         label: '🎯 Product Manager',    desc: 'Building great products' },
  { value: 'engineer',        label: '⚙️ Engineer / Dev',     desc: 'Building with technology' },
  { value: 'designer',        label: '🎨 Designer / Creative', desc: 'UX, brand, or content' },
  { value: 'marketing',       label: '📣 Marketing / Growth', desc: 'Growing businesses' },
  { value: 'sales',           label: '🤝 Sales / BizDev',     desc: 'Revenue and partnerships' },
  { value: 'finance',         label: '📊 Finance / CFO',      desc: 'Numbers and strategy' },
  { value: 'consultant',      label: '💼 Consultant',         desc: 'Advisory and strategy' },
  { value: 'student',         label: '🎓 Student',            desc: 'Learning and exploring' },
  { value: 'other',           label: '✨ Other',              desc: 'Something unique' },
]

const ROLE_OPTIONS = [
  {
    value:  'audience',
    label:  'Attendee',
    desc:   'Attend events, connect with others, join the community',
    icon:   '👤',
    color:  C.indigoDim,
    border: 'rgba(99,102,241,0.25)',
    text:   C.indigoL,
  },
  {
    value:  'host',
    label:  'Host / Speaker',
    desc:   'Host live events, stream to your audience, monetize content',
    icon:   '🎤',
    color:  C.violetDim,
    border: 'rgba(139,92,246,0.25)',
    text:   C.violet,
  },
]

// ─── Validation helpers ───────────────────────────────────────────────────────
const SQL_KEYWORDS = ['select','insert','update','delete','drop','union','exec','cast','script']

function sanitizeUsername(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30)
}

function validateUsername(val: string): string | null {
  if (!val) return 'Username is required'
  if (val.length < 3) return 'At least 3 characters'
  if (val.length > 30) return 'Max 30 characters'
  if (!/^[a-zA-Z0-9_]+$/.test(val)) return 'Letters, numbers and underscores only'
  const low = val.toLowerCase()
  for (const kw of SQL_KEYWORDS) if (low.includes(kw)) return `"${kw}" is not allowed`
  return null
}

function validateFullName(val: string): string | null {
  if (!val.trim()) return 'Full name is required'
  if (val.trim().length < 2) return 'Name too short'
  if (val.trim().length > 80) return 'Max 80 characters'
  if (/<[^>]*>/.test(val)) return 'Invalid characters'
  return null
}

function getAge(dob: string): number {
  if (!dob) return 0
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// ─── Sub-components ───────────────────────────────────────────────────────────
type AvailStatus = 'idle' | 'checking' | 'available' | 'taken'

function StepDot({ n, current, done }: { n: number; current: number; done: boolean }) {
  const active = current === n
  const past   = done || current > n
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, fontFamily: 'Inter,sans-serif',
      flexShrink: 0, transition: 'all 0.2s',
      background: past ? C.indigo : active ? C.indigoDim : 'transparent',
      color:      past ? '#fff'   : active ? C.indigoL   : C.textDim,
      border:     `2px solid ${past ? C.indigo : active ? C.indigo : C.border}`,
    }}>
      {past && !active ? <Check style={{ width: 12, height: 12 }} /> : n}
    </div>
  )
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const LABELS = ['Identity', 'About You', 'Interests', 'Your Role']
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 12 }}>
        {LABELS.map((label, i) => {
          const n = i + 1
          const isLast = n === total
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <StepDot n={n} current={step} done={step > n} />
                <span style={{ fontSize: 9, fontWeight: 600, color: step >= n ? C.indigoL : C.textDim, fontFamily: 'Inter,sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {!isLast && (
                <div style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: 18, borderRadius: 2, background: step > n ? C.indigo : C.border, transition: 'background 0.3s' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AvatarUpload({ preview, onFile, uploading }: {
  preview:   string | null
  onFile:    (f: File) => void
  uploading: boolean
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) onFile(file)
  }, [onFile])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          width: 88, height: 88, borderRadius: '50%', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
          background: preview ? 'transparent' : C.indigoDim,
          border: `2px dashed ${dragging ? C.indigoL : preview ? C.indigo : C.border}`,
          transition: 'all 0.15s',
        }}>
        {uploading ? (
          <Loader2 style={{ width: 22, height: 22, color: C.indigoL, animation: 'spin 1s linear infinite' }} />
        ) : preview ? (
          <>
            <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
              <Upload style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <User style={{ width: 28, height: 28, color: C.textDim }} />
            <span style={{ fontSize: 9, color: C.textDim, fontFamily: 'Inter,sans-serif' }}>Upload</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      <p style={{ fontSize: 11, color: C.textDim, fontFamily: 'Inter,sans-serif', textAlign: 'center' }}>
        Optional · JPG, PNG · Max 5MB
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const TOTAL_STEPS = 4

  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Step 1 — Identity
  const [fullName,      setFullName]      = useState('')
  const [username,      setUsername]      = useState('')
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploading,     setUploading]     = useState(false)
  const [availStatus,   setAvailStatus]   = useState<AvailStatus>('idle')
  const [nameError,     setNameError]     = useState<string | null>(null)
  const [userError,     setUserError]     = useState<string | null>(null)

  // Step 2 — About you
  const [dob,    setDob]    = useState('')
  const [gender, setGender] = useState('')
  const [dobError, setDobError] = useState<string | null>(null)

  // Step 3 — Interests (multi-select)
  const [interests, setInterests] = useState<string[]>([])

  // Step 4 — Role
  const [role, setRole] = useState('audience')

  // Submit state
  const [saving,  setSaving]  = useState(false)
  const [saveErr, setSaveErr] = useState('')

  const checkTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  // ── Username handling ────────────────────────────────────────────────────────
  const handleUsernameChange = (raw: string) => {
    const s = sanitizeUsername(raw)
    setUsername(s)
    setAvailStatus('idle')
    const err = validateUsername(s)
    if (err) { setUserError(err); return }
    setUserError(null)
    clearTimeout(checkTimeout.current)
    if (s.length >= 3) {
      setAvailStatus('checking')
      checkTimeout.current = setTimeout(async () => {
        const { data } = await supabase.from('users').select('id').eq('username', s).maybeSingle()
        setAvailStatus(data ? 'taken' : 'available')
      }, 500)
    }
  }

  // ── Avatar handling ──────────────────────────────────────────────────────────
  const handleAvatarFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = e => setAvatarPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  // ── Interest toggle ──────────────────────────────────────────────────────────
  const toggleInterest = (val: string) => {
    setInterests(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    )
  }

  // ── Step 1 validation ────────────────────────────────────────────────────────
  const submitStep1 = () => {
    const ne = validateFullName(fullName)
    const ue = validateUsername(username)
    setNameError(ne)
    setUserError(ue)
    if (ne || ue) return
    if (availStatus === 'taken') { setUserError('Username already taken'); return }
    if (availStatus === 'checking') return
    setStep(2)
  }

  // ── Step 2 validation ────────────────────────────────────────────────────────
  const submitStep2 = () => {
    if (dob) {
      const age = getAge(dob)
      if (age < 13) { setDobError('You must be at least 13 to use Enarcle'); return }
      if (age > 120) { setDobError('Please enter a valid date of birth'); return }
    }
    setDobError(null)
    setStep(3)
  }

  // ── Final submit ──────────────────────────────────────────────────────────────
  const handleFinish = async () => {
    if (saving) return
    setSaving(true)
    setSaveErr('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      let photoUrl: string | null = null

      // Upload avatar if provided
      if (avatarFile) {
        setUploading(true)
        const ext  = avatarFile.name.split('.').pop() || 'jpg'
        const path = `${user.id}/avatar.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('profile-images')
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('profile-images').getPublicUrl(path)
          photoUrl = urlData.publicUrl
        }
        setUploading(false)
      }

      // Build update payload — only include fields the user filled in
      const updates: Record<string, unknown> = {
        full_name:        fullName.trim(),
        username:         username,
        role:             role,
        field_of_interest: interests,
        onboarding_done:  true,
        updated_at:       new Date().toISOString(),
      }
      if (gender)   updates.gender         = gender
      if (dob)      updates.date_of_birth  = dob
      if (photoUrl) updates.photo_url      = photoUrl

      const { error: saveErr } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (saveErr) {
        console.error('Save error:', saveErr)
        setSaveErr('Something went wrong. Please try again.')
        setSaving(false)
        return
      }

      // If user wants to be a host, create a host application
      if (role === 'host') {
        await supabase.from('host_applications').upsert({
          user_id: user.id,
          email:   user.email,
          status:  'pending',
        }, { onConflict: 'user_id' })
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
      setSaveErr('An unexpected error occurred. Please try again.')
      setSaving(false)
    }
  }

  // ── Reusable input style ──────────────────────────────────────────────────────
  const inputStyle = (focused: boolean, error?: string | null, valid?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: `1px solid ${error ? C.red : valid ? C.borderValid : focused ? C.borderFocus : C.border}`,
    background: C.surface,
    color: C.text,
    fontFamily: 'Inter,sans-serif',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  })

  // ─── Step 1: Identity ─────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: 'Sora,sans-serif', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Let's set up your identity
        </h2>
        <p style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Inter,sans-serif' }}>
          How the Enarcle community will know you
        </p>
      </div>

      <AvatarUpload preview={avatarPreview} onFile={handleAvatarFile} uploading={uploading} />

      {/* Full name */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'Inter,sans-serif', marginBottom: 6 }}>
          Full Name <span style={{ color: C.red }}>*</span>
        </label>
        <InputFocusWrapper error={nameError}>
          {(focused, handlers) => (
            <input
              type="text"
              value={fullName}
              onChange={e => { setFullName(e.target.value); setNameError(null) }}
              placeholder="e.g. Alex Johnson"
              maxLength={80}
              style={inputStyle(focused, nameError)}
              {...handlers}
            />
          )}
        </InputFocusWrapper>
        {nameError && <FieldError msg={nameError} />}
        <p style={{ fontSize: 11, color: C.textDim, fontFamily: 'Inter,sans-serif', marginTop: 4 }}>Your real name helps others connect with you</p>
      </div>

      {/* Username */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'Inter,sans-serif', marginBottom: 6 }}>
          Username <span style={{ color: C.red }}>*</span>
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <AtSign style={{ position: 'absolute', left: 12, width: 15, height: 15, color: C.textDim, zIndex: 1 }} />
          <InputFocusWrapper error={userError} valid={availStatus === 'available'}>
            {(focused, handlers) => (
              <input
                type="text"
                value={username}
                onChange={e => handleUsernameChange(e.target.value)}
                onPaste={e => { e.preventDefault(); handleUsernameChange(sanitizeUsername(e.clipboardData.getData('text'))) }}
                placeholder="yourhandle"
                maxLength={30}
                style={{ ...inputStyle(focused, userError, availStatus === 'available'), paddingLeft: 34, paddingRight: 36 }}
                {...handlers}
              />
            )}
          </InputFocusWrapper>
          <div style={{ position: 'absolute', right: 12 }}>
            {availStatus === 'checking'  && <Loader2 style={{ width: 14, height: 14, color: C.indigoL, animation: 'spin 1s linear infinite' }} />}
            {availStatus === 'available' && <Check style={{ width: 14, height: 14, color: C.green }} />}
            {availStatus === 'taken'     && <X style={{ width: 14, height: 14, color: C.red }} />}
          </div>
        </div>
        {userError && <FieldError msg={userError} />}
        {!userError && availStatus === 'available' && (
          <p style={{ fontSize: 11, color: C.green, fontFamily: 'Inter,sans-serif', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check style={{ width: 10, height: 10 }} /> @{username} is available
          </p>
        )}
        {!userError && availStatus !== 'available' && (
          <p style={{ fontSize: 11, color: C.textDim, fontFamily: 'Inter,sans-serif', marginTop: 4 }}>3–30 chars · letters, numbers, underscores</p>
        )}
      </div>

      <button
        onClick={submitStep1}
        disabled={!fullName.trim() || !username || !!userError || availStatus === 'taken' || availStatus === 'checking'}
        style={btnStyle(false)}>
        Continue <ChevronRight style={{ width: 16, height: 16 }} />
      </button>
    </div>
  )

  // ─── Step 2: About You ────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: 'Sora,sans-serif', letterSpacing: '-0.02em', marginBottom: 4 }}>
          A little about you
        </h2>
        <p style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Inter,sans-serif' }}>
          Optional — helps us personalise your experience
        </p>
      </div>

      {/* Date of birth */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'Inter,sans-serif', marginBottom: 6 }}>
          <Calendar style={{ width: 13, height: 13, display: 'inline', marginRight: 5 }} />
          Date of Birth
        </label>
        <InputFocusWrapper error={dobError}>
          {(focused, handlers) => (
            <input
              type="date"
              value={dob}
              onChange={e => { setDob(e.target.value); setDobError(null) }}
              max={new Date().toISOString().split('T')[0]}
              style={{
                ...inputStyle(focused, dobError),
                colorScheme: 'dark',
              }}
              {...handlers}
            />
          )}
        </InputFocusWrapper>
        {dobError && <FieldError msg={dobError} />}
        {dob && !dobError && (
          <p style={{ fontSize: 11, color: C.textDim, fontFamily: 'Inter,sans-serif', marginTop: 4 }}>
            Age: {getAge(dob)} years old
          </p>
        )}
      </div>

      {/* Gender */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'Inter,sans-serif', marginBottom: 8 }}>
          Gender
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {GENDER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setGender(gender === opt.value ? '' : opt.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${gender === opt.value ? C.indigo : C.border}`,
                background: gender === opt.value ? C.indigoDim : C.surface,
                color: gender === opt.value ? C.indigoL : C.textMuted,
                fontFamily: 'Inter,sans-serif',
                fontSize: 13,
                fontWeight: gender === opt.value ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setStep(1)} style={btnSecondaryStyle()}>
          <ChevronLeft style={{ width: 15, height: 15 }} /> Back
        </button>
        <button onClick={submitStep2} style={{ ...btnStyle(false), flex: 1 }}>
          Continue <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  )

  // ─── Step 3: Interests ────────────────────────────────────────────────────────
  const renderStep3 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: 'Sora,sans-serif', letterSpacing: '-0.02em', marginBottom: 4 }}>
          What best describes you?
        </h2>
        <p style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Inter,sans-serif' }}>
          Select all that apply — we'll personalise your feed
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 340, overflowY: 'auto', paddingRight: 2 }}>
        {INTEREST_OPTIONS.map(opt => {
          const active = interests.includes(opt.value)
          return (
            <button
              key={opt.value}
              onClick={() => toggleInterest(opt.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: `1px solid ${active ? C.indigo : C.border}`,
                background: active ? C.indigoDim : C.surface,
                color: active ? C.text : C.textMuted,
                fontFamily: 'Inter,sans-serif',
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: active ? C.text : C.textMuted }}>{opt.label}</span>
              <span style={{ fontSize: 10, color: C.textDim }}>{opt.desc}</span>
              {active && <Check style={{ width: 11, height: 11, color: C.indigoL, marginTop: 2 }} />}
            </button>
          )
        })}
      </div>

      {interests.length > 0 && (
        <p style={{ fontSize: 11, color: C.indigoL, fontFamily: 'Inter,sans-serif', textAlign: 'center' }}>
          {interests.length} selected
        </p>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setStep(2)} style={btnSecondaryStyle()}>
          <ChevronLeft style={{ width: 15, height: 15 }} /> Back
        </button>
        <button
          onClick={() => setStep(4)}
          style={{ ...btnStyle(interests.length === 0), flex: 1 }}>
          {interests.length === 0 ? 'Skip' : 'Continue'} <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  )

  // ─── Step 4: Role ─────────────────────────────────────────────────────────────
  const renderStep4 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: 'Sora,sans-serif', letterSpacing: '-0.02em', marginBottom: 4 }}>
          How will you use Enarcle?
        </h2>
        <p style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Inter,sans-serif' }}>
          You can always change this later
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ROLE_OPTIONS.map(opt => {
          const active = role === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setRole(opt.value)}
              style={{
                padding: '16px 18px',
                borderRadius: 12,
                border: `1.5px solid ${active ? opt.border : C.border}`,
                background: active ? opt.color : C.surface,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: active ? opt.text : C.text, fontFamily: 'Sora,sans-serif', margin: 0 }}>
                    {opt.label}
                  </p>
                  {active && <Check style={{ width: 15, height: 15, color: opt.text }} />}
                </div>
                <p style={{ fontSize: 12, color: C.textMuted, fontFamily: 'Inter,sans-serif', margin: '3px 0 0', lineHeight: 1.4 }}>
                  {opt.desc}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {role === 'host' && (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: C.goldDim, border: '1px solid rgba(245,158,11,0.2)' }}>
          <p style={{ fontSize: 12, color: C.gold, fontFamily: 'Inter,sans-serif', lineHeight: 1.5, margin: 0 }}>
            <strong>Host applications</strong> are reviewed by the Enarcle team. You'll be notified once approved. You can still use Enarcle as an attendee in the meantime.
          </p>
        </div>
      )}

      {saveErr && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: C.redDim, border: '1px solid rgba(239,68,68,0.3)' }}>
          <p style={{ fontSize: 13, color: C.red, fontFamily: 'Inter,sans-serif', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle style={{ width: 14, height: 14 }} /> {saveErr}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setStep(3)} style={btnSecondaryStyle()}>
          <ChevronLeft style={{ width: 15, height: 15 }} /> Back
        </button>
        <button
          onClick={handleFinish}
          disabled={saving || uploading}
          style={{ ...btnStyle(saving || uploading), flex: 1 }}>
          {saving
            ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Setting up…</>
            : <>Enter Enarcle <ArrowRight style={{ width: 16, height: 16 }} /></>}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'Inter,sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
      `}</style>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'Sora,sans-serif', boxShadow: '0 6px 24px rgba(99,102,241,0.35)' }}>
            E
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: C.indigoDim, border: '1px solid rgba(99,102,241,0.2)' }}>
            <Sparkles style={{ width: 11, height: 11, color: C.indigoL }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.indigoL, letterSpacing: '0.08em' }}>WELCOME TO ENARCLE</span>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar step={step} total={TOTAL_STEPS} />

        {/* Card */}
        <div style={{ borderRadius: 20, padding: '28px 28px', background: C.card, border: `1px solid ${C.border}`, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: C.textDim, marginTop: 16 }}>
          Your data is encrypted and never shared without consent.
        </p>
      </div>
    </div>
  )
}

// ─── Tiny internal helpers ────────────────────────────────────────────────────

function FieldError({ msg }: { msg: string }) {
  return (
    <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#ef4444', fontFamily: 'Inter,sans-serif', marginTop: 4 }}>
      <AlertCircle style={{ width: 11, height: 11 }} /> {msg}
    </p>
  )
}

// Tiny render-prop wrapper to handle focus state without repeating useState everywhere
function InputFocusWrapper({ children, error, valid }: {
  children: (focused: boolean, handlers: { onFocus: () => void; onBlur: () => void }) => React.ReactNode
  error?: string | null
  valid?: boolean
}) {
  const [focused, setFocused] = useState(false)
  void error; void valid
  return <>{children(focused, { onFocus: () => setFocused(true), onBlur: () => setFocused(false) })}</>
}

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '12px 20px', borderRadius: 12, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
    fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 14,
    opacity: disabled ? 0.45 : 1, transition: 'opacity 0.15s', width: '100%',
  }
}

function btnSecondaryStyle(): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '12px 16px', borderRadius: 12, cursor: 'pointer', flexShrink: 0,
    background: 'transparent', border: `1px solid ${C.border}`,
    color: C.textMuted, fontFamily: 'Inter,sans-serif', fontWeight: 500, fontSize: 13,
    transition: 'background 0.15s',
  }
}
