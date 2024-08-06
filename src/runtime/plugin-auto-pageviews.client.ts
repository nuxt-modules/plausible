import { defineNuxtPlugin } from 'nuxt/app'
import type { Plausible } from '@barbapapazes/plausible-tracker'
import { useAutoPageviews } from '@barbapapazes/plausible-tracker/extensions/auto-pageviews'
import type { ModuleOptions } from '../module'
import { useNuxtApp, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'plausible:auto-pageviews',
  setup() {
    const options = useRuntimeConfig().public
      .plausible as Required<ModuleOptions>

    const { $plausible } = useNuxtApp()

    if (options.enabled && options.autoPageviews) {
      useAutoPageviews($plausible as Plausible).install()
    }
  },
})
