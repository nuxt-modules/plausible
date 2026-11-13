import type { H3Event } from 'h3'
import type { Buffer } from 'node:buffer'
import type { IncomingMessage } from 'node:http'
import type { ModuleOptions } from '../../module'
import { createError, defineEventHandler, getRequestHeader, getRequestIP, readRawBody, sendProxy } from 'h3'
import { joinURL } from 'ufo'
import { useRuntimeConfig } from '#imports'
import { payloadTooLargeError, readBodyStream, unreadablePayloadError } from './utils'

/** Allowlisted, not denylisted: the proxy answers on the site's own origin, so it receives the browser's first-party cookies. */
const FORWARDED_HEADERS = ['user-agent', 'content-type']

/** A Plausible event is a few hundred bytes. The route is unauthenticated, so anything larger is not an event. */
const MAX_BODY_SIZE = 8 * 1024

/** The key `readRawBody` caches a body it has read under. */
const RAW_BODY_KEY = Symbol.for('h3RawBody')

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

  const body = await readLimitedBody(event)

  try {
    const target = joinURL(options.apiHost, 'api/event')
    const clientIP = resolveClientIP(event)
    const headers: Record<string, string> = {}

    for (const name of FORWARDED_HEADERS) {
      const value = getRequestHeader(event, name)
      if (value)
        headers[name] = value
    }

    // Plausible prefers `x-plausible-ip` and `cf-connecting-ip` over this one, and neither is forwarded. The address itself is the leftmost `x-forwarded-for` entry, which the client can set.
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

async function readLimitedBody(event: H3Event): Promise<Buffer | undefined> {
  const request = event.node.req as IncomingMessage & Record<PropertyKey, unknown>

  // Mirrors where `readRawBody` looks before the Node stream: a body an earlier handler
  // has read, or one a non-Node runtime buffers before Nitro runs. Only the limit is left to check.
  if (event._requestBody || event.web?.request?.body || request[RAW_BODY_KEY] || request.rawBody || request.body || '__unenv__' in request) {
    const body = await readRawBody(event, false).catch(() => {
      throw unreadablePayloadError()
    })
    if (body && body.length > MAX_BODY_SIZE)
      throw payloadTooLargeError()
    return body
  }

  return readBodyStream(request, MAX_BODY_SIZE)
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
