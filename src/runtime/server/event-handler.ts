import type { H3Event } from 'h3'
import type { ModuleOptions } from '../../module'
import { createError, defineEventHandler, getRequestHeader, getRequestIP, readRawBody, sendProxy } from 'h3'
import { joinURL } from 'ufo'
import { useRuntimeConfig } from '#imports'

/** Allowlisted, not denylisted: the proxy answers on the site's own origin, so it receives the browser's first-party cookies. */
const FORWARDED_HEADERS = ['user-agent', 'content-type']

/** A Plausible event is a few hundred bytes. The route is unauthenticated, so anything larger is not an event. */
const MAX_BODY_SIZE = 8 * 1024

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const options = config.public.plausible as Required<ModuleOptions>

  if (!options?.apiHost) {
    throw createError({
      statusCode: 500,
      message: 'Plausible API host not configured',
    })
  }

  const contentLength = Number(getRequestHeader(event, 'content-length'))
  if (contentLength > MAX_BODY_SIZE)
    throw payloadTooLargeError()

  // Checked again after reading, because a chunked request declares no length.
  const body = await readRawBody(event, false).catch(() => undefined)
  if (body && body.length > MAX_BODY_SIZE)
    throw payloadTooLargeError()

  try {
    const target = joinURL(options.apiHost, 'api/event')
    const clientIP = resolveClientIP(event)
    const headers: Record<string, string> = {}

    for (const name of FORWARDED_HEADERS) {
      const value = getRequestHeader(event, name)
      if (value)
        headers[name] = value
    }

    // Plausible prefers `x-plausible-ip` and `cf-connecting-ip` over this one; neither is forwarded, so a client cannot outrank it.
    if (clientIP)
      headers['x-forwarded-for'] = clientIP

    return await sendProxy(event, target, {
      fetchOptions: {
        method: event.method,
        body: body && new Uint8Array(body),
        headers,
      },
    })
  }
  catch (error) {
    console.error('[nuxt-plausible]', error)

    throw createError({
      statusCode: 502,
      message: 'Failed to proxy request to Plausible API',
    })
  }
})

function payloadTooLargeError() {
  return createError({
    statusCode: 413,
    message: 'Event payload too large',
  })
}

/** Prefers `x-forwarded-for` over `getRequestIP`, which reads `event.context.clientAddress` first and may land on a Docker-internal address. */
function resolveClientIP(event: H3Event) {
  const xForwardedFor = getRequestHeader(event, 'x-forwarded-for')
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0]?.trim()
    if (firstIp)
      return firstIp
  }

  return getRequestIP(event)
}
