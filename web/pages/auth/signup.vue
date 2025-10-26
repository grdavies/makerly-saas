<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <NuxtLink
            to="/auth/login"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            sign in to your existing account
          </NuxtLink>
        </p>
      </div>

      <UForm
        :state="form"
        :schema="schema"
        @submit="handleSignup"
        class="mt-8 space-y-6"
      >
        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="First name" name="firstName">
            <UInput
              v-model="form.firstName"
              placeholder="John"
              :disabled="loading"
            />
          </UFormGroup>

          <UFormGroup label="Last name" name="lastName">
            <UInput
              v-model="form.lastName"
              placeholder="Doe"
              :disabled="loading"
            />
          </UFormGroup>
        </div>

        <UFormGroup label="Email address" name="email">
          <UInput
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="john@example.com"
            :disabled="loading"
          />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            placeholder="Create a strong password"
            :disabled="loading"
          />
        </UFormGroup>

        <UFormGroup label="Confirm password" name="confirmPassword">
          <UInput
            v-model="form.confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Confirm your password"
            :disabled="loading"
          />
        </UFormGroup>

        <UFormGroup name="terms">
          <UCheckbox v-model="form.acceptTerms" :disabled="loading">
            <template #label>
              I agree to the
              <NuxtLink
                to="/terms"
                class="text-primary-600 hover:text-primary-500"
              >
                Terms of Service
              </NuxtLink>
              and
              <NuxtLink
                to="/privacy"
                class="text-primary-600 hover:text-primary-500"
              >
                Privacy Policy
              </NuxtLink>
            </template>
          </UCheckbox>
        </UFormGroup>

        <UButton
          type="submit"
          block
          :loading="loading"
          :disabled="loading || !form.acceptTerms"
        >
          Create account
        </UButton>

        <UAlert
          v-if="error"
          color="red"
          variant="soft"
          :title="error.message"
          class="mt-4"
        />

        <UAlert
          v-if="success"
          color="green"
          variant="soft"
          title="Account created successfully!"
          description="Please check your email to confirm your account."
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
  middleware: 'guest',
});

// Form schema
const schema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine(val => val === true, 'You must accept the terms and conditions'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Form state
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
});

// Composables
const { signUp, loading, error } = useAuth();
const { createUserProfile } = useUser();
const toast = useToast();

// Success state
const success = ref(false);

// Handle signup
const handleSignup = async () => {
  try {
    // Sign up with Supabase Auth
    const authData = await signUp(form.email, form.password, {
      first_name: form.firstName,
      last_name: form.lastName,
    });

    if (authData.user) {
      // Create user profile in our custom users table
      await createUserProfile({
        id: authData.user.id,
        email: authData.user.email!,
        first_name: form.firstName,
        last_name: form.lastName,
        avatar_url: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: 'en-US',
        currency: 'USD',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        unit_system: 'imperial',
      });

      success.value = true;

      toast.add({
        title: 'Account created!',
        description: 'Please check your email to confirm your account.',
        color: 'green',
      });
    }
  } catch (err) {
    console.error('Signup error:', err);
    // Error is handled by the composable
  }
};
</script>
