import { fileURLToPath } from 'node:url'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

function postEvent() {
  return fetch('/_plausible/api/event', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ n: 'pageview', d: 'example.com', u: 'https://example.com/' }),
  })
}

describe('nuxt-plausible without proxy', async () => {
  await setup({
    server: true,
    rootDir: fileURLToPath(new URL('./fixture', import.meta.url)),
    nuxtConfig: {
      plausible: {
        proxy: false,
      },
    },
  })

  it('leaves the event route to the app renderer', async () => {
    const response = await postEvent()

    expect(response.headers.get('content-type')).toContain('text/html')
  })
})
