<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Global app configuration
useHead({
  title: 'Makerly - Inventory Management',
  meta: [
    { name: 'description', content: 'Professional inventory management for makers and small teams' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

// Initialize color mode
const colorMode = useColorMode()
</script>
