import { useNuxtApp } from '#imports'
import type { EventOptions, Plausible } from '@barbapapazes/plausible-tracker'

/**
 * Manually track a page view
 *
 * @remarks
 * Pass optional event data to be sent with the `eventData` argument. Defaults to the current page's data merged with the default options provided during the Plausible initialization.
 *
 * @example
 * useTrackPageview()
 */
export function useTrackPageview(options?: EventOptions) {
  if (import.meta.client) {
    // eslint-disable-next-line no-extra-semi
    ;(useNuxtApp().$plausible as Plausible)?.trackPageview(options)
  }
}
