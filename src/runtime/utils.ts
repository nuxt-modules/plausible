import type { PlausibleConfig, PlausibleRequestPayload } from '@plausible-analytics/tracker'

/**
 * Builds the tracker's `transformRequest` callback, which drops an event when the
 * current hostname is one the app wants ignored.
 *
 * @remarks
 * `localhost` is left to the tracker's own `captureOnLocalhost` check, so a filter
 * is only needed once another hostname is named.
 */
export function buildHostnameFilter(
  ignoredHostnames: string[],
  ignoreSubDomains: boolean,
): PlausibleConfig['transformRequest'] {
  const customIgnoredHostnames = ignoredHostnames.filter(hostname => hostname !== 'localhost')

  if (customIgnoredHostnames.length === 0)
    return

  return (payload: PlausibleRequestPayload) => {
    const { hostname } = window.location
    const isIgnored = customIgnoredHostnames.some(ignoredHostname =>
      ignoreSubDomains
        ? hostname === ignoredHostname || hostname.endsWith(`.${ignoredHostname}`)
        : hostname === ignoredHostname,
    )

    return isIgnored ? null : payload
  }
}
