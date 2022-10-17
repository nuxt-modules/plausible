export default defineNuxtConfig({
  modules: ['../src/module'],

  runtimeConfig: {
    public: {
      plausible: {
        domain: 'example.com',
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
  },
})
