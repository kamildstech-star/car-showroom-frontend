// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'theme-color', content: '#0a0a0a' },
      ],
    },
  },

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://hassanmotors.pk',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
      apiPrefix: '/api/v1',
    },
  },

  typescript: {
    strict: true,
  },
})
