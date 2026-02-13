import type { PlausibleConfig, PlausibleEventOptions, PlausibleRequestPayload } from '@plausible-analytics/tracker'
import type {} from 'nuxt/app'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { init, track } from '@plausible-analytics/tracker'
import { joinURL, withLeadingSlash } from 'ufo'

export default defineNuxtPlugin({
  name: 'plausible',
  setup() {
    const { plausible: options } = useRuntimeConfig().public

    if (!options.enabled)
      return

    init({
      domain: options.domain || window.location.hostname,
      endpoint: joinURL(
        options.proxy ? withLeadingSlash(options.proxyBaseEndpoint) : options.apiHost,
        'api/event',
      ),
      autoCapturePageviews: options.autoPageviews,
      hashBasedRouting: options.hashMode,
      outboundLinks: options.autoOutboundTracking,
      fileDownloads: options.fileDownloads,
      formSubmissions: options.formSubmissions,
      captureOnLocalhost: !options.ignoredHostnames.includes('localhost'),
      logging: options.logIgnoredEvents,
      // Handle non-localhost ignored hostnames (e.g. staging/preview domains)
      transformRequest: buildHostnameFilter(options.ignoredHostnames, options.ignoreSubDomains),
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

function buildHostnameFilter(ignoredHostnames: string[], ignoreSubDomains: boolean): PlausibleConfig['transformRequest'] {
  const customIgnoredHostnames = ignoredHostnames.filter(hostname => hostname !== 'localhost')

  if (customIgnoredHostnames.length === 0)
    return

  return (payload: PlausibleRequestPayload) => {
    const { hostname } = window.location
    const isIgnored = customIgnoredHostnames.some(i =>
      ignoreSubDomains
        ? hostname === i || hostname.endsWith(`.${i}`)
        : hostname === i,
    )

    return isIgnored ? null : payload
  }
}
