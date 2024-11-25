import NuxtPlausible from '../src/module'

export default defineNuxtConfig({
  modules: [NuxtPlausible],

  compatibilityDate: '2024-04-03',

  plausible: {
    // Enable tracking events on localhost
    ignoredHostnames: [],
    autoPageviews: false,
    autoOutboundTracking: false,
    proxy: true,
  },
})
