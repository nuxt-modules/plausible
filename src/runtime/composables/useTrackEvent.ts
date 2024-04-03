import { useNuxtApp } from '#imports'
import type {
  EventName,
  EventOptions,
  Plausible,
} from '@barbapapazes/plausible-tracker'

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
export function useTrackEvent(eventName: EventName, options?: EventOptions) {
  if (import.meta.client) {
    // eslint-disable-next-line no-extra-semi
    ;(useNuxtApp().$plausible as Plausible).trackEvent(eventName, options)
  }
}
