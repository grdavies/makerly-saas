import type { ProblemDetails } from '~/server/utils/planLimits';

export const usePlanLimitErrors = () => {
  const error = ref<ProblemDetails | null>(null);
  const showUpgradeModal = ref(false);

  // Handle plan limit error from API response
  const handlePlanLimitError = (apiError: any) => {
    if (apiError?.data && apiError.data.type?.includes('capability')) {
      error.value = apiError.data as ProblemDetails;

      // Show upgrade modal for certain error types
      if (
        apiError.data.type.includes('upgrade-required') ||
        apiError.data.type.includes('capability-not-available')
      ) {
        showUpgradeModal.value = true;
      }

      return true;
    }
    return false;
  };

  // Clear error
  const clearError = () => {
    error.value = null;
    showUpgradeModal.value = false;
  };

  // Get error message for display
  const getErrorMessage = (): string => {
    if (!error.value) return '';

    switch (error.value.type) {
      case 'https://makerly.com/problems/capability-exceeded':
        return `You've reached your limit of ${error.value.limit_value} ${error.value.capability_key}. Please upgrade your plan to continue.`;

      case 'https://makerly.com/problems/capability-not-available':
        return `This feature is not available in your current plan. Please upgrade to access ${error.value.capability_key}.`;

      case 'https://makerly.com/problems/grace-window-expired':
        return `Your grace period has expired. Please upgrade your plan to continue using ${error.value.capability_key}.`;

      case 'https://makerly.com/problems/plan-limit-reached':
        return `You've reached your plan limit. Please upgrade to continue.`;

      case 'https://makerly.com/problems/upgrade-required':
        return `A plan upgrade is required to access this feature.`;

      default:
        return error.value.detail || 'An error occurred.';
    }
  };

  // Get upgrade URL
  const getUpgradeUrl = (): string => {
    return error.value?.upgrade_url || '/billing/upgrade';
  };

  // Check if grace window is available
  const hasGraceWindow = (): boolean => {
    return error.value?.grace_window_available || false;
  };

  // Get grace window expiration
  const getGraceWindowExpiration = (): string | null => {
    return error.value?.grace_window_expires_at || null;
  };

  // Get current usage percentage
  const getUsagePercentage = (): number => {
    if (!error.value?.current_usage || !error.value?.limit_value) return 0;
    return Math.round(
      (error.value.current_usage / error.value.limit_value) * 100
    );
  };

  // Get suggested plan
  const getSuggestedPlan = (): string | null => {
    return error.value?.suggested_plan || null;
  };

  // Format grace window time remaining
  const getGraceWindowTimeRemaining = (): string | null => {
    const expiresAt = getGraceWindowExpiration();
    if (!expiresAt) return null;

    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration.getTime() - now.getTime();

    if (diffTime <= 0) return 'Expired';

    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }
  };

  // Show toast notification for plan limit error
  const showPlanLimitToast = (apiError: any) => {
    if (handlePlanLimitError(apiError)) {
      const toast = useToast();
      toast.add({
        title: error.value?.title || 'Plan Limit Reached',
        description: getErrorMessage(),
        color: 'orange',
        icon: 'i-heroicons-exclamation-triangle',
        actions: [
          {
            label: 'Upgrade Plan',
            click: () => {
              navigateTo(getUpgradeUrl());
            },
          },
        ],
      });
    }
  };

  return {
    // State
    error: readonly(error),
    showUpgradeModal: readonly(showUpgradeModal),

    // Actions
    handlePlanLimitError,
    clearError,
    showPlanLimitToast,

    // Getters
    getErrorMessage,
    getUpgradeUrl,
    hasGraceWindow,
    getGraceWindowExpiration,
    getUsagePercentage,
    getSuggestedPlan,
    getGraceWindowTimeRemaining,
  };
};
