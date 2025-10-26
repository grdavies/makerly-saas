<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ $t('i18n.settings') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Configure your internationalization preferences for currency, date/time, and unit formatting.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- User Preferences -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">{{ $t('i18n.user_overrides') }}</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Override team defaults with your personal preferences
          </p>
        </template>

        <UForm :schema="userPreferencesSchema" :state="userPreferences" @submit="saveUserPreferences">
          <div class="space-y-6">
            <!-- Currency -->
            <UFormGroup label="Currency" name="currency_code">
              <USelect
                v-model="userPreferences.currency_code"
                :options="currencyOptions"
                placeholder="Use team default"
                clearable
              />
            </UFormGroup>

            <!-- Unit Family -->
            <UFormGroup label="Unit System" name="unit_family">
              <USelect
                v-model="userPreferences.unit_family"
                :options="unitFamilyOptions"
                placeholder="Use team default"
                clearable
              />
            </UFormGroup>

            <!-- Date Format -->
            <UFormGroup label="Date Format" name="date_format">
              <USelect
                v-model="userPreferences.date_format"
                :options="dateFormatOptions"
                placeholder="Use team default"
                clearable
              />
            </UFormGroup>

            <!-- Time Format -->
            <UFormGroup label="Time Format" name="time_format">
              <USelect
                v-model="userPreferences.time_format"
                :options="timeFormatOptions"
                placeholder="Use team default"
                clearable
              />
            </UFormGroup>

            <!-- Timezone -->
            <UFormGroup label="Timezone" name="timezone_id">
              <USelect
                v-model="userPreferences.timezone_id"
                :options="timezoneOptions"
                placeholder="Use team default"
                clearable
              />
            </UFormGroup>

            <!-- Number Format -->
            <UFormGroup label="Number Format" name="number_format">
              <USelect
                v-model="userPreferences.number_format"
                :options="numberFormatOptions"
                placeholder="Use team default"
                clearable
              />
            </UFormGroup>

            <div class="flex gap-3">
              <UButton type="submit" :loading="saving">
                {{ $t('i18n.save_preferences') }}
              </UButton>
              <UButton variant="outline" @click="resetUserPreferences" :loading="resetting">
                {{ $t('i18n.reset_to_defaults') }}
              </UButton>
            </div>
          </div>
        </UForm>
      </UCard>

      <!-- Team Preferences (Admin Only) -->
      <UCard v-if="canEditTeam">
        <template #header>
          <h2 class="text-xl font-semibold">{{ $t('i18n.team_defaults') }}</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Set default preferences for all team members
          </p>
        </template>

        <UForm :schema="teamPreferencesSchema" :state="teamPreferences" @submit="saveTeamPreferences">
          <div class="space-y-6">
            <!-- Currency -->
            <UFormGroup label="Default Currency" name="currency_code">
              <USelect
                v-model="teamPreferences.currency_code"
                :options="currencyOptions"
                required
              />
            </UFormGroup>

            <!-- Unit Family -->
            <UFormGroup label="Default Unit System" name="unit_family">
              <USelect
                v-model="teamPreferences.unit_family"
                :options="unitFamilyOptions"
                required
              />
            </UFormGroup>

            <!-- Date Format -->
            <UFormGroup label="Default Date Format" name="date_format">
              <USelect
                v-model="teamPreferences.date_format"
                :options="dateFormatOptions"
                required
              />
            </UFormGroup>

            <!-- Time Format -->
            <UFormGroup label="Default Time Format" name="time_format">
              <USelect
                v-model="teamPreferences.time_format"
                :options="timeFormatOptions"
                required
              />
            </UFormGroup>

            <!-- Timezone -->
            <UFormGroup label="Default Timezone" name="timezone_id">
              <USelect
                v-model="teamPreferences.timezone_id"
                :options="timezoneOptions"
              />
            </UFormGroup>

            <!-- Number Format -->
            <UFormGroup label="Default Number Format" name="number_format">
              <USelect
                v-model="teamPreferences.number_format"
                :options="numberFormatOptions"
                required
              />
            </UFormGroup>

            <UButton type="submit" :loading="savingTeam">
              {{ $t('i18n.save_preferences') }}
            </UButton>
          </div>
        </UForm>
      </UCard>

      <!-- Preview Section -->
      <UCard class="lg:col-span-2">
        <template #header>
          <h2 class="text-xl font-semibold">Preview</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            See how your preferences affect formatting
          </p>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Currency Preview -->
          <div>
            <h3 class="font-medium mb-2">Currency</h3>
            <div class="space-y-1 text-sm">
              <div>Price: {{ formatCurrency(1234.56) }}</div>
              <div>Amount: {{ formatCurrency(0.99) }}</div>
              <div>Large: {{ formatCurrencyAbbreviated(1234567) }}</div>
            </div>
          </div>

          <!-- Date/Time Preview -->
          <div>
            <h3 class="font-medium mb-2">Date & Time</h3>
            <div class="space-y-1 text-sm">
              <div>Date: {{ formatDate(new Date()) }}</div>
              <div>Time: {{ formatTime(new Date()) }}</div>
              <div>DateTime: {{ formatDateTime(new Date()) }}</div>
              <div>Relative: {{ formatRelativeTime(new Date()) }}</div>
            </div>
          </div>

          <!-- Unit Preview -->
          <div>
            <h3 class="font-medium mb-2">Units</h3>
            <div class="space-y-1 text-sm">
              <div>Length: {{ formatUnit(100, 'meter') }}</div>
              <div>Weight: {{ formatUnit(50, 'kilogram') }}</div>
              <div>Volume: {{ formatUnit(2.5, 'liter') }}</div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useI18n } from '~/composables/useI18n'
import { useCurrencyFormatting } from '~/composables/useCurrencyFormatting'
import { useDateTimeFormatting } from '~/composables/useDateTimeFormatting'
import { useUnitConversion } from '~/composables/useUnitConversion'
import { useRBAC } from '~/composables/useRBAC'

// Page metadata
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

// Composables
const { t } = useI18n()
const { 
  userPreferences, 
  teamPreferences, 
  effectivePreferences,
  saveUserPreferences: saveUserPrefs,
  resetUserPreferences: resetUserPrefs,
  getAvailableCurrencies,
  getAvailableUnitFamilies,
  getAvailableTimezones,
  getAvailableDateFormats,
  getAvailableTimeFormats,
  getAvailableNumberFormats
} = useI18n()

const { formatCurrency, formatCurrencyAbbreviated } = useCurrencyFormatting()
const { formatDate, formatTime, formatDateTime, formatRelativeTime } = useDateTimeFormatting()
const { formatUnit } = useUnitConversion()
const { hasRole } = useRBAC()

// State
const saving = ref(false)
const resetting = ref(false)
const savingTeam = ref(false)

// Check if user can edit team preferences
const canEditTeam = computed(() => hasRole(['admin', 'super_admin']))

// Validation schemas
const userPreferencesSchema = z.object({
  currency_code: z.string().optional(),
  unit_family: z.string().optional(),
  date_format: z.string().optional(),
  time_format: z.string().optional(),
  timezone_id: z.string().optional(),
  number_format: z.string().optional()
})

const teamPreferencesSchema = z.object({
  currency_code: z.string().min(1, 'Currency is required'),
  unit_family: z.string().min(1, 'Unit family is required'),
  date_format: z.string().min(1, 'Date format is required'),
  time_format: z.string().min(1, 'Time format is required'),
  timezone_id: z.string().optional(),
  number_format: z.string().min(1, 'Number format is required')
})

// Options
const currencyOptions = ref<Array<{ value: string; label: string }>>([])
const unitFamilyOptions = ref<Array<{ value: string; label: string }>>([])
const timezoneOptions = ref<Array<{ value: string; label: string }>>([])
const dateFormatOptions = ref<Array<{ value: string; label: string }>>([])
const timeFormatOptions = ref<Array<{ value: string; label: string }>>([])
const numberFormatOptions = ref<Array<{ value: string; label: string }>>([])

// Load options
const loadOptions = async () => {
  try {
    const [currencies, unitFamilies, timezones, dateFormats, timeFormats, numberFormats] = await Promise.all([
      getAvailableCurrencies(),
      getAvailableUnitFamilies(),
      getAvailableTimezones(),
      getAvailableDateFormats(),
      getAvailableTimeFormats(),
      getAvailableNumberFormats()
    ])

    currencyOptions.value = currencies.map(c => ({ value: c.code, label: `${c.name} (${c.code})` }))
    unitFamilyOptions.value = unitFamilies.map(f => ({ value: f.family_type, label: f.name }))
    timezoneOptions.value = timezones.map(tz => ({ value: tz.id, label: `${tz.name} (${tz.utc_offset})` }))
    dateFormatOptions.value = dateFormats.map(df => ({ value: df.value, label: df.label }))
    timeFormatOptions.value = timeFormats.map(tf => ({ value: tf.value, label: tf.label }))
    numberFormatOptions.value = numberFormats.map(nf => ({ value: nf.value, label: nf.label }))
  } catch (error) {
    console.error('Error loading options:', error)
  }
}

// Save user preferences
const saveUserPreferences = async (data: any) => {
  try {
    saving.value = true
    await saveUserPrefs(data)
    await $fetch('/api/i18n/user-preferences', {
      method: 'PUT',
      body: data
    })
    
    // Show success message
    const toast = useToast()
    toast.add({
      title: t('i18n.preferences_saved'),
      color: 'green'
    })
  } catch (error) {
    console.error('Error saving user preferences:', error)
    const toast = useToast()
    toast.add({
      title: 'Failed to save preferences',
      description: error instanceof Error ? error.message : 'Unknown error',
      color: 'red'
    })
  } finally {
    saving.value = false
  }
}

// Reset user preferences
const resetUserPreferences = async () => {
  try {
    resetting.value = true
    await resetUserPrefs()
    await $fetch('/api/i18n/user-preferences', {
      method: 'DELETE'
    })
    
    // Show success message
    const toast = useToast()
    toast.add({
      title: t('i18n.preferences_reset'),
      color: 'green'
    })
  } catch (error) {
    console.error('Error resetting user preferences:', error)
    const toast = useToast()
    toast.add({
      title: 'Failed to reset preferences',
      description: error instanceof Error ? error.message : 'Unknown error',
      color: 'red'
    })
  } finally {
    resetting.value = false
  }
}

// Save team preferences
const saveTeamPreferences = async (data: any) => {
  try {
    savingTeam.value = true
    await $fetch('/api/i18n/team-preferences', {
      method: 'PUT',
      query: { team_id: teamPreferences.value?.team_id },
      body: data
    })
    
    // Show success message
    const toast = useToast()
    toast.add({
      title: t('i18n.preferences_saved'),
      color: 'green'
    })
  } catch (error) {
    console.error('Error saving team preferences:', error)
    const toast = useToast()
    toast.add({
      title: 'Failed to save team preferences',
      description: error instanceof Error ? error.message : 'Unknown error',
      color: 'red'
    })
  } finally {
    savingTeam.value = false
  }
}

// Initialize
onMounted(() => {
  loadOptions()
})
</script>
