import type Plausible from 'plausible-tracker'
import { useNuxtApp } from '#imports'

/**
 * Tracks a custom event
 *
 * @remarks
 * Track your defined goals by passing the goal's name as the argument `eventName`
 *
 * @example
 * // Tracks the `signup` goal
 * useTrackEvent('signup')
 *
 * // Tracks the `Download` goal passing a `method` property.
 * useTrackEvent('Download', { props: { method: 'HTTP' } })
 */
export function useTrackEvent (
  ...args: Parameters<ReturnType<typeof Plausible>['trackEvent']>
) {
  if (process.client) {
    useNuxtApp().$plausible.trackEvent(...args)
  }
}
