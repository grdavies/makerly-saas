<template>
  <div>
    <!-- Plan Gate Wrapper -->
    <div v-if="!gateResult.allowed" class="relative">
      <!-- Blurred content -->
      <div class="blur-sm pointer-events-none select-none">
        <slot />
      </div>

      <!-- Overlay with upgrade prompt -->
      <div
        class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
      >
        <UCard class="max-w-md mx-4">
          <div class="text-center space-y-4">
            <div
              class="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center"
            >
              <UIcon
                name="i-heroicons-lock-closed"
                class="w-6 h-6 text-orange-600 dark:text-orange-400"
              />
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ title || 'Upgrade Required' }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{
                  description ||
                  'This feature is not available in your current plan.'
                }}
              </p>
            </div>

            <!-- Usage info -->
            <div
              v-if="showUsageInfo && gateResult.currentUsage !== undefined"
              class="text-sm"
            >
              <div class="flex justify-between mb-2">
                <span class="text-gray-600 dark:text-gray-400">Usage</span>
                <span class="font-medium">
                  {{ gateResult.currentUsage }} /
                  {{ gateResult.limitValue || '∞' }}
                </span>
              </div>
              <UProgress
                v-if="gateResult.limitValue"
                :value="gateResult.usagePercentage || 0"
                :color="getProgressColor()"
                size="sm"
              />
            </div>

            <!-- Grace window info -->
            <div
              v-if="gateResult.graceWindowAvailable"
              class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            >
              <div class="flex items-center justify-center">
                <UIcon
                  name="i-heroicons-clock"
                  class="w-4 h-4 text-blue-500 mr-2"
                />
                <span class="text-sm text-blue-700 dark:text-blue-300">
                  Grace period active
                </span>
              </div>
            </div>

            <div class="flex gap-3">
              <UButton
                color="gray"
                variant="ghost"
                size="sm"
                @click="$emit('cancel')"
              >
                {{ cancelText }}
              </UButton>
              <UButton
                color="primary"
                size="sm"
                @click="handleUpgrade"
                :loading="loading"
              >
                {{ upgradeText }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Normal content when allowed -->
    <div v-else>
      <slot />
    </div>

    <!-- Plan Gate Modal -->
    <PlanGateModal
      v-model="showModal"
      :error="planLimitError"
      :title="modalTitle"
      :upgrade-text="upgradeText"
      :cancel-text="cancelText"
      :show-usage-info="showUsageInfo"
      @upgrade="handleUpgrade"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { usePlanGates } from '~/composables/usePlanGates';
import { usePlanLimitErrors } from '~/composables/usePlanLimitErrors';
import type { PlanGateResult } from '~/composables/usePlanGates';

interface Props {
  capabilityKey: string;
  requestedUsage?: number;
  title?: string;
  description?: string;
  upgradeText?: string;
  cancelText?: string;
  showUsageInfo?: boolean;
  showModalOnLimit?: boolean;
  modalTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  requestedUsage: 1,
  upgradeText: 'Upgrade Plan',
  cancelText: 'Cancel',
  showUsageInfo: true,
  showModalOnLimit: false,
  modalTitle: 'Plan Limit Reached',
});

const emit = defineEmits<{
  'limit-reached': [result: PlanGateResult];
  upgrade: [];
  cancel: [];
}>();

const { canUseCapability } = usePlanGates();
const { error: planLimitError, clearError } = usePlanLimitErrors();

// Reactive state
const gateResult = ref<PlanGateResult>({ allowed: true });
const loading = ref(false);
const showModal = ref(false);

// Check capability on mount and when props change
const checkCapability = async () => {
  try {
    const result = await canUseCapability(
      props.capabilityKey,
      props.requestedUsage
    );
    gateResult.value = result;

    if (!result.allowed) {
      emit('limit-reached', result);

      if (props.showModalOnLimit) {
        showModal.value = true;
      }
    }
  } catch (error) {
    console.error('Error checking capability:', error);
  }
};

// Handle upgrade
const handleUpgrade = () => {
  emit('upgrade');
  showModal.value = false;
};

// Handle cancel
const handleCancel = () => {
  emit('cancel');
  showModal.value = false;
  clearError();
};

// Get progress color based on usage percentage
const getProgressColor = () => {
  const percentage = gateResult.value.usagePercentage || 0;

  if (percentage >= 90) return 'red';
  if (percentage >= 80) return 'orange';
  return 'green';
};

// Watch for changes in capability key or requested usage
watch(
  [() => props.capabilityKey, () => props.requestedUsage],
  checkCapability,
  { immediate: true }
);

// Expose methods for parent components
defineExpose({
  checkCapability,
  gateResult: readonly(gateResult),
});
</script>
