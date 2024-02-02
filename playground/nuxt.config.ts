export default defineNuxtConfig({
  modules: ['../src/module.ts'],

  plausible: {
    autoPageviews: false,
    autoOutboundTracking: false,
  },

  typescript: {
    typeCheck: 'build',
    shim: false,
    tsConfig: {
      compilerOptions: {
        moduleResolution: 'bundler',
      },
    },
  },
})
