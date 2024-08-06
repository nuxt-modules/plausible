import { defineNuxtPlugin } from 'nuxt/app'
import type { Plausible } from '@barbapapazes/plausible-tracker'
import { useAutoOutboundTracking } from '@barbapapazes/plausible-tracker/extensions/auto-outbound-tracking'
import type { ModuleOptions } from '../module'
import { useNuxtApp, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'plausible:auto-outbound-tracking',
  setup() {
    const options = useRuntimeConfig().public
      .plausible as Required<ModuleOptions>

    const { $plausible } = useNuxtApp()

    if (options.enabled && options.autoOutboundTracking) {
      useAutoOutboundTracking($plausible as Plausible).install()
    }
  },
})
