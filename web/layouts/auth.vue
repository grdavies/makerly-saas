<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center">
              <UIcon name="i-heroicons-cube" class="h-8 w-8 text-primary-600" />
              <span class="ml-2 text-xl font-bold text-gray-900">Makerly</span>
            </NuxtLink>
          </div>

          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/auth/login"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign in
            </NuxtLink>
            <NuxtLink
              to="/auth/signup"
              class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Get started
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center">
              <UIcon name="i-heroicons-cube" class="h-6 w-6 text-primary-600" />
              <span class="ml-2 text-lg font-bold text-gray-900">Makerly</span>
            </div>
            <p class="mt-2 text-sm text-gray-600">
              Professional inventory management platform for makers and small
              teams.
            </p>
          </div>

          <div>
            <h3
              class="text-sm font-semibold text-gray-900 tracking-wider uppercase"
            >
              Product
            </h3>
            <ul class="mt-4 space-y-4">
              <li>
                <NuxtLink
                  to="/features"
                  class="text-sm text-gray-600 hover:text-gray-900"
                >
                  Features
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/pricing"
                  class="text-sm text-gray-600 hover:text-gray-900"
                >
                  Pricing
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/integrations"
                  class="text-sm text-gray-600 hover:text-gray-900"
                >
                  Integrations
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h3
              class="text-sm font-semibold text-gray-900 tracking-wider uppercase"
            >
              Support
            </h3>
            <ul class="mt-4 space-y-4">
              <li>
                <NuxtLink
                  to="/help"
                  class="text-sm text-gray-600 hover:text-gray-900"
                >
                  Help Center
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/contact"
                  class="text-sm text-gray-600 hover:text-gray-900"
                >
                  Contact Us
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/privacy"
                  class="text-sm text-gray-600 hover:text-gray-900"
                >
                  Privacy Policy
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/terms"
                  class="text-sm text-gray-600 hover:text-gray-900"
                >
                  Terms of Service
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-8 border-t border-gray-200 pt-8">
          <p class="text-xs text-gray-500 text-center">
            © {{ new Date().getFullYear() }} Makerly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Auth layout for login/signup pages
</script>
