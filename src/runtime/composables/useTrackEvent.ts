import type { PlausibleEventOptions } from '@plausible-analytics/tracker'
import { useNuxtApp } from '#imports'

/**
 * Tracks a custom event
 *
 * @remarks
 * Track your defined goals by passing the goal's name as the argument `eventName`.
 *
 * @example
 * // Tracks the `signup` goal
 * useTrackEvent('signup')
 *
 * // Tracks the `Download` goal passing a `method` property.
 * useTrackEvent('Download', { props: { method: 'HTTP' } })
 */
export function useTrackEvent(eventName: string, options?: PlausibleEventOptions) {
  if (import.meta.client) {
    useNuxtApp().$plausible?.trackEvent(eventName, options)
  }
}
