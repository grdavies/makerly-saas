<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto">
      <div class="text-center mb-8">
        <UIcon
          name="i-heroicons-shield-check"
          class="h-12 w-12 text-primary-600 mx-auto mb-4"
        />
        <h1 class="text-2xl font-bold text-gray-900">
          Two-Factor Authentication
        </h1>
        <p class="mt-2 text-sm text-gray-600">
          Secure your super admin account with 2FA
        </p>
      </div>

      <!-- 2FA Status -->
      <UCard class="mb-6">
        <template #header>
          <h3 class="text-lg font-semibold">Current Status</h3>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">2FA Status</span>
            <UBadge :color="hasTOTP ? 'green' : 'red'" variant="soft">
              {{ hasTOTP ? 'Enabled' : 'Disabled' }}
            </UBadge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700"
              >Required for Super Admin</span
            >
            <UBadge color="orange" variant="soft"> Yes </UBadge>
          </div>
        </div>
      </UCard>

      <!-- Setup 2FA -->
      <UCard v-if="!hasTOTP" class="mb-6">
        <template #header>
          <h3 class="text-lg font-semibold">Setup Authenticator App</h3>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            Scan the QR code below with your authenticator app (Google
            Authenticator, Authy, etc.)
          </p>

          <!-- QR Code -->
          <div v-if="getQRCodeData" class="text-center">
            <div class="bg-white p-4 rounded-lg border inline-block">
              <img
                :src="getQRCodeData.qrCode"
                alt="QR Code for 2FA setup"
                class="w-48 h-48"
              />
            </div>
            <p class="mt-2 text-xs text-gray-500">
              Secret: {{ getQRCodeData.secret }}
            </p>
          </div>

          <!-- Setup Button -->
          <UButton
            v-if="!getQRCodeData"
            @click="startEnrollment"
            :loading="loading"
            block
          >
            Start 2FA Setup
          </UButton>

          <!-- Verification Form -->
          <UForm
            v-if="getQRCodeData"
            :state="verificationForm"
            :schema="verificationSchema"
            @submit="verifyEnrollment"
            class="space-y-4"
          >
            <UFormGroup
              label="Enter 6-digit code from your authenticator app"
              name="code"
            >
              <UInput
                v-model="verificationForm.code"
                placeholder="123456"
                maxlength="6"
                :disabled="loading"
              />
            </UFormGroup>

            <UButton type="submit" :loading="loading" :disabled="loading" block>
              Verify & Enable 2FA
            </UButton>
          </UForm>
        </div>
      </UCard>

      <!-- Manage 2FA -->
      <UCard v-if="hasTOTP">
        <template #header>
          <h3 class="text-lg font-semibold">Manage 2FA</h3>
        </template>

        <div class="space-y-4">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center">
              <UIcon
                name="i-heroicons-check-circle"
                class="h-5 w-5 text-green-600 mr-2"
              />
              <span class="text-sm font-medium text-green-800">
                Two-factor authentication is enabled
              </span>
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="text-sm font-medium text-gray-700">Active Factors:</h4>
            <div
              v-for="factor in factors"
              :key="factor.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ factor.friendly_name }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ factor.factor_type.toUpperCase() }}
                </p>
              </div>
              <UButton
                size="sm"
                color="red"
                variant="soft"
                @click="confirmUnenroll(factor.id)"
                :loading="loading"
              >
                Remove
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Error Display -->
      <UAlert
        v-if="error"
        color="red"
        variant="soft"
        :title="error"
        class="mt-4"
      />

      <!-- Back to Dashboard -->
      <div class="mt-6 text-center">
        <UButton to="/" variant="ghost" color="gray">
          <UIcon name="i-heroicons-arrow-left" class="mr-2" />
          Back to Dashboard
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';

// Define page meta
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'default',
});

// Verification form schema
const verificationSchema = z.object({
  code: z
    .string()
    .min(6, 'Code must be 6 digits')
    .max(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only numbers'),
});

// Composables
const {
  loading,
  error,
  factors,
  hasTOTP,
  getQRCodeData,
  enrollTOTP,
  verifyTOTP,
  unenrollFactor,
} = use2FA();

const toast = useToast();

// Form state
const verificationForm = reactive({
  code: '',
});

// Start 2FA enrollment
const startEnrollment = async () => {
  try {
    await enrollTOTP('Makerly Authenticator');
    toast.add({
      title: 'QR Code Generated',
      description: 'Scan the QR code with your authenticator app',
      color: 'green',
    });
  } catch (err) {
    console.error('Enrollment error:', err);
  }
};

// Verify 2FA enrollment
const verifyEnrollment = async () => {
  if (!getQRCodeData.value) return;

  try {
    // Find the factor ID from enrollment data
    const factorId = factors.value.find(f => f.status === 'unverified')?.id;
    if (!factorId) {
      throw new Error('No pending factor found');
    }

    await verifyTOTP(factorId, verificationForm.code);

    toast.add({
      title: '2FA Enabled Successfully!',
      description:
        'Your account is now protected with two-factor authentication',
      color: 'green',
    });

    // Reset form
    verificationForm.code = '';
  } catch (err) {
    console.error('Verification error:', err);
  }
};

// Confirm unenrollment
const confirmUnenroll = async (factorId: string) => {
  if (
    !confirm(
      'Are you sure you want to remove this 2FA factor? This will make your account less secure.'
    )
  ) {
    return;
  }

  try {
    await unenrollFactor(factorId);

    toast.add({
      title: '2FA Factor Removed',
      description: 'The 2FA factor has been successfully removed',
      color: 'orange',
    });
  } catch (err) {
    console.error('Unenrollment error:', err);
  }
};

// Check if user is super admin
const { isSuperAdmin } = useAuth();

// Redirect if not super admin
onMounted(() => {
  if (!isSuperAdmin.value) {
    navigateTo('/');
  }
});
</script>
