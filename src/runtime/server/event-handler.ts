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
 * Reads `x-forwarded-for` before falling back to `getRequestIP`, because
 * H3 v1 checks `event.context.clientAddress` first – which may resolve to
 * an internal IP (e.g. Docker network) instead of the real client IP.
 */
function resolveClientIP(event: H3Event) {
  const xForwardedFor = getRequestHeader(event, 'x-forwarded-for')
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0]?.trim()
    if (firstIp)
      return firstIp
  }

  return getRequestIP(event)
}
