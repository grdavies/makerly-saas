<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Usage Overview</h3>
      <UButton
        color="gray"
        variant="ghost"
        size="sm"
        icon="i-heroicons-arrow-path"
        @click="refreshUsage"
        :loading="loading"
      >
        Refresh
      </UButton>
    </div>

    <!-- Usage Summary -->
    <div v-if="usageSummary.length === 0 && !loading" class="text-center py-8">
      <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">No usage data available</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="summary in usageSummary"
        :key="summary.capability_key"
        class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center">
            <UIcon 
              :name="getCapabilityIcon(summary.capability_key)" 
              class="w-5 h-5 text-gray-500 mr-2" 
            />
            <span class="font-medium text-gray-900 dark:text-white">
              {{ getCapabilityName(summary.capability_key) }}
            </span>
          </div>
          
          <div class="flex items-center space-x-2">
            <!-- Grace window indicator -->
            <UBadge
              v-if="summary.grace_window_status?.hasGraceWindow"
              color="blue"
              variant="soft"
              size="xs"
            >
              Grace Period
            </UBadge>
            
            <!-- Usage percentage -->
            <span class="text-sm font-medium" :class="getUsageTextColor(summary.percentage_used)">
              {{ summary.percentage_used }}%
            </span>
          </div>
        </div>

        <!-- Usage bar -->
        <div class="mb-2">
          <UProgress 
            :value="summary.percentage_used"
            :color="getProgressColor(summary.percentage_used)"
            size="sm"
          />
        </div>

        <!-- Usage details -->
        <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {{ summary.current_usage }} / {{ summary.limit_value || '∞' }}
          </span>
          <span>
            {{ getWindowDescription(summary.window_type) }}
          </span>
        </div>

        <!-- Grace window details -->
        <div v-if="summary.grace_window_status?.hasGraceWindow" class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
          <div class="flex items-center">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 text-blue-500 mr-2" />
            <span class="text-blue-700 dark:text-blue-300">
              Grace period expires in {{ getGraceWindowTimeRemaining(summary.grace_window_status.expiresAt) }}
            </span>
          </div>
        </div>

        <!-- Warning for approaching limits -->
        <div v-if="summary.percentage_used >= 80 && summary.percentage_used < 100" class="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-sm">
          <div class="flex items-center">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-orange-500 mr-2" />
            <span class="text-orange-700 dark:text-orange-300">
              Approaching limit - consider upgrading your plan
            </span>
          </div>
        </div>

        <!-- Error for exceeded limits -->
        <div v-if="summary.percentage_used >= 100" class="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
          <div class="flex items-center">
            <UIcon name="i-heroicons-x-circle" class="w-4 h-4 text-red-500 mr-2" />
            <span class="text-red-700 dark:text-red-300">
              Limit exceeded - upgrade required
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade prompt -->
    <div v-if="hasApproachingLimits || hasExceededLimits" class="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
      <div class="flex items-start">
        <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-orange-500 mt-0.5 mr-3" />
        <div class="flex-1">
          <h4 class="font-medium text-orange-900 dark:text-orange-100">
            {{ hasExceededLimits ? 'Upgrade Required' : 'Consider Upgrading' }}
          </h4>
          <p class="text-sm text-orange-700 dark:text-orange-300 mt-1">
            {{ hasExceededLimits 
              ? 'You\'ve reached your plan limits. Upgrade to continue using all features.' 
              : 'You\'re approaching your plan limits. Upgrade now to avoid interruptions.' 
            }}
          </p>
          <UButton
            color="orange"
            size="sm"
            class="mt-3"
            @click="handleUpgrade"
          >
            Upgrade Plan
          </UButton>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <USkeleton class="h-4 w-1/3 mb-2" />
        <USkeleton class="h-2 w-full mb-2" />
        <USkeleton class="h-3 w-1/2" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUsageTracking } from '~/composables/useUsageTracking'
import { usePlanGates } from '~/composables/usePlanGates'

const { 
  usageSummary, 
  loading, 
  loadUsageSummary 
} = useUsageTracking()

const { 
  hasApproachingLimits, 
  hasExceededLimits, 
  getCapabilitiesNeedingAttention 
} = usePlanGates()

// Refresh usage data
const refreshUsage = async () => {
  await loadUsageSummary()
}

// Get capability icon
const getCapabilityIcon = (capabilityKey: string): string => {
  const iconMap: Record<string, string> = {
    'inventory_items': 'i-heroicons-cube',
    'users': 'i-heroicons-users',
    'api_calls': 'i-heroicons-code-bracket',
    'reports': 'i-heroicons-chart-bar',
    'integrations': 'i-heroicons-puzzle-piece',
    'priority_support': 'i-heroicons-lifebuoy',
    'advanced_analytics': 'i-heroicons-chart-pie',
    'custom_fields': 'i-heroicons-adjustments-horizontal',
    'sso': 'i-heroicons-shield-check',
    'audit_logs': 'i-heroicons-document-text',
    'custom_branding': 'i-heroicons-paint-brush'
  }
  
  return iconMap[capabilityKey] || 'i-heroicons-cog-6-tooth'
}

// Get capability name
const getCapabilityName = (capabilityKey: string): string => {
  const nameMap: Record<string, string> = {
    'inventory_items': 'Inventory Items',
    'users': 'Team Members',
    'api_calls': 'API Calls',
    'reports': 'Reports',
    'integrations': 'Integrations',
    'priority_support': 'Priority Support',
    'advanced_analytics': 'Advanced Analytics',
    'custom_fields': 'Custom Fields',
    'sso': 'Single Sign-On',
    'audit_logs': 'Audit Logs',
    'custom_branding': 'Custom Branding'
  }
  
  return nameMap[capabilityKey] || capabilityKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Get progress color based on usage percentage
const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return 'red'
  if (percentage >= 90) return 'orange'
  if (percentage >= 80) return 'yellow'
  return 'green'
}

// Get usage text color
const getUsageTextColor = (percentage: number): string => {
  if (percentage >= 100) return 'text-red-600 dark:text-red-400'
  if (percentage >= 90) return 'text-orange-600 dark:text-orange-400'
  if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-gray-600 dark:text-gray-400'
}

// Get window description
const getWindowDescription = (windowType: string): string => {
  const descriptions: Record<string, string> = {
    'daily': 'per day',
    'weekly': 'per week',
    'monthly': 'per month',
    'yearly': 'per year'
  }
  
  return descriptions[windowType] || windowType
}

// Get grace window time remaining
const getGraceWindowTimeRemaining = (expiresAt: string | undefined): string => {
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

// Handle upgrade
const handleUpgrade = () => {
  navigateTo('/billing/upgrade')
}

// Initialize on mount
onMounted(() => {
  loadUsageSummary()
})
</script>
