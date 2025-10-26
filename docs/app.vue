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
  title: 'Makerly Documentation',
  meta: [
    { name: 'description', content: 'Complete documentation for Makerly inventory management platform' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

// Initialize color mode
const colorMode = useColorMode()
</script>
