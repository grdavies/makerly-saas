// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Enable SSR mode for web application
  ssr: true,
  
  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false // Disable during development to avoid auto-import conflicts
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
    '@nuxtjs/i18n',
    '@nuxt/fonts',
    '@planship/nuxt',
    '@pinia/nuxt'
  ],
  
  // UI module configuration
  ui: {
    global: true,
    icons: ['lucide']
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
  
  // I18n configuration
  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en.json',
        iso: 'en-US'
      }
    ],
    lazy: true,
    langDir: 'locales/',
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false
    },
    compilation: {
      strictMessage: false
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
  
  // Supabase configuration
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/']
    }
  },
  
  // Planship configuration
  planship: {
    apiKey: process.env.PLANSHIP_API_KEY,
    productId: process.env.PLANSHIP_PRODUCT_ID,
    customerId: process.env.PLANSHIP_CUSTOMER_ID
  },
  
  // Pinia configuration
  pinia: {
    storesDirs: ['./stores/**']
  },
  
  // Runtime config
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      planshipApiKey: process.env.PLANSHIP_API_KEY,
      planshipProductId: process.env.PLANSHIP_PRODUCT_ID
    }
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
  
  // Nitro configuration
  nitro: {
    experimental: {
      wasm: true
    }
  }
})