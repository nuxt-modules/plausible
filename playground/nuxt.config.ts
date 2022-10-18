export default defineNuxtConfig({
  modules: ['../src/module'],

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
  },
})
