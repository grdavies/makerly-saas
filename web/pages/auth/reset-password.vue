<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      <UForm
        :state="form"
        :schema="schema"
        @submit="handleResetPassword"
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

        <UButton
          type="submit"
          block
          :loading="loading"
          :disabled="loading"
        >
          Send reset link
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
          title="Reset link sent!"
          description="Check your email for instructions to reset your password."
          class="mt-4"
        />
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

// Define page meta
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

// Form schema
const schema = z.object({
  email: z.string().email('Please enter a valid email address')
})

// Form state
const form = reactive({
  email: ''
})

// Composables
const { resetPassword, loading, error } = useAuth()
const toast = useToast()

// Success state
const success = ref(false)

// Handle password reset
const handleResetPassword = async () => {
  try {
    await resetPassword(form.email)
    success.value = true
    
    toast.add({
      title: 'Reset link sent!',
      description: 'Check your email for instructions to reset your password.',
      color: 'green'
    })
  } catch (err) {
    console.error('Password reset error:', err)
    // Error is handled by the composable
  }
}
</script>
