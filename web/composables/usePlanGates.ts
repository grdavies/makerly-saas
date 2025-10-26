import { useSupabaseClient } from '#imports';
import { useTeam } from './useTeam';
import { useUsageTracking } from './useUsageTracking';
import { useGraceWindowManagement } from './useGraceWindowManagement';
import { usePlanLimitErrors } from './usePlanLimitErrors';
import type { Database } from '@shared/types/supabase';

type CapabilityType = Database['public']['Enums']['capability_type'];
type UsageWindowType = Database['public']['Enums']['usage_window_type'];

interface PlanCapability {
  capability_key: string;
  capability_name: string;
  capability_type: CapabilityType;
  limit_value: number | null;
  is_enabled: boolean;
  description: string;
}

interface PlanInfo {
  id: string;
  name: string;
  planship_plan_id: string;
  price_monthly: number | null;
  price_yearly: number | null;
  currency_code: string;
  trial_days: number;
}

interface PlanGateResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limitValue?: number;
  usagePercentage?: number;
  graceWindowAvailable?: boolean;
  graceWindowExpiresAt?: string;
  suggestedPlan?: string;
  upgradeUrl?: string;
}

export const usePlanGates = () => {
  const supabase = useSupabaseClient<Database>();
  const { currentTeam } = useTeam();
  const { trackUsage, getUsage, isWithinLimits, usageSummary } =
    useUsageTracking();
  const {
    hasGraceWindow,
    canUseGraceWindow,
    getGraceWindowStatus,
    createGraceWindow,
  } = useGraceWindowManagement();
  const { handlePlanLimitError, clearError } = usePlanLimitErrors();

  // Reactive state
  const planInfo = ref<PlanInfo | null>(null);
  const capabilities = ref<PlanCapability[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Check if a capability is available (boolean check)
  const hasCapability = async (capabilityKey: string): Promise<boolean> => {
    if (!currentTeam.value) return false;

    try {
      const { data, error: fetchError } = await supabase.rpc(
        'team_has_capability',
        {
          team_uuid: currentTeam.value.id,
          capability_key: capabilityKey,
        }
      );

      if (fetchError) throw fetchError;
      return data || false;
    } catch (err) {
      console.error('Error checking capability:', err);
      return false;
    }
  };

  // Check if team can use a capability (with usage limits)
  const canUseCapability = async (
    capabilityKey: string,
    requestedUsage: number = 1,
    windowType: UsageWindowType = 'monthly'
  ): Promise<PlanGateResult> => {
    if (!currentTeam.value) {
      return {
        allowed: false,
        reason: 'No team selected',
      };
    }

    try {
      // First check if capability exists and is enabled
      const capability = capabilities.value.find(
        c => c.capability_key === capabilityKey
      );

      if (!capability) {
        return {
          allowed: false,
          reason: 'Capability not found',
        };
      }

      if (!capability.is_enabled) {
        return {
          allowed: false,
          reason: 'Capability not available in current plan',
          upgradeUrl: `/billing/upgrade?capability=${capabilityKey}`,
        };
      }

      // For boolean capabilities, just return if enabled
      if (capability.capability_type === 'boolean') {
        return {
          allowed: true,
        };
      }

      // For numeric/metered capabilities, check usage limits
      if (
        capability.capability_type === 'numeric' ||
        capability.capability_type === 'metered'
      ) {
        const currentUsage = await getUsage(capabilityKey, windowType);
        const totalUsage = currentUsage + requestedUsage;

        // Check if within limits
        if (capability.limit_value && totalUsage > capability.limit_value) {
          // Check for grace window
          const graceWindowStatus = getGraceWindowStatus(capabilityKey);

          if (
            graceWindowStatus.hasGraceWindow &&
            !graceWindowStatus.isExpired
          ) {
            return {
              allowed: true,
              currentUsage,
              limitValue: capability.limit_value,
              usagePercentage: Math.round(
                (currentUsage / capability.limit_value) * 100
              ),
              graceWindowAvailable: true,
              graceWindowExpiresAt: graceWindowStatus.expiresAt,
            };
          }

          return {
            allowed: false,
            reason: 'Usage limit exceeded',
            currentUsage,
            limitValue: capability.limit_value,
            usagePercentage: Math.round(
              (currentUsage / capability.limit_value) * 100
            ),
            graceWindowAvailable: graceWindowStatus.hasGraceWindow,
            graceWindowExpiresAt: graceWindowStatus.expiresAt,
            upgradeUrl: `/billing/upgrade?capability=${capabilityKey}`,
          };
        }

        return {
          allowed: true,
          currentUsage,
          limitValue: capability.limit_value,
          usagePercentage: capability.limit_value
            ? Math.round((currentUsage / capability.limit_value) * 100)
            : 0,
        };
      }

      return {
        allowed: true,
      };
    } catch (err) {
      console.error('Error checking capability usage:', err);
      return {
        allowed: false,
        reason: 'Error checking capability',
      };
    }
  };

  // Use a capability (track usage and check limits)
  const useCapability = async (
    capabilityKey: string,
    value: number = 1,
    windowType: UsageWindowType = 'monthly',
    options: { skipTracking?: boolean; metadata?: Record<string, any> } = {}
  ): Promise<PlanGateResult> => {
    // Check if we can use the capability
    const gateResult = await canUseCapability(capabilityKey, value, windowType);

    if (!gateResult.allowed) {
      return gateResult;
    }

    // Track usage if not skipped
    if (!options.skipTracking) {
      try {
        await trackUsage(capabilityKey, value, {
          window_type: windowType,
          metadata: options.metadata,
        });
      } catch (err) {
        console.error('Error tracking usage:', err);
        // Don't fail the operation if tracking fails
      }
    }

    return gateResult;
  };

  // Get capability information
  const getCapability = (capabilityKey: string): PlanCapability | null => {
    return (
      capabilities.value.find(c => c.capability_key === capabilityKey) || null
    );
  };

  // Get usage information for a capability
  const getCapabilityUsage = async (
    capabilityKey: string,
    windowType: UsageWindowType = 'monthly'
  ) => {
    const currentUsage = await getUsage(capabilityKey, windowType);
    const capability = getCapability(capabilityKey);

    return {
      capability_key: capabilityKey,
      current_usage: currentUsage,
      limit_value: capability?.limit_value || null,
      usage_percentage: capability?.limit_value
        ? Math.round((currentUsage / capability.limit_value) * 100)
        : 0,
      is_within_limits: capability?.limit_value
        ? currentUsage < capability.limit_value
        : true,
      capability_type: capability?.capability_type || 'boolean',
    };
  };

  // Request grace window for a capability
  const requestGraceWindow = async (
    capabilityKey: string,
    gracePeriodDays: number = 7
  ): Promise<boolean> => {
    try {
      await createGraceWindow(capabilityKey, {
        grace_period_days: gracePeriodDays,
      });
      return true;
    } catch (err) {
      console.error('Error creating grace window:', err);
      return false;
    }
  };

  // Load plan information and capabilities
  const loadPlanInfo = async () => {
    if (!currentTeam.value) return;

    try {
      loading.value = true;
      error.value = null;

      // Get team plan
      const { data: planData, error: planError } = await supabase.rpc(
        'get_team_plan',
        {
          team_uuid: currentTeam.value.id,
        }
      );

      if (planError) throw planError;
      planInfo.value = planData;

      // Get team capabilities
      const { data: capabilitiesData, error: capabilitiesError } =
        await supabase.rpc('get_team_capabilities', {
          team_uuid: currentTeam.value.id,
        });

      if (capabilitiesError) throw capabilitiesError;
      capabilities.value = capabilitiesData || [];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load plan information';
      console.error('Error loading plan info:', err);
    } finally {
      loading.value = false;
    }
  };

  // Check multiple capabilities at once
  const checkMultipleCapabilities = async (
    capabilityChecks: Array<{
      capability_key: string;
      requested_usage?: number;
      window_type?: UsageWindowType;
    }>
  ): Promise<Record<string, PlanGateResult>> => {
    const results: Record<string, PlanGateResult> = {};

    for (const check of capabilityChecks) {
      results[check.capability_key] = await canUseCapability(
        check.capability_key,
        check.requested_usage || 1,
        check.window_type || 'monthly'
      );
    }

    return results;
  };

  // Get plan limits summary
  const getPlanLimitsSummary = () => {
    return usageSummary.value.map(summary => ({
      ...summary,
      capability: getCapability(summary.capability_key),
      grace_window_status: getGraceWindowStatus(summary.capability_key),
    }));
  };

  // Check if any capability is approaching limit (80% threshold)
  const hasApproachingLimits = (): boolean => {
    return usageSummary.value.some(summary => summary.percentage_used >= 80);
  };

  // Check if any capability has exceeded limits
  const hasExceededLimits = (): boolean => {
    return usageSummary.value.some(summary => !summary.is_within_limits);
  };

  // Get capabilities that need attention
  const getCapabilitiesNeedingAttention = () => {
    return usageSummary.value.filter(
      summary => summary.percentage_used >= 80 || !summary.is_within_limits
    );
  };

  // Initialize plan gates
  const initialize = async () => {
    await loadPlanInfo();
  };

  // Auto-initialize when team changes
  watch(currentTeam, initialize, { immediate: true });

  return {
    // State
    planInfo: readonly(planInfo),
    capabilities: readonly(capabilities),
    loading: readonly(loading),
    error: readonly(error),

    // Core functions
    hasCapability,
    canUseCapability,
    useCapability,
    getCapability,
    getCapabilityUsage,
    requestGraceWindow,
    loadPlanInfo,

    // Utility functions
    checkMultipleCapabilities,
    getPlanLimitsSummary,
    hasApproachingLimits,
    hasExceededLimits,
    getCapabilitiesNeedingAttention,

    // Error handling
    handlePlanLimitError,
    clearError,

    // Actions
    initialize,
  };
};
