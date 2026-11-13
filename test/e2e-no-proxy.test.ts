import { join } from 'node:path'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { postEvent } from './post-event'

await setup({
  server: true,
  rootDir: join(import.meta.dirname, 'fixture'),
  nuxtConfig: {
    plausible: {
      proxy: false,
    },
  },
})

describe('event proxy (proxy: false)', () => {
  it('leaves the event route to the app renderer', async () => {
    const response = await postEvent()

    expect(response.headers.get('content-type')).toContain('text/html')
  })
})

describe('preconnect (proxy: false)', () => {
  it('renders the hint for https://plausible.io into the server HTML', async () => {
    const html = await $fetch<string>('/')

    expect(html).toContain('<link rel="preconnect" href="https://plausible.io">')
  })
})
