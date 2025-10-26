<template>
  <div>
    <!-- Plan Gate Modal -->
    <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-md' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ title }}</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="close"
            />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Error details -->
          <div v-if="error" class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div class="flex items-start">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-orange-500 mt-0.5 mr-3" />
              <div>
                <p class="text-sm font-medium text-orange-800 dark:text-orange-200">
                  {{ error.title }}
                </p>
                <p class="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  {{ error.detail }}
                </p>
              </div>
            </div>
          </div>

          <!-- Usage information -->
          <div v-if="showUsageInfo" class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Current Usage</span>
              <span class="font-medium">{{ error?.current_usage || 0 }} / {{ error?.limit_value || '∞' }}</span>
            </div>
            
            <UProgress 
              :value="error?.current_usage && error?.limit_value ? (error.current_usage / error.limit_value) * 100 : 0"
              :color="getProgressColor()"
              size="sm"
            />
            
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ getUsagePercentage() }}% of your limit used
            </p>
          </div>

          <!-- Grace window information -->
          <div v-if="hasGraceWindow" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="flex items-start">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
              <div>
                <p class="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Grace Period Active
                </p>
                <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  You have {{ getGraceWindowTimeRemaining() }} to upgrade your plan.
                </p>
              </div>
            </div>
          </div>

          <!-- Suggested plan -->
          <div v-if="suggestedPlan" class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div class="flex items-start">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <p class="text-sm font-medium text-green-800 dark:text-green-200">
                  Recommended Plan
                </p>
                <p class="text-sm text-green-700 dark:text-green-300 mt-1">
                  Upgrade to {{ suggestedPlan }} for unlimited access to this feature.
                </p>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="gray"
              variant="ghost"
              @click="close"
            >
              {{ cancelText }}
            </UButton>
            <UButton
              color="primary"
              @click="handleUpgrade"
              :loading="loading"
            >
              {{ upgradeText }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Plan Gate Toast -->
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
import type { ProblemDetails } from '~/server/utils/planLimits'

interface Props {
  modelValue: boolean
  error?: ProblemDetails | null
  title?: string
  upgradeText?: string
  cancelText?: string
  showUsageInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Plan Limit Reached',
  upgradeText: 'Upgrade Plan',
  cancelText: 'Cancel',
  showUsageInfo: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'upgrade': []
  'cancel': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)

// Computed properties
const hasGraceWindow = computed(() => props.error?.grace_window_available || false)
const suggestedPlan = computed(() => props.error?.suggested_plan || null)

// Methods
const close = () => {
  isOpen.value = false
  emit('cancel')
}

const handleUpgrade = async () => {
  loading.value = true
  try {
    emit('upgrade')
    // Navigate to upgrade page
    await navigateTo(props.error?.upgrade_url || '/billing/upgrade')
  } catch (error) {
    console.error('Error handling upgrade:', error)
  } finally {
    loading.value = false
  }
}

const getProgressColor = () => {
  if (!props.error?.current_usage || !props.error?.limit_value) return 'primary'
  
  const percentage = (props.error.current_usage / props.error.limit_value) * 100
  
  if (percentage >= 90) return 'red'
  if (percentage >= 80) return 'orange'
  return 'green'
}

const getUsagePercentage = () => {
  if (!props.error?.current_usage || !props.error?.limit_value) return 0
  return Math.round((props.error.current_usage / props.error.limit_value) * 100)
}

const getGraceWindowTimeRemaining = () => {
  const expiresAt = props.error?.grace_window_expires_at
  if (!expiresAt) return ''

  const now = new Date()
  const expiration = new Date(expiresAt)
  const diffTime = expiration.getTime() - now.getTime()

  if (diffTime <= 0) return 'Expired'

  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
}
</script>
