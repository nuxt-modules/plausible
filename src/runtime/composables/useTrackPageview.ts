import type Plausible from 'plausible-tracker'
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
export function useTrackPageview(
  ...args: Parameters<ReturnType<typeof Plausible>['trackPageview']>
) {
  if (process.client)
    useNuxtApp().$plausible.trackPageview(...args)
}
