import { useSupabaseClient } from '#imports'
import { useTeam } from './useTeam'
import type { Database } from '@shared/types/supabase'

type GraceWindowStatus = Database['public']['Enums']['grace_window_status']

interface GraceWindow {
  id: string
  team_id: string
  capability_key: string
  grace_limit: number
  grace_period_days: number
  status: GraceWindowStatus
  started_at: string
  expires_at: string
  used_at: string | null
  created_at: string
  updated_at: string
}

interface GraceWindowOptions {
  grace_period_days?: number
  grace_limit?: number
}

export const useGraceWindowManagement = () => {
  const supabase = useSupabaseClient<Database>()
  const { currentTeam } = useTeam()

  // Reactive state
  const graceWindows = ref<GraceWindow[]>([])
  const activeGraceWindows = ref<GraceWindow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Create a grace window for a capability
  const createGraceWindow = async (
    capabilityKey: string,
    options: GraceWindowOptions = {}
  ) => {
    if (!currentTeam.value) {
      throw new Error('No team selected')
    }

    try {
      loading.value = true
      error.value = null

      const gracePeriodDays = options.grace_period_days || 7
      const graceLimit = options.grace_limit || 0
      const startedAt = new Date()
      const expiresAt = new Date(startedAt.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000)

      const { data, error: insertError } = await supabase
        .from('grace_windows')
        .insert({
          team_id: currentTeam.value.id,
          capability_key: capabilityKey,
          grace_limit: graceLimit,
          grace_period_days: gracePeriodDays,
          status: 'active',
          started_at: startedAt.toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Refresh grace windows
      await loadGraceWindows()
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create grace window'
      console.error('Error creating grace window:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Use a grace window (mark as used)
  const useGraceWindow = async (graceWindowId: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('grace_windows')
        .update({
          status: 'used',
          used_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', graceWindowId)
        .select()
        .single()

      if (updateError) throw updateError

      // Refresh grace windows
      await loadGraceWindows()
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to use grace window'
      console.error('Error using grace window:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Expire a grace window
  const expireGraceWindow = async (graceWindowId: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('grace_windows')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', graceWindowId)
        .select()
        .single()

      if (updateError) throw updateError

      // Refresh grace windows
      await loadGraceWindows()
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to expire grace window'
      console.error('Error expiring grace window:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get active grace window for a capability
  const getActiveGraceWindow = (capabilityKey: string): GraceWindow | null => {
    return activeGraceWindows.value.find(
      gw => gw.capability_key === capabilityKey && gw.status === 'active'
    ) || null
  }

  // Check if grace window is available for a capability
  const hasGraceWindow = (capabilityKey: string): boolean => {
    return getActiveGraceWindow(capabilityKey) !== null
  }

  // Check if grace window is expired
  const isGraceWindowExpired = (graceWindow: GraceWindow): boolean => {
    return new Date() > new Date(graceWindow.expires_at)
  }

  // Get grace window remaining days
  const getGraceWindowRemainingDays = (graceWindow: GraceWindow): number => {
    const now = new Date()
    const expiresAt = new Date(graceWindow.expires_at)
    const diffTime = expiresAt.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  // Get grace window remaining hours
  const getGraceWindowRemainingHours = (graceWindow: GraceWindow): number => {
    const now = new Date()
    const expiresAt = new Date(graceWindow.expires_at)
    const diffTime = expiresAt.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60)))
  }

  // Load grace windows for the current team
  const loadGraceWindows = async () => {
    if (!currentTeam.value) return

    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('grace_windows')
        .select('*')
        .eq('team_id', currentTeam.value.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      graceWindows.value = data || []
      activeGraceWindows.value = data?.filter(gw => gw.status === 'active') || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load grace windows'
      console.error('Error loading grace windows:', err)
    } finally {
      loading.value = false
    }
  }

  // Auto-expire grace windows
  const autoExpireGraceWindows = async () => {
    if (!currentTeam.value) return

    try {
      const now = new Date().toISOString()
      
      const { data: expiredWindows, error: fetchError } = await supabase
        .from('grace_windows')
        .select('id')
        .eq('team_id', currentTeam.value.id)
        .eq('status', 'active')
        .lt('expires_at', now)

      if (fetchError) throw fetchError

      if (expiredWindows && expiredWindows.length > 0) {
        const expiredIds = expiredWindows.map(gw => gw.id)
        
        const { error: updateError } = await supabase
          .from('grace_windows')
          .update({
            status: 'expired',
            updated_at: now
          })
          .in('id', expiredIds)

        if (updateError) throw updateError

        // Refresh grace windows
        await loadGraceWindows()
      }
    } catch (err) {
      console.error('Error auto-expiring grace windows:', err)
    }
  }

  // Get grace window status for a capability
  const getGraceWindowStatus = (capabilityKey: string) => {
    const graceWindow = getActiveGraceWindow(capabilityKey)
    
    if (!graceWindow) {
      return {
        hasGraceWindow: false,
        isExpired: false,
        remainingDays: 0,
        remainingHours: 0,
        graceLimit: 0
      }
    }

    const isExpired = isGraceWindowExpired(graceWindow)
    const remainingDays = getGraceWindowRemainingDays(graceWindow)
    const remainingHours = getGraceWindowRemainingHours(graceWindow)

    return {
      hasGraceWindow: true,
      isExpired,
      remainingDays,
      remainingHours,
      graceLimit: graceWindow.grace_limit,
      expiresAt: graceWindow.expires_at,
      startedAt: graceWindow.started_at
    }
  }

  // Check if team can use grace window for a capability
  const canUseGraceWindow = (capabilityKey: string): boolean => {
    const graceWindow = getActiveGraceWindow(capabilityKey)
    if (!graceWindow) return false
    
    return !isGraceWindowExpired(graceWindow) && graceWindow.status === 'active'
  }

  // Initialize grace window management
  const initialize = async () => {
    await loadGraceWindows()
    await autoExpireGraceWindows()
  }

  // Auto-initialize when team changes
  watch(currentTeam, initialize, { immediate: true })

  // Auto-expire grace windows every hour
  const { pause, resume } = useIntervalFn(autoExpireGraceWindows, 60 * 60 * 1000) // 1 hour

  onMounted(() => {
    resume()
  })

  onUnmounted(() => {
    pause()
  })

  return {
    // State
    graceWindows: readonly(graceWindows),
    activeGraceWindows: readonly(activeGraceWindows),
    loading: readonly(loading),
    error: readonly(error),

    // Core functions
    createGraceWindow,
    useGraceWindow,
    expireGraceWindow,
    loadGraceWindows,
    autoExpireGraceWindows,

    // Utility functions
    getActiveGraceWindow,
    hasGraceWindow,
    isGraceWindowExpired,
    getGraceWindowRemainingDays,
    getGraceWindowRemainingHours,
    getGraceWindowStatus,
    canUseGraceWindow,

    // Actions
    initialize
  }
}
