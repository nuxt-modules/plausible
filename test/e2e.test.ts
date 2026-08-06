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

describe('nuxt-plausible proxy', async () => {
  await setup({
    server: true,
    rootDir: fileURLToPath(new URL('./fixture', import.meta.url)),
    nuxtConfig: {
      plausible: {
        proxy: true,
        // Refused by design, so the handler's failure path is what answers.
        apiHost: 'http://127.0.0.1:1',
      },
    },
  })

  it('reports a bad gateway when Plausible cannot be reached', async () => {
    const response = await postEvent()

    expect(response.status).toBe(502)
  })
})
