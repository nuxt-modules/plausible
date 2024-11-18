export default defineNuxtConfig({
  modules: ['@nuxtjs/plausible'],

  compatibilityDate: '2024-04-03',

  plausible: {
    autoPageviews: false,
    autoOutboundTracking: false,
    proxy: true,
  },
})
