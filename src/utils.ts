/**
 * Checks whether `route` is `base` or lies below it on a path boundary, so a route that
 * only shares the prefix stays outside. Expects `base` without a trailing slash.
 */
export function isRouteWithin(route: string, base: string): boolean {
  return route === base || route.startsWith(`${base}/`)
}
