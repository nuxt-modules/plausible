export default defineNuxtConfig({
  modules: ['@nuxtjs/plausible'],

  plausible: {
    autoPageviews: false,
    autoOutboundTracking: false,
  },
})
