import type { PlausibleEventOptions, PlausibleRequestPayload } from '@plausible-analytics/tracker'
import type {} from 'nuxt/app'
import type { ModuleOptions } from '../module'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { init, track } from '@plausible-analytics/tracker'
import { joinURL } from 'ufo'

export default defineNuxtPlugin({
  name: 'plausible',
  setup() {
    const { plausible: options } = useRuntimeConfig().public as { plausible: Required<ModuleOptions> }

    if (!options.enabled)
      return

    const ignoredHostnames = options.ignoredHostnames ?? []

    init({
      domain: options.domain || window.location.hostname,
      endpoint: options.proxy
        ? joinURL(options.proxyBaseEndpoint, 'api/event')
        : joinURL(options.apiHost, 'api/event'),
      autoCapturePageviews: options.autoPageviews,
      hashBasedRouting: options.hashMode,
      outboundLinks: options.autoOutboundTracking,
      fileDownloads: options.fileDownloads,
      formSubmissions: options.formSubmissions,
      // The tracker's built-in check also covers 127.x.x.x, [::1], and file: protocol
      captureOnLocalhost: !ignoredHostnames.includes('localhost'),
      logging: options.logIgnoredEvents,
      // Handle non-localhost ignored hostnames (e.g. staging/preview domains)
      transformRequest: buildHostnameFilter(ignoredHostnames, options.ignoreSubDomains),
    })

    const plausible = {
      trackEvent(eventName: string, eventOptions?: PlausibleEventOptions) {
        track(eventName, eventOptions ?? {})
      },
      trackPageview(eventOptions?: PlausibleEventOptions) {
        track('pageview', eventOptions ?? {})
      },
    }

    return {
      provide: {
        plausible,
      },
    }
  },
})

function buildHostnameFilter(ignoredHostnames: string[], ignoreSubDomains: boolean) {
  const customIgnoredHostnames = ignoredHostnames.filter(h => h !== 'localhost')
  if (customIgnoredHostnames.length === 0)
    return undefined

  return (payload: PlausibleRequestPayload) => {
    const hostname = window.location.hostname
    const isIgnored = customIgnoredHostnames.some(ignored =>
      ignoreSubDomains
        ? hostname === ignored || hostname.endsWith(`.${ignored}`)
        : hostname === ignored,
    )
    return isIgnored ? null : payload
  }
}
