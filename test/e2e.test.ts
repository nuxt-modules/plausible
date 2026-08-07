import { join } from 'node:path'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { postEvent } from './post-event'

describe('event proxy (unreachable host)', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      plausible: {
        proxy: true,
        // Refused by design, so the handler's failure path is what answers.
        apiHost: 'http://127.0.0.1:1',
      },
    },
  })

  it('reports a bad gateway', async () => {
    const response = await postEvent()

    expect(response.status).toBe(502)
  })
})
