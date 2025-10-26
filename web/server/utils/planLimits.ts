import type { Database } from '@shared/types/supabase'

// RFC-7807 Problem Details for HTTP APIs
interface ProblemDetails {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
  // Extension fields for plan limits
  capability_key?: string
  current_usage?: number
  limit_value?: number
  grace_window_available?: boolean
  grace_window_expires_at?: string
  upgrade_url?: string
  plan_name?: string
  suggested_plan?: string
}

// Plan limit error types
export enum PlanLimitErrorType {
  CAPABILITY_EXCEEDED = 'https://makerly.com/problems/capability-exceeded',
  CAPABILITY_NOT_AVAILABLE = 'https://makerly.com/problems/capability-not-available',
  GRACE_WINDOW_EXPIRED = 'https://makerly.com/problems/grace-window-expired',
  PLAN_LIMIT_REACHED = 'https://makerly.com/problems/plan-limit-reached',
  UPGRADE_REQUIRED = 'https://makerly.com/problems/upgrade-required'
}

// Create RFC-7807 compliant error response
export const createPlanLimitError = (
  errorType: PlanLimitErrorType,
  details: {
    capability_key: string
    current_usage?: number
    limit_value?: number
    grace_window_available?: boolean
    grace_window_expires_at?: string
    plan_name?: string
    suggested_plan?: string
    instance?: string
  }
): ProblemDetails => {
  const baseError = getBaseError(errorType)
  
  return {
    ...baseError,
    capability_key: details.capability_key,
    current_usage: details.current_usage,
    limit_value: details.limit_value,
    grace_window_available: details.grace_window_available,
    grace_window_expires_at: details.grace_window_expires_at,
    plan_name: details.plan_name,
    suggested_plan: details.suggested_plan,
    instance: details.instance,
    upgrade_url: `/billing/upgrade?capability=${details.capability_key}`
  }
}

// Get base error details for each error type
function getBaseError(errorType: PlanLimitErrorType): Omit<ProblemDetails, 'capability_key' | 'current_usage' | 'limit_value' | 'grace_window_available' | 'grace_window_expires_at' | 'plan_name' | 'suggested_plan' | 'instance' | 'upgrade_url'> {
  switch (errorType) {
    case PlanLimitErrorType.CAPABILITY_EXCEEDED:
      return {
        type: errorType,
        title: 'Capability Limit Exceeded',
        status: 429,
        detail: 'The usage limit for this capability has been exceeded. Please upgrade your plan or wait for the next billing cycle.'
      }
    
    case PlanLimitErrorType.CAPABILITY_NOT_AVAILABLE:
      return {
        type: errorType,
        title: 'Capability Not Available',
        status: 403,
        detail: 'This capability is not available in your current plan. Please upgrade to access this feature.'
      }
    
    case PlanLimitErrorType.GRACE_WINDOW_EXPIRED:
      return {
        type: errorType,
        title: 'Grace Window Expired',
        status: 429,
        detail: 'The grace window for this capability has expired. Please upgrade your plan to continue using this feature.'
      }
    
    case PlanLimitErrorType.PLAN_LIMIT_REACHED:
      return {
        type: errorType,
        title: 'Plan Limit Reached',
        status: 429,
        detail: 'You have reached the maximum usage limit for your current plan. Please upgrade to continue.'
      }
    
    case PlanLimitErrorType.UPGRADE_REQUIRED:
      return {
        type: errorType,
        title: 'Plan Upgrade Required',
        status: 402,
        detail: 'A plan upgrade is required to access this feature or continue using this capability.'
      }
    
    default:
      return {
        type: 'https://makerly.com/problems/unknown',
        title: 'Unknown Error',
        status: 500,
        detail: 'An unknown error occurred.'
      }
  }
}

// Check plan limits and return appropriate error
export const checkPlanLimits = async (
  supabase: any,
  teamId: string,
  capabilityKey: string,
  requestedUsage: number = 1
): Promise<{ allowed: boolean; error?: ProblemDetails }> => {
  try {
    // Get team capabilities
    const { data: capabilities, error: capabilitiesError } = await supabase
      .rpc('get_team_capabilities', {
        team_uuid: teamId
      })

    if (capabilitiesError) throw capabilitiesError

    const capability = capabilities?.find((c: any) => c.capability_key === capabilityKey)
    
    if (!capability) {
      return {
        allowed: false,
        error: createPlanLimitError(PlanLimitErrorType.CAPABILITY_NOT_AVAILABLE, {
          capability_key: capabilityKey
        })
      }
    }

    if (!capability.is_enabled) {
      return {
        allowed: false,
        error: createPlanLimitError(PlanLimitErrorType.CAPABILITY_NOT_AVAILABLE, {
          capability_key: capabilityKey,
          plan_name: 'Current Plan'
        })
      }
    }

    // For boolean capabilities, just check if enabled
    if (capability.capability_type === 'boolean') {
      return { allowed: true }
    }

    // For numeric/metered capabilities, check usage limits
    if (capability.capability_type === 'numeric' || capability.capability_type === 'metered') {
      const { data: currentUsage, error: usageError } = await supabase
        .rpc('get_team_usage', {
          team_uuid: teamId,
          capability_key: capabilityKey,
          window_type: 'monthly'
        })

      if (usageError) throw usageError

      const totalUsage = (currentUsage || 0) + requestedUsage

      // Check if within limits
      if (capability.limit_value && totalUsage > capability.limit_value) {
        // Check for active grace window
        const { data: graceWindow } = await supabase
          .from('grace_windows')
          .select('*')
          .eq('team_id', teamId)
          .eq('capability_key', capabilityKey)
          .eq('status', 'active')
          .single()

        if (graceWindow && new Date() <= new Date(graceWindow.expires_at)) {
          // Grace window is active, allow usage
          return { allowed: true }
        }

        // Check if grace window is available but not active
        const { data: availableGraceWindow } = await supabase
          .from('grace_windows')
          .select('*')
          .eq('team_id', teamId)
          .eq('capability_key', capabilityKey)
          .eq('status', 'active')
          .single()

        const errorDetails: any = {
          capability_key: capabilityKey,
          current_usage: currentUsage || 0,
          limit_value: capability.limit_value,
          plan_name: 'Current Plan'
        }

        if (availableGraceWindow) {
          errorDetails.grace_window_available = true
          errorDetails.grace_window_expires_at = availableGraceWindow.expires_at
        }

        return {
          allowed: false,
          error: createPlanLimitError(PlanLimitErrorType.CAPABILITY_EXCEEDED, errorDetails)
        }
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Error checking plan limits:', error)
    return {
      allowed: false,
      error: createPlanLimitError(PlanLimitErrorType.PLAN_LIMIT_REACHED, {
        capability_key: capabilityKey
      })
    }
  }
}

// Middleware to check plan limits
export const planLimitMiddleware = async (
  event: any,
  capabilityKey: string,
  requestedUsage: number = 1
) => {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const supabase = await serverSupabaseClient<Database>(event)
  const query = getQuery(event)
  const teamId = query.team_id as string

  if (!teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team ID is required'
    })
  }

  const { allowed, error } = await checkPlanLimits(supabase, teamId, capabilityKey, requestedUsage)

  if (!allowed && error) {
    throw createError({
      statusCode: error.status,
      statusMessage: error.title,
      data: error
    })
  }

  return { supabase, teamId, user }
}

// Utility function to create plan limit error response
export const createPlanLimitErrorResponse = (error: ProblemDetails) => {
  return {
    statusCode: error.status,
    statusMessage: error.title,
    data: error
  }
}

// Helper function to get suggested plan for capability
export const getSuggestedPlan = async (
  supabase: any,
  capabilityKey: string
): Promise<string | null> => {
  try {
    const { data: plans, error } = await supabase
      .from('plans')
      .select(`
        id,
        name,
        planship_plan_id,
        plan_capabilities!inner(
          capability_key,
          limit_value,
          is_enabled
        )
      `)
      .eq('status', 'active')
      .eq('plan_capabilities.capability_key', capabilityKey)
      .eq('plan_capabilities.is_enabled', true)
      .order('sort_order')

    if (error) throw error

    // Find the plan with the highest limit for this capability
    const sortedPlans = plans?.sort((a: any, b: any) => {
      const aLimit = a.plan_capabilities.find((c: any) => c.capability_key === capabilityKey)?.limit_value || 0
      const bLimit = b.plan_capabilities.find((c: any) => c.capability_key === capabilityKey)?.limit_value || 0
      return bLimit - aLimit
    })

    return sortedPlans?.[0]?.planship_plan_id || null
  } catch (error) {
    console.error('Error getting suggested plan:', error)
    return null
  }
}
