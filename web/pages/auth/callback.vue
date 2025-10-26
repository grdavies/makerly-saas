<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 text-center">
      <div v-if="loading">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <h2 class="mt-4 text-xl font-semibold text-gray-900">
          Completing sign in...
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Please wait while we finish setting up your account.
        </p>
      </div>

      <div v-else-if="error">
        <div class="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
          <UIcon name="i-heroicons-x-mark" class="h-6 w-6 text-red-600" />
        </div>
        <h2 class="mt-4 text-xl font-semibold text-gray-900">
          Sign in failed
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ error.message }}
        </p>
        <UButton
          to="/auth/login"
          class="mt-4"
        >
          Try again
        </UButton>
      </div>

      <div v-else>
        <div class="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto">
          <UIcon name="i-heroicons-check" class="h-6 w-6 text-green-600" />
        </div>
        <h2 class="mt-4 text-xl font-semibold text-gray-900">
          Welcome to Makerly!
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Your account has been successfully created and you're now signed in.
        </p>
        <UButton
          to="/"
          class="mt-4"
        >
          Go to Dashboard
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define page meta
definePageMeta({
  layout: 'auth'
})

// Composables
const supabase = useSupabaseClient()
const { loadUserProfile, loadUserTeams } = useAuth()
const toast = useToast()

// State
const loading = ref(true)
const error = ref<Error | null>(null)

// Handle auth callback
onMounted(async () => {
  try {
    // Handle the auth callback
    const { data, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      throw authError
    }

    if (data.session) {
      // Load user profile and teams
      await loadUserProfile()
      await loadUserTeams()
      
      toast.add({
        title: 'Welcome!',
        description: 'You have been successfully signed in.',
        color: 'green'
      })
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigateTo('/')
      }, 2000)
    } else {
      throw new Error('No session found')
    }
  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = err as Error
  } finally {
    loading.value = false
  }
})
</script>
