// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Enable SSG/ISR mode for marketing site
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
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    '@nuxt/fonts'
  ],
  
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
  
  // Supabase configuration
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/']
    }
  },
  
  // Runtime config
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
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
      title: 'Makerly - Inventory Management for Makers',
      meta: [
        { name: 'description', content: 'Professional inventory management platform for makers and small teams. Track inventory, manage manufacturing, and reconcile sales without wrestling spreadsheets.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { property: 'og:title', content: 'Makerly - Inventory Management for Makers' },
        { property: 'og:description', content: 'Professional inventory management platform for makers and small teams.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://makerly.app' },
        { property: 'og:image', content: 'https://makerly.app/og-image.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Makerly - Inventory Management for Makers' },
        { name: 'twitter:description', content: 'Professional inventory management platform for makers and small teams.' },
        { name: 'twitter:image', content: 'https://makerly.app/og-image.jpg' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://makerly.app' }
      ]
    }
  }
})
