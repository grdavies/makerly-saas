<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <NuxtLink
            to="/auth/signup"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            create a new account
          </NuxtLink>
        </p>
      </div>

      <UForm
        :state="form"
        :schema="schema"
        @submit="handleLogin"
        class="mt-8 space-y-6"
      >
        <UFormGroup label="Email address" name="email">
          <UInput
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="Enter your email"
            :disabled="loading"
          />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="Enter your password"
            :disabled="loading"
          />
        </UFormGroup>

        <div class="flex items-center justify-between">
          <UCheckbox
            v-model="form.remember"
            label="Remember me"
            :disabled="loading"
          />

          <NuxtLink
            to="/auth/reset-password"
            class="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Forgot your password?
          </NuxtLink>
        </div>

        <UButton type="submit" block :loading="loading" :disabled="loading">
          Sign in
        </UButton>

        <UAlert
          v-if="error"
          color="red"
          variant="soft"
          :title="error.message"
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
const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Form state
const form = reactive({
  email: '',
  password: '',
  remember: false,
});

// Composables
const { signIn, loading, error } = useAuth();
const toast = useToast();

// Handle login
const handleLogin = async () => {
  try {
    await signIn(form.email, form.password);

    toast.add({
      title: 'Welcome back!',
      description: 'You have been successfully signed in.',
      color: 'green',
    });

    // Redirect to dashboard
    await navigateTo('/');
  } catch (err) {
    console.error('Login error:', err);
    // Error is handled by the composable
  }
};

// Handle OAuth login (if needed)
const handleOAuthLogin = async (provider: 'google' | 'github') => {
  try {
    const supabase = useSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  } catch (err) {
    console.error('OAuth login error:', err);
    toast.add({
      title: 'Login failed',
      description: 'There was an error signing in with ' + provider,
      color: 'red',
    });
  }
};
</script>
