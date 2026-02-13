import type { H3Event } from 'h3'
import type { ModuleOptions } from '../../module'
import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, getRequestHeader, getRequestIP, proxyRequest } from 'h3'
import { joinURL } from 'ufo'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const options = config.public.plausible as Required<ModuleOptions>

  if (!options?.apiHost) {
    throw createError({
      statusCode: 500,
      message: 'Plausible API host not configured',
    })
  }

  try {
    const target = joinURL(options.apiHost, 'api/event')
    const clientIP = resolveClientIP(event)
    return proxyRequest(event, target, {
      headers: {
        ...(clientIP ? { 'X-Forwarded-For': clientIP } : {}),
      },
    })
  }
  catch (error) {
    console.error(error)

    throw createError({
      statusCode: 502,
      message: 'Failed to proxy request to Plausible API',
    })
  }
})

/**
 * Resolve the real client IP address from common reverse proxy and CDN headers.
 *
 * This reads headers directly instead of relying on `getRequestIP` alone,
 * because `getRequestIP` checks `event.context.clientAddress` first, which
 * may be set to an internal/proxy IP (e.g. Docker network IP) by the runtime,
 * causing the real client IP from proxy headers to be ignored.
 */
function resolveClientIP(event: H3Event): string | undefined {
  // Cloudflare
  const cfConnectingIp = getRequestHeader(event, 'cf-connecting-ip')
  if (cfConnectingIp)
    return cfConnectingIp

  // Common reverse proxy header (Nginx, etc.)
  const xRealIp = getRequestHeader(event, 'x-real-ip')
  if (xRealIp)
    return xRealIp

  // Standard proxy header (first IP is the original client)
  const xForwardedFor = getRequestHeader(event, 'x-forwarded-for')
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0]?.trim()
    if (firstIp)
      return firstIp
  }

  return getRequestIP(event)
}
