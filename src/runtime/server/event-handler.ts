import type { H3Event } from 'h3'
import type { ModuleOptions } from '../../module'
import { createError, defineEventHandler, getRequestHeader, getRequestIP, readRawBody, sendProxy } from 'h3'
import { joinURL } from 'ufo'
import { useRuntimeConfig } from '#imports'

/**
 * Request headers Plausible reads from an event: `user-agent` identifies the
 * visitor and their device, `content-type` describes the body.
 *
 * @remarks
 * The proxy answers on your own domain, so the browser attaches its first-party
 * cookies to a request that leaves for a third party. Forwarding an allowlist
 * rather than stripping known-sensitive names keeps the next header someone adds
 * out of it as well.
 */
const FORWARDED_HEADERS = ['user-agent', 'content-type']

export default defineEventHandler(async (event) => {
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
    const headers: Record<string, string> = {}

    for (const name of FORWARDED_HEADERS) {
      const value = getRequestHeader(event, name)
      if (value)
        headers[name] = value
    }

    // Plausible reads the visitor's IP from the proxy, since the request now
    // arrives from the server. It prefers `x-plausible-ip` and `cf-connecting-ip`
    // over this one, and neither is forwarded, so a client cannot outrank it.
    if (clientIP)
      headers['x-forwarded-for'] = clientIP

    return await sendProxy(event, target, {
      fetchOptions: {
        method: event.method,
        body: await readRawBody(event).catch(() => undefined),
        headers,
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
