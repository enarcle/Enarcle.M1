'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Bell, Users, Heart, MessageCircle, UserPlus, Megaphone, Loader2 } from 'lucide-react'

const C = {
  bg:       '#09090b',
  surface:  '#18181b',
  card:     '#18181b',
  elevated: '#1f2937',
  border:   'rgba(255,255,255,0.06)',
  text:     '#f4f4f5',
  textMuted:'#a1a1aa',
  textDim:  '#71717a',
  indigo:   '#6366f1',
  indigoL:  '#818cf8',
  indigoDim:'rgba(99,102,241,0.12)',
  red:      '#ef4444',
  green:    '#22c55e',
}

const AVATAR_COLORS = ['#6366f1','#8b5cf6','#db2777','#d97706','#059669','#0891b2']
const avatarColor = (id: string) => AVATAR_COLORS[(id?.charCodeAt(0) || 0) % AVATAR_COLORS.length]
const getName = (u: Record<string,unknown> | null) =>
  (u?.full_name as string) || (u?.email as string)?.split('@')[0] || 'User'

const timeAgo = (ts: string) => {
  const d = Date.now() - new Date(ts).getTime()
  const m = Math.floor(d / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

interface NotifMeta {
  icon: React.ElementType
  color: string
}

const NOTIF_ICON: Record<string, NotifMeta> = {
  connection_request:  { icon: UserPlus,      color: '#6366f1' },
  connection_accepted: { icon: Users,         color: '#22c55e' },
  follow:              { icon: UserPlus,      color: '#8b5cf6' },
  post_like:           { icon: Heart,         color: '#ef4444' },
  post_comment:        { icon: MessageCircle, color: '#818cf8' },
  announcement:        { icon: Megaphone,     color: '#f59e0b' },
}

interface Notification {
  id: string
  type: string
  title: string
  body?: string
  is_read: boolean
  created_at: string
  link?: string
  actor?: Record<string,unknown> | null
}

export default function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter()
  const [open,    setOpen]    = useState(false)
  const [notifs,  setNotifs]  = useState<Notification[]>([])
  const [unread,  setUnread]  = useState(0)
  const [loading, setLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)

  const loadNotifs = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*, actor:actor_id(id, full_name, email, photo_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
    setNotifs((data || []) as Notification[])
    setUnread(((data || []) as Notification[]).filter(n => !n.is_read).length)
    setLoading(false)
  }

  useEffect(() => {
    if (!userId) return
    loadNotifs()
    const ch = supabase
      .channel(`notif-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'notifications', filter: `user_id=eq.${userId}`,
      }, payload => {
        setNotifs(prev => [payload.new as Notification, ...prev])
        setUnread(c => c + 1)
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnread(0)
  }

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnread(c => Math.max(0, c - 1))
  }

  const handleClick = async (notif: Notification) => {
    if (!notif.is_read) await markRead(notif.id)
    setOpen(false)
    if (notif.link) router.push(notif.link)
  }

  return (
    <div ref={panelRef} style={{ position:'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(p => !p); if (!open) loadNotifs() }}
        style={{
          position:'relative', width:38, height:38, borderRadius:10,
          border:`1px solid ${open ? 'rgba(99,102,241,0.35)' : C.border}`,
          cursor:'pointer',
          background: open ? C.indigoDim : 'transparent',
          color: open ? C.indigoL : C.textMuted,
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          transition:'all 0.15s',
        }}>
        <Bell style={{ width:17, height:17 }}/>
        {unread > 0 && (
          <span style={{
            position:'absolute', top:-4, right:-4, minWidth:18, height:18, borderRadius:9,
            background: C.red, color:'#fff', fontSize:10, fontWeight:800,
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:'0 4px', border:`2px solid ${C.bg}`, fontFamily:'Inter,sans-serif',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position:'absolute', right:0, top:46, width:340, maxHeight:480, borderRadius:16,
          background:C.card, border:`1px solid ${C.border}`,
          boxShadow:'0 20px 60px rgba(0,0,0,0.6)', zIndex:200,
          display:'flex', flexDirection:'column', overflow:'hidden',
        }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:`1px solid ${C.border}` }}>
            <p style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:'Sora,sans-serif', margin:0 }}>
              Notifications{' '}
              {unread > 0 && (
                <span style={{ fontSize:11, padding:'1px 6px', borderRadius:8, background:C.red, color:'#fff', marginLeft:6 }}>
                  {unread}
                </span>
              )}
            </p>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ fontSize:11, color:C.indigoL, background:'none', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', fontWeight:600 }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY:'auto', flex:1 }}>
            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:24 }}>
                <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                <Loader2 style={{ width:20, height:20, color:C.indigoL, animation:'spin 1s linear infinite' }}/>
              </div>
            ) : notifs.length === 0 ? (
              <div style={{ textAlign:'center', padding:40 }}>
                <Bell style={{ width:32, height:32, color:C.textDim, margin:'0 auto 10px' }}/>
                <p style={{ fontSize:13, color:C.textDim, fontFamily:'Inter,sans-serif' }}>No notifications yet</p>
              </div>
            ) : notifs.map(n => {
              const meta: NotifMeta = NOTIF_ICON[n.type] || NOTIF_ICON.announcement
              const Icon = meta.icon
              const actor = n.actor || null

              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display:'flex', gap:12, padding:'12px 16px', cursor:'pointer',
                    background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.05)',
                    borderBottom:`1px solid ${C.border}`, transition:'background 0.15s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = C.surface)}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = n.is_read ? 'transparent' : 'rgba(99,102,241,0.05)')}
                >
                  {/* Actor avatar or icon */}
                  {actor ? (
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <div style={{
                        width:36, height:36, borderRadius:'50%', overflow:'hidden',
                        background: avatarColor(actor.id as string) + '22',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:14, fontWeight:700, color:avatarColor(actor.id as string), fontFamily:'Sora,sans-serif',
                      }}>
                        {actor.photo_url
                          ? <img src={actor.photo_url as string} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          : getName(actor).slice(0,2).toUpperCase()
                        }
                      </div>
                      <div style={{
                        position:'absolute', bottom:-2, right:-2, width:18, height:18, borderRadius:'50%',
                        background:C.card, border:`1.5px solid ${C.card}`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        <Icon style={{ width:10, height:10, color:meta.color }}/>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      width:36, height:36, borderRadius:'50%',
                      background: meta.color + '18',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    }}>
                      <Icon style={{ width:16, height:16, color:meta.color }}/>
                    </div>
                  )}

                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:n.is_read?400:600, color:C.text, fontFamily:'Inter,sans-serif', marginBottom:2, lineHeight:1.4 }}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p style={{ fontSize:12, color:C.textMuted, fontFamily:'Inter,sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {n.body}
                      </p>
                    )}
                    <p style={{ fontSize:11, color:C.textDim, fontFamily:'Inter,sans-serif', marginTop:2 }}>
                      {timeAgo(n.created_at)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.is_read && (
                    <div style={{ width:8, height:8, borderRadius:'50%', background:C.indigo, flexShrink:0, marginTop:4 }}/>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
