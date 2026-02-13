import type { PlausibleEventOptions } from '@plausible-analytics/tracker'
import { useNuxtApp } from '#imports'

/**
 * Manually track a page view
 *
 * @remarks
 * Pass optional event data to be sent with the `eventData` argument. Defaults to the current page's data merged with the default options provided during the Plausible initialization.
 *
 * @example
 * useTrackPageview()
 */
export function useTrackPageview(options?: PlausibleEventOptions) {
  if (import.meta.client) {
    useNuxtApp().$plausible?.trackPageview(options)
  }
}
