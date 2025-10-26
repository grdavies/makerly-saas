<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <UIcon name="i-lucide-book-open" class="w-8 h-8 text-blue-600" />
              <span class="text-xl font-bold text-gray-900 dark:text-white">
                Makerly Docs
              </span>
            </NuxtLink>
          </div>
          <div class="flex items-center space-x-4">
            <UButton
              variant="ghost"
              size="sm"
              icon="i-lucide-search"
            />
            <UButton
              variant="ghost"
              size="sm"
              icon="i-lucide-github"
              @click="() => window.open('https://github.com/makerly/makerly-saas', '_blank')"
            />
            <UButton
              variant="ghost"
              size="sm"
              :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
              @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
            />
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex">
        <!-- Sidebar -->
        <aside class="hidden lg:block w-64 py-8 pr-8">
          <nav class="space-y-2">
            <div class="space-y-1">
              <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Getting Started
              </h3>
              <NuxtLink
                to="/"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Introduction
              </NuxtLink>
              <NuxtLink
                to="/installation"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Installation
              </NuxtLink>
              <NuxtLink
                to="/configuration"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Configuration
              </NuxtLink>
            </div>
            
            <div class="space-y-1">
              <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Features
              </h3>
              <NuxtLink
                to="/inventory"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Inventory Management
              </NuxtLink>
              <NuxtLink
                to="/manufacturing"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Manufacturing
              </NuxtLink>
              <NuxtLink
                to="/purchasing"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Purchasing
              </NuxtLink>
              <NuxtLink
                to="/sales"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Sales & Channels
              </NuxtLink>
            </div>
            
            <div class="space-y-1">
              <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                API Reference
              </h3>
              <NuxtLink
                to="/api/authentication"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Authentication
              </NuxtLink>
              <NuxtLink
                to="/api/inventory"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Inventory API
              </NuxtLink>
              <NuxtLink
                to="/api/webhooks"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Webhooks
              </NuxtLink>
            </div>
          </nav>
        </aside>

        <!-- Main content -->
        <main class="flex-1 py-8">
          <div class="max-w-4xl">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Docs layout setup
const colorMode = useColorMode()
</script>
