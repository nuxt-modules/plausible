import type { PlausibleEventOptions } from '@plausible-analytics/tracker'
import type {} from 'nuxt/app'
import { init, track } from '@plausible-analytics/tracker'
import { joinURL, withLeadingSlash } from 'ufo'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { buildHostnameFilter, normalizeHostnames } from './utils'

export default defineNuxtPlugin({
  name: 'plausible',
  setup() {
    const { plausible: options } = useRuntimeConfig().public

    if (!options.enabled)
      return

    const ignoredHostnames = normalizeHostnames(options.ignoredHostnames)

    init({
      domain: options.domain || window.location.hostname,
      endpoint: joinURL(
        options.proxy
          ? withLeadingSlash(options.proxyBaseEndpoint)
          : options.apiHost,
        'api/event',
      ),
      autoCapturePageviews: options.autoPageviews,
      hashBasedRouting: options.hashMode,
      outboundLinks: options.autoOutboundTracking,
      fileDownloads: options.fileDownloads,
      formSubmissions: options.formSubmissions,
      captureOnLocalhost: !ignoredHostnames.includes('localhost'),
      logging: options.logIgnoredEvents,
      // Handle non-localhost ignored hostnames (e.g. staging/preview domains).
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
