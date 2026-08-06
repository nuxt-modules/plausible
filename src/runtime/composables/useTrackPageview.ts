import type { PlausibleEventOptions } from '@plausible-analytics/tracker'
import { useNuxtApp } from '#imports'

/**
 * Tracks a page view manually.
 *
 * @remarks
 * Pass event data to send along with the `options` argument. Defaults to the current page's data merged with the default options provided during the Plausible initialization.
 *
 * @example
 * useTrackPageview()
 */
export function useTrackPageview(options?: PlausibleEventOptions) {
  if (import.meta.client) {
    useNuxtApp().$plausible?.trackPageview(options)
  }
}
