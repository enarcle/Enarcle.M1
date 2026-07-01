'use client'

import { Suspense } from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { useRouter } from 'next/navigation'
import {
  Send, Search, X, Lock,
  Loader2, MessageCircle, ArrowLeft, Check, CheckCheck, ChevronUp,
} from 'lucide-react'

export const dynamic  = 'force-dynamic'
export const viewport = { themeColor: '#6366f1' }

import { C } from '@/lib/theme'

// ── Constants ─────────────────────────────────────────────────────────────────
const FREE_RETENTION_DAYS = 50          // free tier: messages kept 50 days
const PAGE_SIZE           = 50          // messages loaded per page

// ── Helpers ───────────────────────────────────────────────────────────────────
const ACOLORS = ['#ef4444','#A78BFA','#818cf8','#22C55E','#FFD700','#F97316']
const aBg     = (id: string) => ACOLORS[(id?.charCodeAt(0) || 0) % ACOLORS.length]
const getName = (u: any)     => u?.full_name || u?.email?.split('@')[0] || 'User'
const getInit = (u: any)     => getName(u).slice(0, 2).toUpperCase()

const fmtTime = (ts: string) => {
  if (!ts) return ''
  const d = new Date(ts), now = new Date(), diff = now.getTime() - d.getTime()
  if (diff < 60000)     return 'now'
  if (diff < 3600000)   return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000)  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }: { user: any; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      overflow: 'hidden', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700,
      color: '#fff', background: aBg(user?.id || ''), fontFamily: 'Syne,sans-serif',
    }}>
      {user?.photo_url
        ? <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : getInit(user)
      }
    </div>
  )
}

// ── Retention wall shown to free users when they scroll beyond 50 days ────────
function RetentionWall({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 16px', margin: '8px 0',
      background: 'rgba(99,102,241,0.06)',
      border: '1px solid rgba(99,102,241,0.18)',
      borderRadius: 12,
    }}>
      <Lock style={{ width: 22, height: 22, color: '#818cf8', marginBottom: 8 }} />
      <p style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7', fontFamily: 'Syne,sans-serif', margin: '0 0 4px' }}>
        50-day history limit
      </p>
      <p style={{ fontSize: 12, color: '#a1a1aa', fontFamily: 'Inter,sans-serif', textAlign: 'center', margin: '0 0 12px', lineHeight: 1.55 }}>
        Free accounts keep the last {FREE_RETENTION_DAYS} days of messages.
        Upgrade to Pro for unlimited history.
      </p>
      <button onClick={onUpgrade} style={{
        padding: '7px 18px', borderRadius: 8, border: 'none',
        background: '#6366f1', color: '#fff',
        fontSize: 12, fontWeight: 700, fontFamily: 'Syne,sans-serif', cursor: 'pointer',
      }}>
        Upgrade to Pro →
      </button>
    </div>
  )
}

// ── Convo List ────────────────────────────────────────────────────────────────
function ConvoList({
  convos, activeConvoId, showSearch, searchQ, allUsers,
  onSelectConvo, onToggleSearch, onSearchChange, onStartConvo,
}: {
  convos: any[], activeConvoId: string | null, showSearch: boolean,
  searchQ: string, allUsers: any[],
  onSelectConvo: (c: any) => void,
  onToggleSearch: () => void,
  onSearchChange: (q: string) => void,
  onStartConvo: (u: any) => void,
}) {
  const filtered = convos.filter(c =>
    !searchQ.trim() || getName(c.partner).toLowerCase().includes(searchQ.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.surface, borderRight: `1px solid ${C.border}` }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: 'Syne,sans-serif', margin: 0, letterSpacing: '-0.02em' }}>Messages</h2>
          <button onClick={onToggleSearch} style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: showSearch ? C.redDim : 'rgba(255,255,255,0.06)',
            color: showSearch ? C.indigoL : C.textMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'all .15s',
          }}>
            {showSearch ? <X style={{ width: 15, height: 15 }} /> : <Search style={{ width: 15, height: 15 }} />}
          </button>
        </div>

        {showSearch ? (
          <div>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: C.textDim }} />
              <input autoFocus value={searchQ} onChange={e => onSearchChange(e.target.value)} placeholder="Find people..."
                style={{ width: '100%', padding: '9px 12px 9px 30px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.text, fontSize: 13, outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }} />
            </div>
            {allUsers.length > 0 && (
              <div style={{ marginTop: 8, borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                {allUsers.map(u => (
                  <button key={u.id} onClick={() => onStartConvo(u)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Avatar user={u} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: 'Inter,sans-serif', margin: 0 }}>{getName(u)}</p>
                      <p style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Inter,sans-serif', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: C.textDim }} />
            <input value={searchQ} onChange={e => onSearchChange(e.target.value)} placeholder="Search conversations..."
              style={{ width: '100%', padding: '9px 12px 9px 30px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.text, fontSize: 13, outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }} />
          </div>
        )}
      </div>

      {/* Convo rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 && !showSearch && (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <MessageCircle style={{ width: 34, height: 34, color: C.textDim, margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Inter,sans-serif', marginBottom: 6 }}>No conversations yet</p>
            <p style={{ fontSize: 12, color: C.textDim, fontFamily: 'Inter,sans-serif' }}>Tap the search icon to message someone</p>
          </div>
        )}
        {filtered.map(conv => {
          const isActive = activeConvoId === conv.id
          return (
            <button key={conv.id} onClick={() => onSelectConvo(conv)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 11,
              padding: '11px 16px',
              background: isActive ? C.redDim : 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              borderLeft: `3px solid ${isActive ? C.indigo : 'transparent'}`,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar user={conv.partner} size={42} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? C.indigoL : C.text, fontFamily: 'Inter,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getName(conv.partner)}
                  </span>
                  <span style={{ fontSize: 10, color: C.textDim, flexShrink: 0, marginLeft: 6 }}>
                    {conv.last_message_at ? fmtTime(conv.last_message_at) : ''}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter,sans-serif', margin: 0 }}>
                  {conv.last_message || 'Start a conversation'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Chat Window ───────────────────────────────────────────────────────────────
function ChatWindow({
  activeConvo, messages, me, isPro, isMobile,
  hasMore, loadingMore, onLoadMore, onBack, onUpgrade,
}: {
  activeConvo: any, messages: any[], me: any,
  isPro: boolean, isMobile: boolean,
  hasMore: boolean, loadingMore: boolean,
  onLoadMore: () => void, onBack: () => void, onUpgrade: () => void,
}) {
  const [text, setText]       = useState('')
  const [sending, setSending] = useState(false)
  const chatBottom  = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef   = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages, but not when loading older ones
  const prevLengthRef = useRef(0)
  useEffect(() => {
    const newMsgs = messages.length > prevLengthRef.current
    const addedAtBottom = newMsgs && messages.length - prevLengthRef.current <= 3
    prevLengthRef.current = messages.length
    if (addedAtBottom) {
      requestAnimationFrame(() => chatBottom.current?.scrollIntoView({ behavior: 'smooth' }))
    }
  }, [messages.length])

  useEffect(() => {
    if (activeConvo) setTimeout(() => textareaRef.current?.focus(), 80)
  }, [activeConvo?.id])

  const sendMessage = async () => {
    if (!text.trim() || !activeConvo || !me || sending) return
    const content = text.trim()
    const now     = new Date().toISOString()

    setSending(true)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const { error } = await supabase.from('dm_messages').insert({
      conversation_id: activeConvo.id,
      sender_id:       me.id,
      content,
      msg_type:        'text',
      created_at:      now,
      read_by:         [me.id],
    })

    if (!error) {
      await supabase.from('dm_conversations').update({
        last_message: content, last_message_at: now,
      }).eq('id', activeConvo.id)
    }

    setSending(false)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = e.target; el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  // Check if oldest loaded message is older than 50 days (for free users)
  const retentionCutoff = new Date()
  retentionCutoff.setDate(retentionCutoff.getDate() - FREE_RETENTION_DAYS)
  const showRetentionWall = !isPro && messages.length > 0 &&
    new Date(messages[0]?.created_at) < retentionCutoff

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, background: C.surface, flexShrink: 0 }}>
        {isMobile && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 4, display: 'flex' }}>
            <ArrowLeft style={{ width: 19, height: 19 }} />
          </button>
        )}
        <Avatar user={activeConvo?.partner} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'Syne,sans-serif', margin: 0 }}>{getName(activeConvo?.partner)}</p>
          <p style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Inter,sans-serif', margin: 0 }}>{activeConvo?.partner?.email}</p>
        </div>
        {!isPro && (
          <div style={{ fontSize: 10, color: '#818cf8', fontFamily: 'Inter,sans-serif', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '3px 7px', flexShrink: 0 }}>
            {FREE_RETENTION_DAYS}d history
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Load more older messages */}
        {hasMore && !showRetentionWall && (
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <button onClick={onLoadMore} disabled={loadingMore} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 8,
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
              color: C.textMuted, fontSize: 12, fontFamily: 'Inter,sans-serif', cursor: 'pointer',
            }}>
              {loadingMore
                ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 0.8s linear infinite' }} />
                : <ChevronUp style={{ width: 13, height: 13 }} />
              }
              {loadingMore ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {/* Retention wall for free users */}
        {showRetentionWall && <RetentionWall onUpgrade={onUpgrade} />}

        {messages.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 48 }}>
            <Avatar user={activeConvo?.partner} size={56} />
            <p style={{ fontSize: 15, fontWeight: 600, color: C.text, marginTop: 12, fontFamily: 'Syne,sans-serif' }}>{getName(activeConvo?.partner)}</p>
            <p style={{ fontSize: 12, color: C.textMuted, marginTop: 6, fontFamily: 'Inter,sans-serif' }}>Say hello 👋</p>
          </div>
        )}

        {messages.map(msg => {
          const isOwn  = msg.sender_id === me?.id
          const isRead = (msg.read_by || []).filter((id: string) => id !== me?.id).length > 0
          const isOld  = !isPro && new Date(msg.created_at) < retentionCutoff
          return (
            <div key={msg.id} style={{
              display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start',
              gap: 7, alignItems: 'flex-end',
              opacity: isOld ? 0.35 : 1,
            }}>
              {!isOwn && <Avatar user={activeConvo?.partner} size={26} />}
              <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', gap: 3 }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isOwn ? C.red : '#1f2937',
                  color: '#f4f4f5',
                  fontSize: 14, lineHeight: 1.55,
                  wordBreak: 'break-word', fontFamily: 'Inter,sans-serif',
                  border: isOwn ? 'none' : `1px solid rgba(255,255,255,0.08)`,
                }}>
                  {msg.content}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: 10, color: C.textDim, fontFamily: 'Inter,sans-serif' }}>{fmtTime(msg.created_at)}</span>
                  {isOwn && (isRead
                    ? <CheckCheck style={{ width: 12, height: 12, color: C.red }} />
                    : <Check     style={{ width: 12, height: 12, color: C.textDim }} />
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={chatBottom} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 14px', borderTop: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: '8px 12px' }}>
          <textarea ref={textareaRef} value={text} onChange={handleChange} onKeyDown={handleKeyDown}
            placeholder={`Message ${getName(activeConvo?.partner)}...`} rows={1} maxLength={2000}
            autoComplete="off" style={{
              flex: 1, background: 'transparent', border: 'none',
              color: C.text, fontSize: 14, fontFamily: 'Inter,sans-serif',
              outline: 'none', resize: 'none', lineHeight: 1.5,
              maxHeight: 120, overflowY: 'auto', caretColor: C.red,
            }} />
          <button onClick={sendMessage} disabled={!text.trim() || sending} type="button" style={{
            width: 34, height: 34, borderRadius: 10, border: 'none',
            background: text.trim() ? C.red : 'rgba(255,255,255,0.06)',
            color: text.trim() ? '#fff' : C.textDim,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: text.trim() ? 'pointer' : 'default',
            flexShrink: 0, transition: 'all 0.15s',
          }}>
            {sending
              ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 0.8s linear infinite' }} />
              : <Send    style={{ width: 15, height: 15 }} />
            }
          </button>
        </div>
        <p style={{ fontSize: 10, color: C.textDim, textAlign: 'center', marginTop: 5, fontFamily: 'Inter,sans-serif' }}>
          Enter to send · Shift+Enter for new line
          {!isPro && <span style={{ color: '#818cf8', marginLeft: 8 }}>· {FREE_RETENTION_DAYS}-day history</span>}
        </p>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: C.bg, gap: 14 }}>
      <div style={{ width: 68, height: 68, borderRadius: '50%', background: C.redDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MessageCircle style={{ width: 30, height: 30, color: C.red }} />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: 'Syne,sans-serif', margin: 0 }}>Your Messages</h3>
      <p style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', maxWidth: 260, fontFamily: 'Inter,sans-serif', lineHeight: 1.65, margin: 0 }}>
        Connect privately with anyone on Enarcle.
      </p>
      <button onClick={onNewChat} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px',
        borderRadius: 10, border: 'none', background: C.red, color: '#fff',
        fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer',
      }}>
        <Search style={{ width: 15, height: 15 }} /> Start a conversation
      </button>
    </div>
  )
}

// ── Main DMPage ───────────────────────────────────────────────────────────────
function DMPage() {
  const router      = useRouter()
  const queryClient = useQueryClient()

  const [me,          setMe]          = useState<any>(null)
  const [isPro,       setIsPro]       = useState(false)
  const [convos,      setConvos]      = useState<any[]>([])
  const [activeConvo, setActiveConvo] = useState<any>(null)
  const [messages,    setMessages]    = useState<any[]>([])
  const [msgPage,     setMsgPage]     = useState(0)      // 0 = first page loaded
  const [hasMore,     setHasMore]     = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [bootDone,    setBootDone]    = useState(false)
  const [searchQ,     setSearchQ]     = useState('')
  const [allUsers,    setAllUsers]    = useState<any[]>([])
  const [showSearch,  setShowSearch]  = useState(false)
  const [mobileView,  setMobileView]  = useState<'list' | 'chat'>('list')
  const [winW,        setWinW]        = useState(1200)

  const msgChannel = useRef<any>(null)
  const meRef      = useRef<any>(null)
  const activeRef  = useRef<any>(null)

  useEffect(() => {
    const h = () => setWinW(window.innerWidth)
    h(); window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  const isMobile = winW < 768

  // ── Boot ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const targetUserId = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('user')
      : null

    ;(async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/auth/login'); return }

      meRef.current = u
      setMe(u)

      // Check pro status
      const { data: prof } = await supabase
        .from('users').select('is_premium, role').eq('id', u.id).single()
      const pro = prof?.is_premium === true || prof?.role === 'host' || prof?.role === 'admin'
      setIsPro(pro)

      // Load conversations directly on boot (not through React Query — avoids
      // enabled:false race on first render)
      const convData = await fetchConvos(u.id)
      setConvos(convData)

      if (targetUserId) {
        await openOrCreateConvo(u.id, targetUserId)
      }

      setBootDone(true)
    })()

    return () => { if (msgChannel.current) supabase.removeChannel(msgChannel.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── React Query: keep conversations cache warm after boot ──────────────────
  const { data: cachedConvos } = useQuery({
    queryKey: ['dm-convos', me?.id ?? ''],
    queryFn:  () => fetchConvos(me!.id),
    enabled:  !!me?.id && bootDone,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  // Sync React Query result back into local state (RT updates also write to local state)
  useEffect(() => {
    if (cachedConvos && cachedConvos.length > 0) setConvos(cachedConvos)
  }, [cachedConvos])

  // ── Realtime: new messages in the active conversation ──────────────────────
  useEffect(() => {
    if (!activeConvo?.id || !me?.id) return
    if (msgChannel.current) supabase.removeChannel(msgChannel.current)

    const ch = supabase.channel(`dm-${activeConvo.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'dm_messages',
        filter: `conversation_id=eq.${activeConvo.id}`,
      }, async ({ new: msg }: { new: any }) => {
        // Deduplicate and append
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])

        // Update sidebar last_message preview
        setConvos(prev => prev.map(c =>
          c.id === activeConvo.id
            ? { ...c, last_message: msg.content, last_message_at: msg.created_at }
            : c
        ))

        // Mark incoming as read
        if (msg.sender_id !== me.id) {
          await supabase.from('dm_messages')
            .update({ read_by: [...(msg.read_by || []), me.id] })
            .eq('id', msg.id)
        }
      })
      .subscribe()

    msgChannel.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [activeConvo?.id, me?.id])

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchConvos = async (uid: string) => {
    const { data, error } = await supabase
      .from('dm_conversations')
      .select(`*,
        user_a_data:users!dm_conversations_user_a_fkey(id,full_name,email,photo_url,role),
        user_b_data:users!dm_conversations_user_b_fkey(id,full_name,email,photo_url,role)`)
      .or(`user_a.eq.${uid},user_b.eq.${uid}`)
      .order('last_message_at', { ascending: false })
    if (error) { console.error('fetchConvos:', error.message); return [] }
    return (data ?? []).map((c: any) => ({
      ...c,
      partner: c.user_a === uid ? c.user_b_data : c.user_a_data,
    }))
  }

  // ── Load messages for a conversation (paginated) ───────────────────────────
  // page 0 = newest PAGE_SIZE messages
  // page 1 = previous PAGE_SIZE, etc.
  const fetchMessages = async (convoId: string, page: number, pro: boolean) => {
    // For free users clamp to 50 days
    const cutoff = pro ? null : (() => {
      const d = new Date()
      d.setDate(d.getDate() - FREE_RETENTION_DAYS)
      return d.toISOString()
    })()

    let q = supabase
      .from('dm_messages')
      .select('*')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: false })   // newest first so we can paginate backwards
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (cutoff) q = q.gte('created_at', cutoff)

    const { data, error } = await q
    if (error) { console.error('fetchMessages:', error.message); return [] }
    // Reverse so oldest is at top in the UI
    return (data ?? []).reverse()
  }

  // ── Open a conversation ────────────────────────────────────────────────────
  const openConvo = useCallback(async (conv: any, uid?: string) => {
    const myId = uid || meRef.current?.id
    const pro  = isPro

    setActiveConvo(conv)
    activeRef.current = conv
    setMobileView('chat')
    setMessages([])
    setMsgPage(0)
    setHasMore(false)

    const msgs = await fetchMessages(conv.id, 0, pro)
    setMessages(msgs)
    // If we got a full page there are likely more
    setHasMore(msgs.length === PAGE_SIZE)

    // Mark unread as read
    if (msgs.length && myId) {
      const unread = msgs.filter((m: any) => m.sender_id !== myId && !(m.read_by || []).includes(myId))
      if (unread.length) {
        await Promise.all(unread.map((m: any) =>
          supabase.from('dm_messages')
            .update({ read_by: [...(m.read_by || []), myId] })
            .eq('id', m.id)
        ))
      }
    }
  }, [isPro])

  // ── Load OLDER messages (scroll up / "load more") ─────────────────────────
  const handleLoadMore = useCallback(async () => {
    if (!activeConvo?.id || loadingMore) return
    setLoadingMore(true)
    const nextPage = msgPage + 1
    const older    = await fetchMessages(activeConvo.id, nextPage, isPro)
    if (older.length > 0) {
      // Prepend older messages, keep scroll position
      setMessages(prev => [...older, ...prev])
      setMsgPage(nextPage)
      setHasMore(older.length === PAGE_SIZE)
    } else {
      setHasMore(false)
    }
    setLoadingMore(false)
  }, [activeConvo?.id, msgPage, loadingMore, isPro])

  // ── Open or create a DM conversation ──────────────────────────────────────
  const openOrCreateConvo = async (myId: string, partnerId: string) => {
    const { data: convId, error } = await supabase.rpc('get_or_create_dm', {
      uid_a: myId, uid_b: partnerId,
    })
    if (error) { console.error('get_or_create_dm:', error.message); return }
    if (convId) {
      const { data: conv } = await supabase
        .from('dm_conversations')
        .select(`*,
          user_a_data:users!dm_conversations_user_a_fkey(id,full_name,email,photo_url,role),
          user_b_data:users!dm_conversations_user_b_fkey(id,full_name,email,photo_url,role)`)
        .eq('id', convId).single()
      if (conv) {
        const enriched = { ...conv, partner: conv.user_a === myId ? conv.user_b_data : conv.user_a_data }
        setConvos(prev => {
          const exists = prev.find(c => c.id === enriched.id)
          return exists ? prev : [enriched, ...prev]
        })
        await openConvo(enriched, myId)
        // Invalidate React Query cache so next focus refetches
        queryClient.invalidateQueries({ queryKey: ['dm-convos', myId] })
      }
    }
  }

  // ── Search users to start new conversation ─────────────────────────────────
  const searchUsers = async (q: string) => {
    if (!q.trim()) { setAllUsers([]); return }
    const { data } = await supabase.from('users')
      .select('id,full_name,email,photo_url,role')
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .neq('id', me?.id).limit(10)
    setAllUsers(data || [])
  }

  const handleSearchChange = (q: string) => {
    setSearchQ(q)
    if (showSearch) searchUsers(q)
  }

  const handleToggleSearch = () => {
    setShowSearch(p => !p); setSearchQ(''); setAllUsers([])
  }

  const startConvoWith = async (user: any) => {
    setShowSearch(false); setSearchQ(''); setAllUsers([])
    if (!me) return
    await openOrCreateConvo(me.id, user.id)
  }

  const handleUpgrade = () => router.push('/pricing')

  if (!bootDone) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: C.bg }}>
        <Loader2 style={{ width: 32, height: 32, color: C.red, animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}*{box-sizing:border-box}`}</style>
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
        {(!isMobile || mobileView === 'list') && (
          <div style={{ width: isMobile ? '100%' : 300, flexShrink: 0, height: '100%', overflow: 'hidden' }}>
            <ConvoList
              convos={convos} activeConvoId={activeConvo?.id || null}
              showSearch={showSearch} searchQ={searchQ} allUsers={allUsers}
              onSelectConvo={openConvo} onToggleSearch={handleToggleSearch}
              onSearchChange={handleSearchChange} onStartConvo={startConvoWith}
            />
          </div>
        )}
        {(!isMobile || mobileView === 'chat') && (
          <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
            {activeConvo
              ? <ChatWindow
                  activeConvo={activeConvo}
                  messages={messages}
                  me={me}
                  isPro={isPro}
                  isMobile={isMobile}
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  onLoadMore={handleLoadMore}
                  onBack={() => setMobileView('list')}
                  onUpgrade={handleUpgrade}
                />
              : <EmptyState onNewChat={() => { setShowSearch(true); if (isMobile) setMobileView('list') }} />
            }
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#09090b' }}>
        <div style={{ width: 28, height: 28, border: '3px solid rgba(239,68,68,0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <DMPage />
    </Suspense>
  )
}
