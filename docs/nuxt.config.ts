// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Enable SSG mode for documentation
  ssr: false,
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  
  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false
  },
  
  // CSS configuration
  css: ['@/assets/css/main.css'],
  
  // Modules
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    '@nuxt/fonts'
  ],
  
  // Content module configuration
  content: {
    highlight: {
      theme: 'github-light',
      preload: ['json', 'js', 'ts', 'html', 'css', 'vue', 'diff', 'shell', 'markdown', 'yaml', 'bash', 'ini']
    },
    markdown: {
      anchorLinks: false
    }
  },
  
  // UI module configuration
  ui: {
    global: true,
    icons: ['lucide', 'heroicons']
  },
  
  // Color mode configuration
  colorMode: {
    preference: 'system',
    fallback: 'light',
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },
  
  
  // Fonts configuration
  fonts: {
    families: [
      { name: 'Nunito', provider: 'google' },
      { name: 'Inter', provider: 'google' },
      { name: 'JetBrains Mono', provider: 'google' }
    ]
  },
  
  // Vite configuration
  vite: {
    plugins: [
      // @ts-ignore
      (await import('vite-tsconfig-paths')).default()
    ],
    resolve: {
      alias: {
        '@shared': '../shared/src'
      }
    }
  },
  
  // Build configuration
  build: {
    transpile: ['@makerly/shared']
  },
  
  // App configuration
  app: {
    head: {
      title: 'Makerly Documentation',
      meta: [
        { name: 'description', content: 'Complete documentation for Makerly inventory management platform' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
