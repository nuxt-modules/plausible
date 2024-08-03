export default defineNuxtConfig({
  compatibilityDate: '2024-08-03',

  modules: ['@nuxtjs/plausible'],

  plausible: {
    autoPageviews: false,
    autoOutboundTracking: false,
  },
})
