<template>
  <UContainer>
    <div class="py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Billing & Plans
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Manage your subscription and view usage across all features.
        </p>
      </div>

      <!-- Current Plan -->
      <UCard class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold">Current Plan</h2>
        </template>

        <div v-if="currentSubscription" class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium">
                {{ currentSubscription.plans?.name }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ formatPrice(currentSubscription.plans?.price_monthly) }} /
                month
              </p>
            </div>
            <UBadge
              :color="currentSubscription.status === 'active' ? 'green' : 'red'"
              variant="soft"
            >
              {{ currentSubscription.status }}
            </UBadge>
          </div>

          <div
            v-if="currentSubscription.status === 'active'"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            <p>
              Next billing:
              {{ formatDate(currentSubscription.current_period_end) }}
            </p>
            <p v-if="currentSubscription.trial_end">
              Trial ends: {{ formatDate(currentSubscription.trial_end) }}
            </p>
          </div>

          <div class="flex gap-3">
            <UButton
              v-if="currentSubscription.status === 'canceled'"
              color="green"
              @click="handleReactivate"
              :loading="loading"
            >
              Reactivate Subscription
            </UButton>
            <UButton
              v-else
              color="red"
              variant="outline"
              @click="handleCancel"
              :loading="loading"
            >
              Cancel Subscription
            </UButton>
            <UButton color="primary" @click="showUpgradeModal = true">
              Change Plan
            </UButton>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <UIcon
            name="i-heroicons-credit-card"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Active Subscription
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            You're currently on the free plan. Upgrade to unlock more features.
          </p>
          <UButton color="primary" @click="showUpgradeModal = true">
            Choose a Plan
          </UButton>
        </div>
      </UCard>

      <!-- Usage Tracking -->
      <UCard class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold">Usage Overview</h2>
        </template>
        <UsageTracking />
      </UCard>

      <!-- Plan Comparison -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Available Plans</h2>
        </template>

        <div
          v-if="loading"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div v-for="i in 4" :key="i" class="space-y-4">
            <USkeleton class="h-6 w-3/4" />
            <USkeleton class="h-4 w-1/2" />
            <USkeleton class="h-8 w-full" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-full" />
          </div>
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div
            v-for="plan in availablePlans"
            :key="plan.id"
            class="relative p-6 border border-gray-200 dark:border-gray-700 rounded-lg"
            :class="{
              'border-primary-500 bg-primary-50 dark:bg-primary-900/20':
                plan.is_current_plan,
              'hover:border-gray-300 dark:hover:border-gray-600':
                !plan.is_current_plan,
            }"
          >
            <!-- Current plan badge -->
            <UBadge
              v-if="plan.is_current_plan"
              color="primary"
              class="absolute -top-2 left-1/2 transform -translate-x-1/2"
            >
              Current Plan
            </UBadge>

            <!-- Plan header -->
            <div class="text-center mb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ plan.name }}
              </h3>
              <div class="mt-2">
                <span class="text-3xl font-bold text-gray-900 dark:text-white">
                  {{ formatPrice(plan.price_monthly) }}
                </span>
                <span class="text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <div
                v-if="plan.price_yearly"
                class="text-sm text-gray-500 dark:text-gray-400 mt-1"
              >
                {{ formatPrice(plan.price_yearly) }}/year
                <span class="text-green-600 dark:text-green-400">
                  ({{ getBillingCycleSavings(plan, 'yearly') }}% off)
                </span>
              </div>
            </div>

            <!-- Plan features -->
            <div class="space-y-3 mb-6">
              <div
                v-for="(capability, key) in plan.capabilities"
                :key="key"
                class="flex items-center"
              >
                <UIcon
                  :name="
                    capability.enabled
                      ? 'i-heroicons-check'
                      : 'i-heroicons-x-mark'
                  "
                  :class="
                    capability.enabled ? 'text-green-500' : 'text-gray-400'
                  "
                  class="w-4 h-4 mr-3"
                />
                <span
                  class="text-sm"
                  :class="
                    capability.enabled
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  "
                >
                  {{ getCapabilityDisplayName(key, capability) }}
                </span>
              </div>
            </div>

            <!-- Plan action -->
            <UButton
              v-if="!plan.is_current_plan"
              color="primary"
              variant="outline"
              class="w-full"
              @click="handlePlanChange(plan)"
              :loading="loading"
            >
              {{ plan.price_monthly === 0 ? 'Get Started' : 'Upgrade' }}
            </UButton>
            <UButton
              v-else
              color="gray"
              variant="outline"
              class="w-full"
              disabled
            >
              Current Plan
            </UButton>
          </div>
        </div>
      </UCard>

      <!-- Upgrade Modal -->
      <UModal v-model="showUpgradeModal">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Change Plan</h3>
          </template>

          <div class="space-y-4">
            <div
              v-for="plan in availablePlans"
              :key="plan.id"
              class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary-500"
              :class="{
                'border-primary-500 bg-primary-50 dark:bg-primary-900/20':
                  selectedPlan?.id === plan.id,
              }"
              @click="selectedPlan = plan"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium">{{ plan.name }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatPrice(plan.price_monthly) }}/month
                  </p>
                </div>
                <URadio
                  :model-value="selectedPlan?.id"
                  :value="plan.id"
                  @update:model-value="selectedPlan = plan"
                />
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                color="gray"
                variant="ghost"
                @click="showUpgradeModal = false"
              >
                Cancel
              </UButton>
              <UButton
                color="primary"
                @click="handleUpgrade"
                :loading="loading"
                :disabled="!selectedPlan"
              >
                {{
                  selectedPlan?.price_monthly === 0 ? 'Get Started' : 'Upgrade'
                }}
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { usePlanManagement } from '~/composables/usePlanManagement';
import { usePlanGates } from '~/composables/usePlanGates';

const {
  availablePlans,
  currentSubscription,
  loading,
  createCheckoutSession,
  cancelSubscription,
  reactivateSubscription,
  getBillingCycleSavings,
} = usePlanManagement();

const { planInfo } = usePlanGates();

// Reactive state
const showUpgradeModal = ref(false);
const selectedPlan = ref<any>(null);

// Methods
const formatPrice = (price: number | null): string => {
  if (price === null || price === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getCapabilityDisplayName = (key: string, capability: any): string => {
  const nameMap: Record<string, string> = {
    inventory_items: 'Inventory Items',
    users: 'Team Members',
    api_calls: 'API Calls',
    reports: 'Reports',
    integrations: 'Integrations',
    priority_support: 'Priority Support',
    advanced_analytics: 'Advanced Analytics',
    custom_fields: 'Custom Fields',
    sso: 'Single Sign-On',
    audit_logs: 'Audit Logs',
    custom_branding: 'Custom Branding',
  };

  const name =
    nameMap[key] ||
    key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (capability.limit && capability.limit !== null) {
    return `${name} (${capability.limit})`;
  }

  return name;
};

const handlePlanChange = async (plan: any) => {
  try {
    const result = await createCheckoutSession(plan.id, 'monthly');

    if (result.success && result.checkout_url) {
      await navigateTo(result.checkout_url);
    } else {
      throw new Error(result.error || 'Failed to create checkout session');
    }
  } catch (error) {
    console.error('Error changing plan:', error);
    const toast = useToast();
    toast.add({
      title: 'Error',
      description: 'Failed to change plan. Please try again.',
      color: 'red',
      icon: 'i-heroicons-x-circle',
    });
  }
};

const handleUpgrade = async () => {
  if (!selectedPlan.value) return;

  await handlePlanChange(selectedPlan.value);
  showUpgradeModal.value = false;
};

const handleCancel = async () => {
  if (!currentSubscription.value) return;

  try {
    const result = await cancelSubscription('User requested cancellation');

    if (result.success) {
      const toast = useToast();
      toast.add({
        title: 'Subscription Canceled',
        description: 'Your subscription has been canceled successfully.',
        color: 'green',
        icon: 'i-heroicons-check-circle',
      });
    } else {
      throw new Error(result.error || 'Failed to cancel subscription');
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    const toast = useToast();
    toast.add({
      title: 'Error',
      description: 'Failed to cancel subscription. Please try again.',
      color: 'red',
      icon: 'i-heroicons-x-circle',
    });
  }
};

const handleReactivate = async () => {
  if (!currentSubscription.value) return;

  try {
    const result = await reactivateSubscription();

    if (result.success) {
      const toast = useToast();
      toast.add({
        title: 'Subscription Reactivated',
        description: 'Your subscription has been reactivated successfully.',
        color: 'green',
        icon: 'i-heroicons-check-circle',
      });
    } else {
      throw new Error(result.error || 'Failed to reactivate subscription');
    }
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    const toast = useToast();
    toast.add({
      title: 'Error',
      description: 'Failed to reactivate subscription. Please try again.',
      color: 'red',
      icon: 'i-heroicons-x-circle',
    });
  }
};

// Initialize on mount
onMounted(() => {
  // Plans are loaded automatically by the composable
});
</script>
