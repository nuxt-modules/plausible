import { createError, defineEventHandler, getHeaders, getRequestIP, readBody } from 'h3'
import { ofetch } from 'ofetch'
import { withoutTrailingSlash } from 'ufo'
import type { ModuleOptions } from '../../../module'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const options = config.public.plausible as Required<ModuleOptions>

    if (!options?.apiHost) {
      throw createError({
        statusCode: 500,
        message: 'Plausible API host not configured',
      })
    }

    const target = `${withoutTrailingSlash(options.apiHost)}/api/event`

    const body = await readBody(event)

    const headers = new Headers({
      'Content-Type': 'application/json',
      ...Object.fromEntries([
        ['User-Agent', getHeaders(event)['user-agent']],
        ['X-Forwarded-For', getRequestIP(event, { xForwardedFor: true })],
      ].filter(([_, value]) => value != null)),
    })

    const result = await ofetch(target, {
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
