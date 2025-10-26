import { useSupabaseClient } from '#imports'
import { useTeam } from './useTeam'
import { usePlanGates } from './usePlanGates'
import type { Database } from '@shared/types/supabase'

interface PlanChangeRequest {
  from_plan_id?: string
  to_plan_id: string
  change_type: 'upgrade' | 'downgrade' | 'change'
  change_reason?: string
  effective_date?: Date
}

interface PlanChangeResult {
  success: boolean
  subscription_id?: string
  checkout_url?: string
  error?: string
}

interface PlanshipSubscription {
  id: string
  status: string
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  canceled_at?: string
}

export const usePlanManagement = () => {
  const supabase = useSupabaseClient<Database>()
  const { currentTeam } = useTeam()
  const { planInfo, loadPlanInfo } = usePlanGates()

  // Reactive state
  const availablePlans = ref<any[]>([])
  const currentSubscription = ref<PlanshipSubscription | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load available plans
  const loadAvailablePlans = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('plans')
        .select(`
          *,
          plan_capabilities(
            capability_key,
            capability_name,
            capability_type,
            limit_value,
            is_enabled,
            description
          )
        `)
        .eq('status', 'active')
        .order('sort_order')

      if (fetchError) throw fetchError
      availablePlans.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load plans'
      console.error('Error loading plans:', err)
    } finally {
      loading.value = false
    }
  }

  // Load current subscription
  const loadCurrentSubscription = async () => {
    if (!currentTeam.value) return

    try {
      const { data, error: fetchError } = await supabase
        .from('team_subscriptions')
        .select(`
          *,
          plans(
            id,
            name,
            planship_plan_id,
            price_monthly,
            price_yearly,
            currency_code
          )
        `)
        .eq('team_id', currentTeam.value.id)
        .eq('status', 'active')
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      currentSubscription.value = data
    } catch (err) {
      console.error('Error loading subscription:', err)
    }
  }

  // Create checkout session for plan change
  const createCheckoutSession = async (
    planId: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): Promise<PlanChangeResult> => {
    if (!currentTeam.value) {
      return {
        success: false,
        error: 'No team selected'
      }
    }

    try {
      loading.value = true
      error.value = null

      // Get plan details
      const plan = availablePlans.value.find(p => p.id === planId)
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found'
        }
      }

      // Create checkout session via API
      const { data, error: apiError } = await $fetch('/api/billing/checkout', {
        method: 'POST',
        body: {
          team_id: currentTeam.value.id,
          plan_id: planId,
          billing_cycle: billingCycle,
          success_url: `${window.location.origin}/billing/success`,
          cancel_url: `${window.location.origin}/billing`
        }
      })

      if (apiError) throw apiError

      return {
        success: true,
        checkout_url: data.checkout_url
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create checkout session'
      error.value = errorMessage
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  // Handle successful plan change
  const handlePlanChangeSuccess = async (subscriptionId: string) => {
    try {
      // Update local subscription data
      await loadCurrentSubscription()
      await loadPlanInfo()

      // Show success message
      const toast = useToast()
      toast.add({
        title: 'Plan Updated Successfully',
        description: 'Your plan has been updated and is now active.',
        color: 'green',
        icon: 'i-heroicons-check-circle'
      })
    } catch (err) {
      console.error('Error handling plan change success:', err)
    }
  }

  // Cancel subscription
  const cancelSubscription = async (reason?: string): Promise<PlanChangeResult> => {
    if (!currentTeam.value || !currentSubscription.value) {
      return {
        success: false,
        error: 'No active subscription found'
      }
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: apiError } = await $fetch('/api/billing/cancel', {
        method: 'POST',
        body: {
          team_id: currentTeam.value.id,
          subscription_id: currentSubscription.value.id,
          reason
        }
      })

      if (apiError) throw apiError

      // Update local data
      await loadCurrentSubscription()
      await loadPlanInfo()

      return {
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription'
      error.value = errorMessage
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  // Reactivate subscription
  const reactivateSubscription = async (): Promise<PlanChangeResult> => {
    if (!currentTeam.value || !currentSubscription.value) {
      return {
        success: false,
        error: 'No subscription found'
      }
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: apiError } = await $fetch('/api/billing/reactivate', {
        method: 'POST',
        body: {
          team_id: currentTeam.value.id,
          subscription_id: currentSubscription.value.id
        }
      })

      if (apiError) throw apiError

      // Update local data
      await loadCurrentSubscription()
      await loadPlanInfo()

      return {
        success: true
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reactivate subscription'
      error.value = errorMessage
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  // Get plan comparison data
  const getPlanComparison = () => {
    return availablePlans.value.map(plan => ({
      id: plan.id,
      name: plan.name,
      planship_plan_id: plan.planship_plan_id,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      currency_code: plan.currency_code,
      trial_days: plan.trial_days,
      capabilities: plan.plan_capabilities.reduce((acc: any, cap: any) => {
        acc[cap.capability_key] = {
          enabled: cap.is_enabled,
          limit: cap.limit_value,
          type: cap.capability_type,
          description: cap.description
        }
        return acc
      }, {}),
      is_current_plan: currentSubscription.value?.plan_id === plan.id
    }))
  }

  // Get recommended plan based on usage
  const getRecommendedPlan = () => {
    if (!currentTeam.value) return null

    // Simple recommendation logic - can be enhanced
    const currentPlan = availablePlans.value.find(p => p.id === currentSubscription.value?.plan_id)
    if (!currentPlan) return null

    // Find next plan in sort order
    const currentIndex = availablePlans.value.findIndex(p => p.id === currentPlan.id)
    if (currentIndex < availablePlans.value.length - 1) {
      return availablePlans.value[currentIndex + 1]
    }

    return null
  }

  // Check if plan change is allowed
  const canChangePlan = (targetPlanId: string): boolean => {
    const currentPlan = availablePlans.value.find(p => p.id === currentSubscription.value?.plan_id)
    const targetPlan = availablePlans.value.find(p => p.id === targetPlanId)

    if (!currentPlan || !targetPlan) return false

    // Allow upgrades and downgrades
    return true
  }

  // Get billing cycle savings
  const getBillingCycleSavings = (plan: any, billingCycle: 'monthly' | 'yearly'): number => {
    if (billingCycle === 'monthly' || !plan.price_yearly) return 0
    
    const monthlyTotal = plan.price_monthly * 12
    const yearlyPrice = plan.price_yearly
    
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100)
  }

  // Initialize plan management
  const initialize = async () => {
    await Promise.all([
      loadAvailablePlans(),
      loadCurrentSubscription()
    ])
  }

  // Auto-initialize when team changes
  watch(currentTeam, initialize, { immediate: true })

  return {
    // State
    availablePlans: readonly(availablePlans),
    currentSubscription: readonly(currentSubscription),
    loading: readonly(loading),
    error: readonly(error),

    // Core functions
    loadAvailablePlans,
    loadCurrentSubscription,
    createCheckoutSession,
    handlePlanChangeSuccess,
    cancelSubscription,
    reactivateSubscription,

    // Utility functions
    getPlanComparison,
    getRecommendedPlan,
    canChangePlan,
    getBillingCycleSavings,

    // Actions
    initialize
  }
}
