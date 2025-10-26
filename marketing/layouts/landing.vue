<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <UIcon name="i-lucide-package" class="w-8 h-8 text-blue-600" />
              <span class="text-xl font-bold text-gray-900 dark:text-white">
                Makerly
              </span>
            </NuxtLink>
          </div>
          
          <div class="hidden md:flex items-center space-x-8">
            <NuxtLink to="/features" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Features
            </NuxtLink>
            <NuxtLink to="/pricing" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Pricing
            </NuxtLink>
            <NuxtLink to="/docs" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Docs
            </NuxtLink>
            <NuxtLink to="/about" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              About
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4">
            <UButton
              variant="ghost"
              size="sm"
              :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
              @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
            />
            <UButton
              variant="ghost"
              size="sm"
              to="/login"
            >
              Sign In
            </UButton>
            <UButton
              size="sm"
              to="/signup"
            >
              Get Started
            </UButton>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Company -->
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <UIcon name="i-lucide-package" class="w-6 h-6 text-blue-600" />
              <span class="text-lg font-bold text-gray-900 dark:text-white">
                Makerly
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Professional inventory management for makers and small teams.
            </p>
            <div class="flex space-x-4">
              <UButton
                variant="ghost"
                size="sm"
                icon="i-lucide-github"
                @click="() => window.open('https://github.com/makerly/makerly-saas', '_blank')"
              />
              <UButton
                variant="ghost"
                size="sm"
                icon="i-lucide-twitter"
                @click="() => window.open('https://twitter.com/makerlyapp', '_blank')"
              />
              <UButton
                variant="ghost"
                size="sm"
                icon="i-lucide-linkedin"
                @click="() => window.open('https://linkedin.com/company/makerly', '_blank')"
              />
            </div>
          </div>

          <!-- Product -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Product
            </h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/features" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Features
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/pricing" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Pricing
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/integrations" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Integrations
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/changelog" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Changelog
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Resources -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Resources
            </h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/docs" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Documentation
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/guides" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Guides
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/blog" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Blog
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/support" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Support
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Company -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Company
            </h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/about" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  About
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/careers" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Careers
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/contact" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Contact
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/privacy" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              © 2024 Makerly. All rights reserved.
            </p>
            <div class="flex space-x-6 mt-4 md:mt-0">
              <NuxtLink to="/terms" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms
              </NuxtLink>
              <NuxtLink to="/privacy" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy
              </NuxtLink>
              <NuxtLink to="/cookies" class="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Cookies
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Landing layout setup
const colorMode = useColorMode()
</script>
