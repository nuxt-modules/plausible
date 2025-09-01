import NuxtPlausible from '../src/module'

export default defineNuxtConfig({
  modules: [NuxtPlausible],

  compatibilityDate: '2025-09-01',

  plausible: {
    // Enable tracking events on localhost
    ignoredHostnames: [],
    autoPageviews: false,
    autoOutboundTracking: false,
    proxy: true,
  },
})
