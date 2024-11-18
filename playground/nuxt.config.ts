export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',

  modules: ['@nuxtjs/plausible'],

  plausible: {
    autoPageviews: false,
    autoOutboundTracking: false,
    proxy: true,
  },
})
