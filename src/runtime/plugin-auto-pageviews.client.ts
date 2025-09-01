import type { Plausible } from '@barbapapazes/plausible-tracker'
import type {} from 'nuxt/app'
import { defineNuxtPlugin, useNuxtApp, useRuntimeConfig } from '#imports'
import { useAutoPageviews } from '@barbapapazes/plausible-tracker/extensions/auto-pageviews'

export default defineNuxtPlugin({
  name: 'plausible:auto-pageviews',
  setup() {
    const { plausible: options } = useRuntimeConfig().public
    const { $plausible } = useNuxtApp()

    if (options.enabled && options.autoPageviews) {
      useAutoPageviews($plausible as Plausible).install()
    }
  },
})
