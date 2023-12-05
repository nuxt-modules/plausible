import Plausible from 'plausible-tracker'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../module'

export default defineNuxtPlugin(() => {
  const options = useRuntimeConfig().public.plausible as ModuleOptions

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
