import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { createPlausibleTracker } from '@barbapapazes/plausible-tracker'
import type { ModuleOptions } from '../module'

export default defineNuxtPlugin({
  name: 'plausible',
  setup: () => {
    const options = useRuntimeConfig().public
      .plausible as Required<ModuleOptions>

    if (!options.enabled) {
      return
    }

    const plausible = createPlausibleTracker({
      ...options,
      blackListedDomains: options.ignoredHostnames,
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
