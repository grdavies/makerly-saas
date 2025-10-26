import { z } from 'zod'
import type { Database } from '@shared/types/supabase'

// Validation schemas
const CreateCheckoutSchema = z.object({
  team_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  billing_cycle: z.enum(['monthly', 'yearly']).default('monthly'),
  success_url: z.string().url(),
  cancel_url: z.string().url()
})

const CancelSubscriptionSchema = z.object({
  team_id: z.string().uuid(),
  subscription_id: z.string().uuid(),
  reason: z.string().optional()
})

const ReactivateSubscriptionSchema = z.object({
  team_id: z.string().uuid(),
  subscription_id: z.string().uuid()
})

// POST /api/billing/checkout
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const supabase = await serverSupabaseClient<Database>(event)

  if (method === 'POST') {
    try {
      const body = await readBody(event)
      const validatedData = CreateCheckoutSchema.parse(body)

      // Verify user has access to the team
      const { data: teamMember, error: memberError } = await supabase
        .from('team_members')
        .select(`
          id,
          status,
          roles!inner(
            name
          )
        `)
        .eq('team_id', validatedData.team_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (memberError || !teamMember) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied'
        })
      }

      const isAdmin = teamMember.roles.name === 'admin' || teamMember.roles.name === 'super_admin'
      if (!isAdmin) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Admin access required'
        })
      }

      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', validatedData.plan_id)
        .eq('status', 'active')
        .single()

      if (planError || !plan) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Plan not found'
        })
      }

      // Get current subscription
      const { data: currentSubscription } = await supabase
        .from('team_subscriptions')
        .select('*')
        .eq('team_id', validatedData.team_id)
        .eq('status', 'active')
        .single()

      // Create Planship checkout session
      // Note: This would integrate with Planship API
      // For now, we'll simulate the checkout URL
      const checkoutUrl = await createPlanshipCheckoutSession({
        teamId: validatedData.team_id,
        planId: plan.planship_plan_id,
        billingCycle: validatedData.billing_cycle,
        successUrl: validatedData.success_url,
        cancelUrl: validatedData.cancel_url,
        currentSubscription: currentSubscription?.planship_subscription_id
      })

      return {
        success: true,
        checkout_url: checkoutUrl
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid request data',
          data: error.errors
        })
      }

      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Failed to create checkout session',
        data: error
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})

// POST /api/billing/cancel
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const supabase = await serverSupabaseClient<Database>(event)

  if (method === 'POST') {
    try {
      const body = await readBody(event)
      const validatedData = CancelSubscriptionSchema.parse(body)

      // Verify user has access to the team
      const { data: teamMember, error: memberError } = await supabase
        .from('team_members')
        .select(`
          id,
          status,
          roles!inner(
            name
          )
        `)
        .eq('team_id', validatedData.team_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (memberError || !teamMember) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied'
        })
      }

      const isAdmin = teamMember.roles.name === 'admin' || teamMember.roles.name === 'super_admin'
      if (!isAdmin) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Admin access required'
        })
      }

      // Get subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('team_subscriptions')
        .select('*')
        .eq('id', validatedData.subscription_id)
        .eq('team_id', validatedData.team_id)
        .single()

      if (subscriptionError || !subscription) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Subscription not found'
        })
      }

      // Cancel subscription in Planship
      await cancelPlanshipSubscription(subscription.planship_subscription_id)

      // Update subscription in database
      const { error: updateError } = await supabase
        .from('team_subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', validatedData.subscription_id)

      if (updateError) throw updateError

      // Record plan change history
      await supabase
        .from('plan_change_history')
        .insert({
          team_id: validatedData.team_id,
          from_plan_id: subscription.plan_id,
          to_plan_id: null,
          change_type: 'cancel',
          change_reason: validatedData.reason,
          created_by: user.id
        })

      return {
        success: true,
        message: 'Subscription canceled successfully'
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid request data',
          data: error.errors
        })
      }

      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Failed to cancel subscription',
        data: error
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})

// POST /api/billing/reactivate
export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const supabase = await serverSupabaseClient<Database>(event)

  if (method === 'POST') {
    try {
      const body = await readBody(event)
      const validatedData = ReactivateSubscriptionSchema.parse(body)

      // Verify user has access to the team
      const { data: teamMember, error: memberError } = await supabase
        .from('team_members')
        .select(`
          id,
          status,
          roles!inner(
            name
          )
        `)
        .eq('team_id', validatedData.team_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (memberError || !teamMember) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Access denied'
        })
      }

      const isAdmin = teamMember.roles.name === 'admin' || teamMember.roles.name === 'super_admin'
      if (!isAdmin) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Admin access required'
        })
      }

      // Get subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('team_subscriptions')
        .select('*')
        .eq('id', validatedData.subscription_id)
        .eq('team_id', validatedData.team_id)
        .single()

      if (subscriptionError || !subscription) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Subscription not found'
        })
      }

      // Reactivate subscription in Planship
      await reactivatePlanshipSubscription(subscription.planship_subscription_id)

      // Update subscription in database
      const { error: updateError } = await supabase
        .from('team_subscriptions')
        .update({
          status: 'active',
          canceled_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', validatedData.subscription_id)

      if (updateError) throw updateError

      // Record plan change history
      await supabase
        .from('plan_change_history')
        .insert({
          team_id: validatedData.team_id,
          from_plan_id: null,
          to_plan_id: subscription.plan_id,
          change_type: 'reactivate',
          change_reason: 'Subscription reactivated',
          created_by: user.id
        })

      return {
        success: true,
        message: 'Subscription reactivated successfully'
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid request data',
          data: error.errors
        })
      }

      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Failed to reactivate subscription',
        data: error
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})

// Planship integration functions (these would integrate with actual Planship API)
async function createPlanshipCheckoutSession(params: {
  teamId: string
  planId: string
  billingCycle: 'monthly' | 'yearly'
  successUrl: string
  cancelUrl: string
  currentSubscription?: string
}): Promise<string> {
  // This would integrate with Planship API
  // For now, return a mock checkout URL
  const config = useRuntimeConfig()
  
  // Mock implementation - replace with actual Planship API call
  const checkoutUrl = `${config.public.planshipApiKey}/checkout?` + new URLSearchParams({
    plan: params.planId,
    billing_cycle: params.billingCycle,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_id: params.teamId
  }).toString()

  return checkoutUrl
}

async function cancelPlanshipSubscription(subscriptionId: string): Promise<void> {
  // This would integrate with Planship API
  // For now, just log the action
  console.log('Canceling Planship subscription:', subscriptionId)
}

async function reactivatePlanshipSubscription(subscriptionId: string): Promise<void> {
  // This would integrate with Planship API
  // For now, just log the action
  console.log('Reactivating Planship subscription:', subscriptionId)
}
