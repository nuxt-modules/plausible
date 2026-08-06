import { defineNuxtConfig } from 'nuxt/config'
import NuxtPlausible from '../../src/module'

export default defineNuxtConfig({
  modules: [NuxtPlausible],

  compatibilityDate: '2025-01-01',
})
