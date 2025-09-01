import type {} from 'nuxt/app'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { createPlausibleTracker } from '@barbapapazes/plausible-tracker'

export default defineNuxtPlugin({
  name: 'plausible',
  setup() {
    const { plausible: options } = useRuntimeConfig().public

    if (!options.enabled)
      return

    const plausible = createPlausibleTracker({
      ...options,
      logIgnored: options.logIgnoredEvents,
      domain: options.domain || window.location.hostname,
      apiHost: options.proxy ? options.proxyBaseEndpoint : options.apiHost,
    })

    return {
      provide: {
        plausible,
      },
    }
  },
})
