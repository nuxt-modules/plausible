export default defineNuxtConfig({
  modules: ['../src/module.ts'],

  plausible: {
    autoPageviews: false,
    autoOutboundTracking: false,
  },
})
