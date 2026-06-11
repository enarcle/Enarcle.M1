/**
 * usePlatformSettings — reads platform_settings from Supabase and
 * subscribes to real-time changes so every component stays in sync
 * the moment an admin saves new values.
 *
 * Usage:
 *   const { settings, loading } = usePlatformSettings()
 *   if (settings.maintenance_mode && role !== 'admin') return <MaintenancePage />
 */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface PlatformSettings {
  maintenance_mode:   boolean
  new_registrations:  boolean
  host_applications:  boolean
  content_moderation: boolean
  platform_fee:       number
  min_payout_amount:  number
  max_group_members:  number
}

const DEFAULTS: PlatformSettings = {
  maintenance_mode:   false,
  new_registrations:  true,
  host_applications:  true,
  content_moderation: true,
  platform_fee:       20,
  min_payout_amount:  50,
  max_group_members:  5,
}

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULTS)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    // Initial fetch — gracefully handle missing table (returns DEFAULTS if error)
    supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.warn('[PlatformSettings] table may not exist yet:', error.message)
        if (data) setSettings({ ...DEFAULTS, ...data })
        setLoading(false)
      })

    // Real-time subscription — fires the moment admin saves changes
    const ch = supabase
      .channel('platform-settings-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'platform_settings', filter: 'id=eq.1' },
        ({ new: data }) => {
          if (data) setSettings({ ...DEFAULTS, ...data })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [])

  return { settings, loading }
}
