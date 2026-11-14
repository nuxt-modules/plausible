import type { ModuleOptions } from '../../module'
import { createError, defineEventHandler, getRequestHeader, getRequestIP, useRuntimeConfig } from 'nuxt/server'
import { joinURL } from 'ufo'
import { payloadTooLargeError, readBodyStream } from './utils'

/** Allowlisted, not denylisted: the proxy answers on the site's own origin, so it receives the browser's first-party cookies. */
const FORWARDED_HEADERS = ['user-agent', 'content-type']

/** A Plausible event is a few hundred bytes. The route is unauthenticated, so anything larger is not an event. */
const MAX_BODY_SIZE = 8 * 1024

/** Response headers that describe the upstream encoding, which `fetch` has already decoded. */
const ENCODING_HEADERS = ['content-encoding', 'content-length']

export default defineEventHandler(async (event) => {
  const options = useRuntimeConfig().public.plausible as Required<ModuleOptions>

  if (!options?.apiHost) {
    throw createError({
      status: 500,
      message: 'Plausible API host not configured',
    })
  }

  const contentLength = Number(getRequestHeader(event, 'content-length'))
  if (contentLength > MAX_BODY_SIZE)
    throw payloadTooLargeError()

  const body = await readBodyStream(event.req.body, MAX_BODY_SIZE).catch((error) => {
    // The rest of the body stays unread, so the connection can't serve another request.
    event.res.headers.set('connection', 'close')
    throw error
  })
  const headers = new Headers()

  for (const name of FORWARDED_HEADERS) {
    const value = getRequestHeader(event, name)
    if (value)
      headers.set(name, value)
  }

  // Plausible prefers `x-plausible-ip` and `cf-connecting-ip` over this one, and neither is forwarded.
  const clientIP = getRequestIP(event, { xForwardedFor: true })
  if (clientIP)
    headers.set('x-forwarded-for', clientIP)

  let response: Response
  try {
    response = await fetch(joinURL(options.apiHost, 'api/event'), {
      method: event.req.method,
      body,
      headers,
    })
  }
  catch (error) {
    console.error('[nuxt-plausible]', error)

    throw createError({
      status: 502,
      message: 'Failed to proxy request to Plausible API',
    })
  }

  const responseHeaders = new Headers(response.headers)
  for (const name of ENCODING_HEADERS)
    responseHeaders.delete(name)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
})
