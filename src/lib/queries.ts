'use client'

/**
 * Enarcle – Centralised React Query hooks
 *
 * All data-fetching is done here so the cache key, stale-time, and
 * refetch policies live in exactly one place.
 *
 * Cache strategy (inherits QueryClient defaults):
 *   staleTime 5 min  → cached result returned instantly; no loading flash
 *   gcTime   10 min  → entry survives unmount for fast back-navigation
 *   Background revalidation kicks off silently when:
 *     • the component mounts and data is stale
 *     • the browser window/tab regains focus
 *     • the device reconnects to the internet
 */

import { useQuery }  from '@tanstack/react-query'
import { supabase }  from '@/lib/supabase/client'

/* ─── Query key factory ────────────────────────────────────────────────────── */
export const qk = {
  events:      ()              => ['events']          as const,
  event:       (id: string)    => ['events', id]      as const,
  profile:     (uid: string)   => ['profile', uid]    as const,
  network:     (uid: string)   => ['network', uid]    as const,
  groups:      ()              => ['groups']          as const,
  group:       (id: string)    => ['groups', id]      as const,
  recordings:  (uid: string)   => ['recordings', uid] as const,
  tickets:     (uid: string)   => ['tickets', uid]    as const,
  community:   ()              => ['community']       as const,
  adminStats:  ()              => ['admin', 'stats']  as const,
}

/* ─── Events list ──────────────────────────────────────────────────────────── */
export function useEvents() {
  return useQuery({
    queryKey: qk.events(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, users(id, email, full_name, photo_url)')
        .in('status', ['scheduled', 'live'])
        .order('start_time', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

/* ─── Single event ─────────────────────────────────────────────────────────── */
export function useEvent(id: string) {
  return useQuery({
    queryKey: qk.event(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, users(id, email, full_name, photo_url, username, bio, company, role, is_premium)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

/* ─── User profile ─────────────────────────────────────────────────────────── */
export function useProfile(uid: string | undefined) {
  return useQuery({
    queryKey: qk.profile(uid ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id,full_name,email,username,photo_url,role,is_premium,onboarding_done,bio,company,location,website')
        .eq('id', uid!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!uid,
  })
}

/* ─── Network / connections ────────────────────────────────────────────────── */
export function useNetwork(uid: string | undefined) {
  return useQuery({
    queryKey: qk.network(uid ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connections')
        .select('*, requester:users!connections_requester_id_fkey(id,full_name,photo_url,role,company,username), receiver:users!connections_receiver_id_fkey(id,full_name,photo_url,role,company,username)')
        .or(`requester_id.eq.${uid},receiver_id.eq.${uid}`)
        .eq('status', 'accepted')
      if (error) throw error
      return data ?? []
    },
    enabled: !!uid,
  })
}

/* ─── Groups list ──────────────────────────────────────────────────────────── */
export function useGroups() {
  return useQuery({
    queryKey: qk.groups(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*, users(id, full_name, photo_url)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

/* ─── Single group ─────────────────────────────────────────────────────────── */
export function useGroup(id: string) {
  return useQuery({
    queryKey: qk.group(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*, users(id, full_name, photo_url, username, role)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

/* ─── Recordings ───────────────────────────────────────────────────────────── */
export function useRecordings(uid: string | undefined) {
  return useQuery({
    queryKey: qk.recordings(uid ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recordings')
        .select('*, events(id, title, banner_url, date, time)')
        .eq('user_id', uid!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!uid,
  })
}

/* ─── Tickets ──────────────────────────────────────────────────────────────── */
export function useTickets(uid: string | undefined) {
  return useQuery({
    queryKey: qk.tickets(uid ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, events(id, title, banner_url, date, time, status, host_name)')
        .eq('user_id', uid!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!uid,
  })
}
