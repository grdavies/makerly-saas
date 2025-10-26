<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Dashboard Header -->
    <header
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              Makerly
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <UButton variant="ghost" size="sm" icon="i-lucide-bell" />
            <UButton variant="ghost" size="sm" icon="i-lucide-settings" />
            <UAvatar
              src="https://avatars.githubusercontent.com/u/739984?v=4"
              alt="User"
              size="sm"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Makerly
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Your inventory management dashboard is ready to go.
        </p>
      </div>

      <!-- Dashboard Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Inventory Overview Card -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Inventory Overview</h3>
              <UIcon name="i-lucide-package" class="text-blue-500" />
            </div>
          </template>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >Total SKUs</span
              >
              <span class="font-semibold">0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >Low Stock Items</span
              >
              <span class="font-semibold text-orange-500">0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >Out of Stock</span
              >
              <span class="font-semibold text-red-500">0</span>
            </div>
          </div>
        </UCard>

        <!-- Recent Orders Card -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Recent Orders</h3>
              <UIcon name="i-lucide-shopping-cart" class="text-green-500" />
            </div>
          </template>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >Today</span
              >
              <span class="font-semibold">0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >This Week</span
              >
              <span class="font-semibold">0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >This Month</span
              >
              <span class="font-semibold">0</span>
            </div>
          </div>
        </UCard>

        <!-- Quick Actions Card -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Quick Actions</h3>
              <UIcon name="i-lucide-zap" class="text-purple-500" />
            </div>
          </template>
          <div class="space-y-3">
            <UButton block variant="outline" icon="i-lucide-plus">
              Add New Item
            </UButton>
            <UButton block variant="outline" icon="i-lucide-file-text">
              Create Work Order
            </UButton>
            <UButton block variant="outline" icon="i-lucide-upload">
              Import Data
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Recent Activity -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Recent Activity</h3>
        </template>
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          <UIcon name="i-lucide-activity" class="w-12 h-12 mx-auto mb-4" />
          <p>No recent activity to display</p>
        </div>
      </UCard>
    </main>
  </div>
</template>

<script setup lang="ts">
// Dashboard page setup
useHead({
  title: 'Dashboard - Makerly',
});

// Initialize color mode
const colorMode = useColorMode();
</script>
