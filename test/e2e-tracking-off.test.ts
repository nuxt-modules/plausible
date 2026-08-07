import { join } from 'node:path'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { postEvent } from './post-event'

describe('event proxy (enabled: false)', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      plausible: {
        enabled: false,
        proxy: true,
      },
    },
  })

  it('leaves the event route to the app renderer', async () => {
    const response = await postEvent()

    expect(response.headers.get('content-type')).toContain('text/html')
  })
})
