import { defineNuxtPlugin } from 'nuxt/app'
import { createPlausibleTracker } from '@barbapapazes/plausible-tracker'
import type { ModuleOptions } from '../module'
import { useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'plausible',
  setup() {
    const options = useRuntimeConfig().public
      .plausible as Required<ModuleOptions>

    if (!options.enabled) {
      return
    }

    const plausible = createPlausibleTracker({
      ...options,
      logIgnored: options.logIgnoredEvents,
      domain: options.domain || window.location.hostname,
    })

    return {
      provide: {
        plausible,
      },
    }
  },
})
