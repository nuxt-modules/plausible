import { defineNuxtConfig } from 'nuxt/config'
import NuxtPlausible from '../../src/module'

export default defineNuxtConfig({
  modules: [NuxtPlausible],

  plausible: {
    proxy: true,
  },

  compatibilityDate: '2026-01-01',
})
