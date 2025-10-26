<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Update your password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Enter your new password below.
        </p>
      </div>

      <UForm
        :state="form"
        :schema="schema"
        @submit="handleUpdatePassword"
        class="mt-8 space-y-6"
      >
        <UFormGroup label="New password" name="password">
          <UInput
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            placeholder="Enter your new password"
            :disabled="loading"
          />
        </UFormGroup>

        <UFormGroup label="Confirm password" name="confirmPassword">
          <UInput
            v-model="form.confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Confirm your new password"
            :disabled="loading"
          />
        </UFormGroup>

        <UButton type="submit" block :loading="loading" :disabled="loading">
          Update password
        </UButton>

        <div class="text-center">
          <NuxtLink
            to="/auth/login"
            class="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Back to sign in
          </NuxtLink>
        </div>

        <UAlert
          v-if="error"
          color="red"
          variant="soft"
          :title="error"
          class="mt-4"
        />

        <UAlert
          v-if="success"
          color="green"
          variant="soft"
          title="Password updated!"
          description="Your password has been successfully updated. You can now sign in with your new password."
          class="mt-4"
        />
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';

// Define page meta
definePageMeta({
  layout: 'auth',
});

// Form schema
const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Form state
const form = reactive({
  password: '',
  confirmPassword: '',
});

// Composables
const { updatePassword, loading, error } = useAuth();
const toast = useToast();

// Success state
const success = ref(false);

// Handle password update
const handleUpdatePassword = async () => {
  try {
    await updatePassword(form.password);
    success.value = true;

    toast.add({
      title: 'Password updated!',
      description: 'Your password has been successfully updated.',
      color: 'green',
    });

    // Redirect to login after a delay
    setTimeout(() => {
      navigateTo('/auth/login');
    }, 2000);
  } catch (err) {
    console.error('Password update error:', err);
    // Error is handled by the composable
  }
};
</script>
