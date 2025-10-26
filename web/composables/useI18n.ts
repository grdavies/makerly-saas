import { useI18n as useNuxtI18n } from '#i18n'
import { useSupabaseClient } from '#imports'
import { useAuth } from './useAuth'
import { useTeam } from './useTeam'
import type { Database } from '@shared/types/supabase'

type CurrencyCode = Database['public']['Enums']['currency_code']
type UnitFamily = Database['public']['Enums']['unit_family']
type DateFormat = Database['public']['Enums']['date_format']
type TimeFormat = Database['public']['Enums']['time_format']

interface I18NPreferences {
  currency_code: CurrencyCode
  unit_family: UnitFamily
  date_format: DateFormat
  time_format: TimeFormat
  timezone_id?: string
  number_format: string
}

interface UserI18NPreferences extends I18NPreferences {
  user_id: string
  created_at: string
  updated_at: string
}

interface TeamI18NPreferences extends I18NPreferences {
  team_id: string
  created_at: string
  updated_at: string
}

export const useI18n = () => {
  const { t, locale, setLocale } = useNuxtI18n()
  const supabase = useSupabaseClient<Database>()
  const { user } = useAuth()
  const { currentTeam } = useTeam()

  // Reactive state for I18N preferences
  const userPreferences = ref<UserI18NPreferences | null>(null)
  const teamPreferences = ref<TeamI18NPreferences | null>(null)
  const effectivePreferences = ref<I18NPreferences | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load user's I18N preferences
  const loadUserPreferences = async () => {
    if (!user.value) return

    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('user_i18n_preferences')
        .select('*')
        .eq('user_id', user.value.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw fetchError
      }

      userPreferences.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user preferences'
      console.error('Error loading user I18N preferences:', err)
    } finally {
      loading.value = false
    }
  }

  // Load team's I18N preferences
  const loadTeamPreferences = async () => {
    if (!currentTeam.value) return

    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('team_i18n_preferences')
        .select('*')
        .eq('team_id', currentTeam.value.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      teamPreferences.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load team preferences'
      console.error('Error loading team I18N preferences:', err)
    } finally {
      loading.value = false
    }
  }

  // Calculate effective preferences (user overrides team defaults)
  const calculateEffectivePreferences = () => {
    if (!teamPreferences.value) {
      effectivePreferences.value = null
      return
    }

    const effective: I18NPreferences = {
      currency_code: userPreferences.value?.currency_code || teamPreferences.value.currency_code,
      unit_family: userPreferences.value?.unit_family || teamPreferences.value.unit_family,
      date_format: userPreferences.value?.date_format || teamPreferences.value.date_format,
      time_format: userPreferences.value?.time_format || teamPreferences.value.time_format,
      timezone_id: userPreferences.value?.timezone_id || teamPreferences.value.timezone_id,
      number_format: userPreferences.value?.number_format || teamPreferences.value.number_format
    }

    effectivePreferences.value = effective
  }

  // Watch for changes and recalculate effective preferences
  watch([userPreferences, teamPreferences], calculateEffectivePreferences, { immediate: true })

  // Save user preferences
  const saveUserPreferences = async (preferences: Partial<I18NPreferences>) => {
    if (!user.value) throw new Error('User not authenticated')

    try {
      loading.value = true
      error.value = null

      const { data, error: saveError } = await supabase
        .from('user_i18n_preferences')
        .upsert({
          user_id: user.value.id,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (saveError) throw saveError

      userPreferences.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save user preferences'
      console.error('Error saving user I18N preferences:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Save team preferences (admin only)
  const saveTeamPreferences = async (preferences: Partial<I18NPreferences>) => {
    if (!currentTeam.value) throw new Error('No team selected')
    if (!user.value) throw new Error('User not authenticated')

    try {
      loading.value = true
      error.value = null

      const { data, error: saveError } = await supabase
        .from('team_i18n_preferences')
        .upsert({
          team_id: currentTeam.value.id,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (saveError) throw saveError

      teamPreferences.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save team preferences'
      console.error('Error saving team I18N preferences:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reset user preferences to team defaults
  const resetUserPreferences = async () => {
    if (!user.value) throw new Error('User not authenticated')

    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('user_i18n_preferences')
        .delete()
        .eq('user_id', user.value.id)

      if (deleteError) throw deleteError

      userPreferences.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reset user preferences'
      console.error('Error resetting user I18N preferences:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Initialize I18N preferences
  const initialize = async () => {
    await Promise.all([
      loadUserPreferences(),
      loadTeamPreferences()
    ])
  }

  // Get available currencies
  const getAvailableCurrencies = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('currencies')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (fetchError) throw fetchError
      return data || []
    } catch (err) {
      console.error('Error loading currencies:', err)
      return []
    }
  }

  // Get available unit families
  const getAvailableUnitFamilies = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('unit_families')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (fetchError) throw fetchError
      return data || []
    } catch (err) {
      console.error('Error loading unit families:', err)
      return []
    }
  }

  // Get available timezones
  const getAvailableTimezones = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('timezones')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (fetchError) throw fetchError
      return data || []
    } catch (err) {
      console.error('Error loading timezones:', err)
      return []
    }
  }

  // Get available date formats
  const getAvailableDateFormats = () => {
    return [
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
      { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
      { value: 'MM.DD.YYYY', label: 'MM.DD.YYYY' },
      { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' },
      { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
      { value: 'DD/MM/YY', label: 'DD/MM/YY' }
    ]
  }

  // Get available time formats
  const getAvailableTimeFormats = () => {
    return [
      { value: '12h', label: '12 Hour (AM/PM)' },
      { value: '24h', label: '24 Hour' }
    ]
  }

  // Get available number formats
  const getAvailableNumberFormats = () => {
    return [
      { value: 'en-US', label: 'English (US)' },
      { value: 'en-GB', label: 'English (UK)' },
      { value: 'de-DE', label: 'German' },
      { value: 'fr-FR', label: 'French' },
      { value: 'es-ES', label: 'Spanish' },
      { value: 'it-IT', label: 'Italian' },
      { value: 'pt-BR', label: 'Portuguese (Brazil)' },
      { value: 'ja-JP', label: 'Japanese' },
      { value: 'ko-KR', label: 'Korean' },
      { value: 'zh-CN', label: 'Chinese (Simplified)' }
    ]
  }

  // Auto-initialize when user or team changes
  watch([user, currentTeam], initialize, { immediate: true })

  return {
    // Nuxt i18n functions
    t,
    locale,
    setLocale,

    // State
    userPreferences: readonly(userPreferences),
    teamPreferences: readonly(teamPreferences),
    effectivePreferences: readonly(effectivePreferences),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    loadUserPreferences,
    loadTeamPreferences,
    saveUserPreferences,
    saveTeamPreferences,
    resetUserPreferences,
    initialize,

    // Data getters
    getAvailableCurrencies,
    getAvailableUnitFamilies,
    getAvailableTimezones,
    getAvailableDateFormats,
    getAvailableTimeFormats,
    getAvailableNumberFormats
  }
}
