import type { ModuleOptions } from '../../../module'
import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, getRequestHeader, getRequestIP, readBody } from 'h3'
import { joinURL } from 'ufo'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const options = config.public.plausible as Required<ModuleOptions>

  try {
    if (!options?.apiHost) {
      throw createError({
        statusCode: 500,
        message: 'Plausible API host not configured',
      })
    }

    const target = joinURL(options.apiHost, 'api/event')
    const body = await readBody(event)

    const headers = new Headers({
      'Content-Type': 'application/json',
      ...Object.fromEntries([
        ['User-Agent', getRequestHeader(event, 'user-agent')],
        ['X-Forwarded-For', getRequestIP(event, { xForwardedFor: true })],
      ].filter(([_, value]) => value != null)),
    })

    const result = await globalThis.$fetch(target, {
      method: 'POST',
      headers: headers,
      body,
      retry: 2,
      timeout: 5000,
      onRequestError: ({ request, error }) => {
        console.error(`Failed to send request to ${request}: ${error.message}`)
      },
    })

    return result
  }
  catch (error) {
    if (error instanceof Error && error.name === 'FetchError') {
      throw createError({
        statusCode: 502,
        message: 'Failed to reach Plausible analytics service',
      })
    }

    throw error
  }
})
