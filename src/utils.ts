export function isRouteWithin(route: string, base: string): boolean {
  const prefix = base.replace(/\/+$/, '')
  return route === prefix || route.startsWith(`${prefix}/`)
}
