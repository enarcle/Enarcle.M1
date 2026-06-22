'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { qk } from '@/lib/queries'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  DollarSign, Radio, Users, PlusCircle, TrendingUp,
  Play, Edit, BarChart2, ArrowUpRight, Zap,
  Calendar, ChevronRight, Flame
} from 'lucide-react'

import { C } from '@/lib/theme'

interface Event {
  id: string
  title: string
  status: string
  price: number
  capacity?: number
  total_sold?: number
  viewer_peak?: number
  start_time?: string
  created_at: string
}

interface Ticket { amount: number }

export default function HostDashboard() {
  const [user,         setUser]         = useState<{ id: string; user_metadata?: { full_name?: string } } | null>(null)
  const [earnings,     setEarnings]     = useState(0)
  const [totalTickets, setTotalTickets] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser(u as typeof user)
    })
  }, [])

  // React-Query: cache host events for 5 min, revalidate in background
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['host-events', user?.id ?? ''],
    queryFn: async () => {
      const { data: evts, error } = await supabase
        .from('events').select('*').eq('host_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error

      const eventIds = (evts || []).map((e: any) => e.id)
      if (eventIds.length > 0) {
        const { data: tkts } = await supabase
          .from('tickets').select('amount').in('event_id', eventIds).eq('status', 'paid')
        const total = (tkts || []).reduce((s: number, t: any) => s + Math.floor(t.amount * 0.8), 0)
        setEarnings(total)
        setTotalTickets((tkts || []).length)
      }
      return (evts || []) as Event[]
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  const loading = isLoading

  const liveEvent       = events.find(e => e.status === 'live')
  const scheduledEvents = events.filter(e => e.status === 'scheduled')
  const conversionRate  = events.length > 0
    ? Math.round((totalTickets / Math.max(events.reduce((s, e) => s + (e.capacity || 50), 0), 1)) * 100)
    : 0

  const stats = [
    {
      label: 'Total Earnings', value: loading ? '...' : formatCurrency(earnings),
      sub: 'You keep 80%', icon: DollarSign,
      color: C.gold, bg: C.goldDim, border: 'rgba(245,158,11,0.2)', trend: '+12%',
    },
    {
      label: 'Tickets Sold', value: loading ? '...' : totalTickets.toString(),
      sub: `${conversionRate}% conversion`, icon: Users,
      color: C.indigoL, bg: C.indigoDim, border: 'rgba(99,102,241,0.2)', trend: '+8%',
    },
    {
      label: 'Total Events', value: loading ? '...' : events.length.toString(),
      sub: `${scheduledEvents.length} upcoming`, icon: Calendar,
      color: C.violet, bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', trend: null,
    },
    {
      label: 'Live Now', value: loading ? '...' : events.filter(e => e.status === 'live').length.toString(),
      sub: liveEvent ? liveEvent.title : 'No active stream', icon: Flame,
      color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)',
      trend: null, pulse: events.filter(e => e.status === 'live').length > 0,
    },
  ]

  const statusConfig: Record<string, { label:string; color:string; bg:string }> = {
    live:      { label:'Live',      color:C.red,    bg:C.redDim },
    scheduled: { label:'Scheduled', color:C.indigoL, bg:C.indigoDim },
    draft:     { label:'Draft',     color:C.textMuted, bg:'rgba(161,161,170,0.08)' },
    ended:     { label:'Ended',     color:C.textDim,  bg:'rgba(113,113,122,0.10)' },
  }

  return (
    <DashboardLayout>
      <div className="min-h-full" style={{ background:C.bg }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color:C.textDim }}>Host Dashboard</p>
              <h1 className="text-2xl font-bold" style={{ color:C.text, fontFamily:'Sora,sans-serif' }}>
                {loading ? 'Loading...' : `Hey, ${user?.user_metadata?.full_name?.split(' ')[0] || 'Host'} 👋`}
              </h1>
            </div>
            <Link href="/host/create"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ background:`linear-gradient(135deg,${C.indigo},${C.violet})`, color:'#fff' }}>
              <PlusCircle className="w-4 h-4"/> New Event
            </Link>
          </div>

          {/* Live banner */}
          {liveEvent && (
            <div className="relative overflow-hidden rounded-2xl p-4 flex items-center justify-between"
              style={{ background:C.redDim, border:'1px solid rgba(239,68,68,0.25)' }}>
              <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full opacity-20 blur-2xl" style={{ background:C.red }}/>
              <div className="flex items-center gap-3 relative">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(239,68,68,0.2)' }}>
                    <Radio className="w-5 h-5 text-red-400"/>
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse border-2" style={{ borderColor:C.bg }}/>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider">You&apos;re Live</p>
                  <p className="font-semibold text-sm" style={{ color:C.text }}>{liveEvent.title}</p>
                  <p className="text-xs mt-0.5" style={{ color:C.textMuted }}>{liveEvent.viewer_peak || 0} peak viewers</p>
                </div>
              </div>
              <Link href={`/live/${liveEvent.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold relative"
                style={{ background:C.red, color:'white' }}>
                <Play className="w-3.5 h-3.5"/> Return to Stream
              </Link>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map(s => (
              <div key={s.label} className="relative rounded-2xl p-4 overflow-hidden"
                style={{ background:s.bg, border:`1px solid ${s.border}` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(9,9,11,0.5)' }}>
                    <s.icon className="w-4 h-4" style={{ color:s.color }}/>
                  </div>
                  {s.trend && (
                    <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color:C.green }}>
                      <ArrowUpRight className="w-3 h-3"/>{s.trend}
                    </span>
                  )}
                  {'pulse' in s && s.pulse && (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/> LIVE
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold mb-0.5" style={{ color:s.color, fontFamily:'Sora,sans-serif' }}>{s.value}</p>
                <p className="text-xs truncate" style={{ color:C.textDim }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Events section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color:C.text }}>Your Events</h2>
              <Link href="/host/create" className="flex items-center gap-1 text-xs transition-colors"
                style={{ color:C.indigoL }}>
                <PlusCircle className="w-3.5 h-3.5"/> Create new
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background:C.elevated }}/>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-2xl p-12 text-center" style={{ background:C.elevated, border:`1px solid ${C.border}` }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:C.indigoDim }}>
                  <Radio className="w-8 h-8" style={{ color:C.textDim }}/>
                </div>
                <h3 className="text-base font-semibold mb-1" style={{ color:C.text }}>No events yet</h3>
                <p className="text-sm mb-6" style={{ color:C.textMuted }}>Create your first event and start earning 80% of every ticket</p>
                <Link href="/host/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
                  style={{ background:`linear-gradient(135deg,${C.indigo},${C.violet})`, color:'#fff' }}>
                  <Zap className="w-4 h-4"/> Create First Event
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {events.map(event => {
                  const cfg = statusConfig[event.status] || statusConfig.draft
                  const eventEarnings = Math.floor((event.total_sold || 0) * event.price * 0.8)
                  return (
                    <div key={event.id}
                      className="group rounded-2xl p-4 flex items-center gap-4 transition-all"
                      style={{ background:C.elevated, border:`1px solid ${C.border}` }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = C.border)}>
                      {/* Status indicator */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:cfg.bg }}>
                        <Radio className="w-4 h-4" style={{ color:cfg.color }}/>
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:cfg.bg, color:cfg.color }}>
                            {cfg.label}
                          </span>
                          <span className="text-xs" style={{ color:C.textDim }}>
                            {event.start_time ? formatDate(event.start_time) : 'No date set'}
                          </span>
                        </div>
                        <p className="font-medium text-sm truncate" style={{ color:C.text }}>{event.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs flex items-center gap-1" style={{ color:C.textDim }}>
                            <Users className="w-3 h-3"/>{event.total_sold || 0} sold
                          </span>
                          <span className="text-xs" style={{ color:C.textDim }}>·</span>
                          <span className="text-xs" style={{ color:C.textDim }}>{formatCurrency(event.price)} / ticket</span>
                        </div>
                      </div>
                      {/* Earnings */}
                      <div className="hidden sm:block text-right flex-shrink-0">
                        <p className="text-sm font-bold" style={{ color:C.gold }}>{formatCurrency(eventEarnings)}</p>
                        <p className="text-xs" style={{ color:C.textDim }}>earned</p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {event.status === 'live' && (
                          <Link href={`/live/${event.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                            style={{ background:C.red, color:'white' }}>
                            <Play className="w-3 h-3"/> Go Live
                          </Link>
                        )}
                        {event.status === 'scheduled' && (
                          <Link href={`/live/${event.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background:C.indigoDim, color:C.indigoL, border:`1px solid rgba(99,102,241,0.25)` }}>
                            <Radio className="w-3 h-3"/> Start
                          </Link>
                        )}
                        <Link href={`/host/events/${event.id}/edit`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background:'rgba(39,39,42,0.8)', color:C.textDim }}>
                          <Edit className="w-3.5 h-3.5"/>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { href:'/host/earnings', label:'Earnings', icon:BarChart2,  color:C.gold },
              { href:'/host/payouts',  label:'Payouts',  icon:DollarSign, color:C.green },
              { href:'/host/network',  label:'Network',  icon:Users,      color:C.indigoL },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl group transition-all"
                style={{ background:C.elevated, border:`1px solid ${C.border}` }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.25)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = C.border)}>
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" style={{ color:item.color }}/>
                  <span className="text-sm font-medium" style={{ color:C.text }}>{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 transition-colors" style={{ color:C.textDim }}/>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}
