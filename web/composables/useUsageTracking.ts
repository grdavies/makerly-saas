import { useSupabaseClient } from '#imports'
import { useTeam } from './useTeam'
import type { Database } from '@shared/types/supabase'

type UsageWindowType = Database['public']['Enums']['usage_window_type']

interface UsageRecord {
  id: string
  team_id: string
  capability_key: string
  usage_value: number
  window_type: UsageWindowType
  window_start: string
  window_end: string
  recorded_at: string
  metadata: Record<string, any>
}

interface UsageSummary {
  capability_key: string
  current_usage: number
  limit_value: number | null
  window_type: UsageWindowType
  window_start: string
  window_end: string
  percentage_used: number
  is_within_limits: boolean
}

interface UsageTrackingOptions {
  window_type?: UsageWindowType
  metadata?: Record<string, any>
}

export const useUsageTracking = () => {
  const supabase = useSupabaseClient<Database>()
  const { currentTeam } = useTeam()

  // Reactive state
  const usageRecords = ref<UsageRecord[]>([])
  const usageSummary = ref<UsageSummary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Track usage for a capability
  const trackUsage = async (
    capabilityKey: string,
    value: number = 1,
    options: UsageTrackingOptions = {}
  ) => {
    if (!currentTeam.value) {
      throw new Error('No team selected')
    }

    try {
      loading.value = true
      error.value = null

      const windowType = options.window_type || 'monthly'
      const { windowStart, windowEnd } = calculateWindowBoundaries(windowType)

      // Check if record already exists for this window
      const { data: existingRecord } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('team_id', currentTeam.value.id)
        .eq('capability_key', capabilityKey)
        .eq('window_type', windowType)
        .eq('window_start', windowStart.toISOString())
        .single()

      let result
      if (existingRecord) {
        // Update existing record
        const { data, error: updateError } = await supabase
          .from('usage_tracking')
          .update({
            usage_value: existingRecord.usage_value + value,
            recorded_at: new Date().toISOString(),
            metadata: { ...existingRecord.metadata, ...options.metadata }
          })
          .eq('id', existingRecord.id)
          .select()
          .single()

        if (updateError) throw updateError
        result = data
      } else {
        // Create new record
        const { data, error: insertError } = await supabase
          .from('usage_tracking')
          .insert({
            team_id: currentTeam.value.id,
            capability_key: capabilityKey,
            usage_value: value,
            window_type: windowType,
            window_start: windowStart.toISOString(),
            window_end: windowEnd.toISOString(),
            metadata: options.metadata || {}
          })
          .select()
          .single()

        if (insertError) throw insertError
        result = data
      }

      // Refresh usage summary
      await loadUsageSummary()
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to track usage'
      console.error('Error tracking usage:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get usage for a specific capability
  const getUsage = async (
    capabilityKey: string,
    windowType: UsageWindowType = 'monthly'
  ): Promise<number> => {
    if (!currentTeam.value) {
      throw new Error('No team selected')
    }

    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_team_usage', {
          team_uuid: currentTeam.value.id,
          capability_key: capabilityKey,
          window_type: windowType
        })

      if (fetchError) throw fetchError
      return data || 0
    } catch (err) {
      console.error('Error getting usage:', err)
      return 0
    }
  }

  // Check if team is within limits for a capability
  const isWithinLimits = async (
    capabilityKey: string,
    windowType: UsageWindowType = 'monthly'
  ): Promise<boolean> => {
    if (!currentTeam.value) {
      throw new Error('No team selected')
    }

    try {
      const { data, error: fetchError } = await supabase
        .rpc('team_within_limits', {
          team_uuid: currentTeam.value.id,
          capability_key: capabilityKey,
          window_type: windowType
        })

      if (fetchError) throw fetchError
      return data || false
    } catch (err) {
      console.error('Error checking limits:', err)
      return false
    }
  }

  // Load usage summary for all capabilities
  const loadUsageSummary = async () => {
    if (!currentTeam.value) return

    try {
      loading.value = true
      error.value = null

      // Get team capabilities
      const { data: capabilities, error: capabilitiesError } = await supabase
        .rpc('get_team_capabilities', {
          team_uuid: currentTeam.value.id
        })

      if (capabilitiesError) throw capabilitiesError

      const summary: UsageSummary[] = []

      for (const capability of capabilities || []) {
        if (capability.capability_type === 'numeric' || capability.capability_type === 'metered') {
          const currentUsage = await getUsage(capability.capability_key, 'monthly')
          const percentageUsed = capability.limit_value 
            ? Math.round((currentUsage / capability.limit_value) * 100)
            : 0

          summary.push({
            capability_key: capability.capability_key,
            current_usage: currentUsage,
            limit_value: capability.limit_value,
            window_type: 'monthly',
            window_start: getMonthStart().toISOString(),
            window_end: getMonthEnd().toISOString(),
            percentage_used: Math.min(percentageUsed, 100),
            is_within_limits: currentUsage < (capability.limit_value || Infinity)
          })
        }
      }

      usageSummary.value = summary
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load usage summary'
      console.error('Error loading usage summary:', err)
    } finally {
      loading.value = false
    }
  }

  // Load usage records
  const loadUsageRecords = async (capabilityKey?: string) => {
    if (!currentTeam.value) return

    try {
      loading.value = true
      error.value = null

      let query = supabase
        .from('usage_tracking')
        .select('*')
        .eq('team_id', currentTeam.value.id)
        .order('recorded_at', { ascending: false })

      if (capabilityKey) {
        query = query.eq('capability_key', capabilityKey)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      usageRecords.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load usage records'
      console.error('Error loading usage records:', err)
    } finally {
      loading.value = false
    }
  }

  // Calculate window boundaries
  const calculateWindowBoundaries = (windowType: UsageWindowType) => {
    const now = new Date()
    let windowStart: Date
    let windowEnd: Date

    switch (windowType) {
      case 'daily':
        windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        windowEnd = new Date(windowStart.getTime() + 24 * 60 * 60 * 1000)
        break
      case 'weekly':
        const dayOfWeek = now.getDay()
        windowStart = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
        windowStart.setHours(0, 0, 0, 0)
        windowEnd = new Date(windowStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        windowStart = new Date(now.getFullYear(), now.getMonth(), 1)
        windowEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        break
      case 'yearly':
        windowStart = new Date(now.getFullYear(), 0, 1)
        windowEnd = new Date(now.getFullYear() + 1, 0, 1)
        break
      default:
        windowStart = new Date(now.getFullYear(), now.getMonth(), 1)
        windowEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    }

    return { windowStart, windowEnd }
  }

  // Helper functions for date calculations
  const getMonthStart = () => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const getMonthEnd = () => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 1)
  }

  // Get usage percentage for a capability
  const getUsagePercentage = (capabilityKey: string): number => {
    const summary = usageSummary.value.find(s => s.capability_key === capabilityKey)
    return summary?.percentage_used || 0
  }

  // Check if capability is approaching limit (80% threshold)
  const isApproachingLimit = (capabilityKey: string): boolean => {
    return getUsagePercentage(capabilityKey) >= 80
  }

  // Check if capability has exceeded limit
  const hasExceededLimit = (capabilityKey: string): boolean => {
    const summary = usageSummary.value.find(s => s.capability_key === capabilityKey)
    return summary ? !summary.is_within_limits : false
  }

  // Get remaining usage for a capability
  const getRemainingUsage = (capabilityKey: string): number => {
    const summary = usageSummary.value.find(s => s.capability_key === capabilityKey)
    if (!summary || !summary.limit_value) return Infinity
    return Math.max(0, summary.limit_value - summary.current_usage)
  }

  // Initialize usage tracking
  const initialize = async () => {
    await loadUsageSummary()
  }

  // Auto-initialize when team changes
  watch(currentTeam, initialize, { immediate: true })

  return {
    // State
    usageRecords: readonly(usageRecords),
    usageSummary: readonly(usageSummary),
    loading: readonly(loading),
    error: readonly(error),

    // Core functions
    trackUsage,
    getUsage,
    isWithinLimits,
    loadUsageSummary,
    loadUsageRecords,

    // Utility functions
    getUsagePercentage,
    isApproachingLimit,
    hasExceededLimit,
    getRemainingUsage,
    calculateWindowBoundaries,

    // Actions
    initialize
  }
}
