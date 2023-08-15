import Plausible from 'plausible-tracker'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin(() => {
  const { plausible: options } = useRuntimeConfig().public

  const plausible = Plausible({
    ...options,
    domain: options.domain || window.location.hostname,
  })

  if (options.autoPageviews) {
    plausible.enableAutoPageviews()
  }

  if (options.autoOutboundTracking) {
    plausible.enableAutoOutboundTracking()
  }

  return {
    provide: {
      plausible,
    },
  }
})
