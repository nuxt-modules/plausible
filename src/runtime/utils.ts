import type { PlausibleConfig, PlausibleRequestPayload } from '@plausible-analytics/tracker'

/**
 * Turns `ignoredHostnames` into a list without duplicates.
 *
 * @remarks
 * Nitro parses an environment variable as JSON and keeps any other value as a string,
 * so `NUXT_PUBLIC_PLAUSIBLE_IGNORED_HOSTNAMES=staging.example.com` arrives as one.
 */
export function normalizeHostnames(hostnames: string | string[]): string[] {
  if (typeof hostnames === 'string')
    return [hostnames]

  return Array.from(new Set(hostnames))
}

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
