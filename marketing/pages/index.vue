<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20 lg:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Inventory Management
            <span class="text-blue-600 dark:text-blue-400">for Makers</span>
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Track inventory, manage manufacturing, and reconcile sales without wrestling spreadsheets. 
            Built for solo makers and small teams who need professional inventory management.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton
              size="lg"
              to="/signup"
              class="px-8 py-4 text-lg"
            >
              Start Free Trial
            </UButton>
            <UButton
              variant="outline"
              size="lg"
              to="/demo"
              class="px-8 py-4 text-lg"
            >
              Watch Demo
            </UButton>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to manage inventory
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From raw materials to finished products, Makerly helps you track every step of your manufacturing process.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Inventory Management -->
          <UCard class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                <UIcon name="i-lucide-package" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Inventory Management
              </h3>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Track stock levels, manage locations, and get alerts when inventory runs low. 
              Built-in FIFO costing ensures accurate financial reporting.
            </p>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Real-time stock tracking
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Multi-location support
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                FIFO lot costing
              </li>
            </ul>
          </UCard>

          <!-- Manufacturing -->
          <UCard class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                <UIcon name="i-lucide-factory" class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Manufacturing
              </h3>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Create recipes, manage work orders, and track production from start to finish. 
              Built-in quality assurance tools help maintain consistency.
            </p>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Recipe & BOM management
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Work order tracking
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Quality assurance
              </li>
            </ul>
          </UCard>

          <!-- Sales & Channels -->
          <UCard class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                <UIcon name="i-lucide-shopping-cart" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Sales & Channels
              </h3>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Sync with your sales channels, import orders, and track fulfillment. 
              Keep your inventory in sync across all platforms.
            </p>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Multi-channel sync
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Order import
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Fulfillment tracking
              </li>
            </ul>
          </UCard>

          <!-- Reporting -->
          <UCard class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-4">
                <UIcon name="i-lucide-bar-chart-3" class="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Reporting & Analytics
              </h3>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Get insights into your business with comprehensive reports. 
              Track COGS, inventory valuation, and sales performance.
            </p>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Real-time dashboards
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                COGS tracking
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Custom reports
              </li>
            </ul>
          </UCard>

          <!-- Team Collaboration -->
          <UCard class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mr-4">
                <UIcon name="i-lucide-users" class="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Team Collaboration
              </h3>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Work together with your team using role-based permissions. 
              Keep everyone in sync with real-time updates and notifications.
            </p>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Role-based access
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Real-time updates
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Team notifications
              </li>
            </ul>
          </UCard>

          <!-- Integrations -->
          <UCard class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-4">
                <UIcon name="i-lucide-plug" class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                Integrations
              </h3>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Connect with your existing tools and workflows. 
              Import data from spreadsheets or sync with your favorite apps.
            </p>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                CSV import/export
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                API access
              </li>
              <li class="flex items-center">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mr-2" />
                Webhook support
              </li>
            </ul>
          </UCard>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-blue-600 dark:bg-blue-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to get started?
        </h2>
        <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of makers who trust Makerly to manage their inventory. 
          Start your free trial today.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton
            size="lg"
            to="/signup"
            class="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100"
          >
            Start Free Trial
          </UButton>
          <UButton
            variant="outline"
            size="lg"
            to="/contact"
            class="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-blue-600"
          >
            Contact Sales
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Marketing home page
useHead({
  title: 'Makerly - Inventory Management for Makers',
  meta: [
    { name: 'description', content: 'Professional inventory management platform for makers and small teams. Track inventory, manage manufacturing, and reconcile sales without wrestling spreadsheets.' }
  ]
})

// Set layout
definePageMeta({
  layout: 'landing'
})
</script>
