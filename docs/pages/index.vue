<template>
  <div>
    <div class="prose prose-lg max-w-none dark:prose-invert">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Welcome to Makerly Documentation
      </h1>
      
      <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Complete guide to using Makerly for inventory management, manufacturing, and sales tracking.
      </p>

      <!-- Quick Start Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <UCard>
          <template #header>
            <div class="flex items-center space-x-3">
              <UIcon name="i-lucide-rocket" class="w-6 h-6 text-blue-500" />
              <h3 class="text-lg font-semibold">Quick Start</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Get up and running with Makerly in minutes. Follow our step-by-step guide to set up your first inventory.
          </p>
          <UButton to="/installation" variant="outline" size="sm">
            Get Started
          </UButton>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center space-x-3">
              <UIcon name="i-lucide-book-open" class="w-6 h-6 text-green-500" />
              <h3 class="text-lg font-semibold">User Guide</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Learn how to use all of Makerly's features including inventory, manufacturing, and sales management.
          </p>
          <UButton to="/inventory" variant="outline" size="sm">
            Read Guide
          </UButton>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center space-x-3">
              <UIcon name="i-lucide-code" class="w-6 h-6 text-purple-500" />
              <h3 class="text-lg font-semibold">API Reference</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Integrate Makerly with your existing systems using our comprehensive REST API.
          </p>
          <UButton to="/api/authentication" variant="outline" size="sm">
            View API
          </UButton>
        </UCard>
      </div>

      <!-- Features Overview -->
      <div class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Key Features
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Inventory Management
            </h3>
            <ul class="space-y-2 text-gray-600 dark:text-gray-400">
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>FIFO lot tracking and costing</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Multi-location inventory</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Real-time stock levels</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Automated reorder points</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Manufacturing
            </h3>
            <ul class="space-y-2 text-gray-600 dark:text-gray-400">
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Recipe and BOM management</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Work order tracking</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Quality assurance testing</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Yield and scrap tracking</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Sales & Channels
            </h3>
            <ul class="space-y-2 text-gray-600 dark:text-gray-400">
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Multi-channel sales tracking</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Order import and sync</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Inventory allocation</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Fulfillment tracking</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Reporting & Analytics
            </h3>
            <ul class="space-y-2 text-gray-600 dark:text-gray-400">
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Real-time dashboards</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>COGS and valuation reports</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Custom report builder</span>
              </li>
              <li class="flex items-center space-x-2">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
                <span>Export to CSV/Excel</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Getting Help -->
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Need Help?
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Can't find what you're looking for? We're here to help you get the most out of Makerly.
        </p>
        <div class="flex flex-wrap gap-4">
          <UButton
            variant="outline"
            icon="i-lucide-mail"
            @click="() => window.open('mailto:support@makerly.app', '_blank')"
          >
            Contact Support
          </UButton>
          <UButton
            variant="outline"
            icon="i-lucide-github"
            @click="() => window.open('https://github.com/makerly/makerly-saas/issues', '_blank')"
          >
            Report Issue
          </UButton>
          <UButton
            variant="outline"
            icon="i-lucide-message-circle"
            @click="() => window.open('https://discord.gg/makerly', '_blank')"
          >
            Join Discord
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Documentation home page
useHead({
  title: 'Makerly Documentation',
  meta: [
    { name: 'description', content: 'Complete documentation for Makerly inventory management platform' }
  ]
})

// Set layout
definePageMeta({
  layout: 'docs'
})
</script>
