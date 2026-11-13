import type { NuxtConfig } from '@nuxt/schema'
import { join } from 'node:path'
import { loadNuxt } from '@nuxt/kit'
import { describe, expect, it } from 'vitest'

describe('ignoredHostnames', () => {
  it('replaces the default with an empty list from runtimeConfig', async () => {
    const config = await resolvePlausibleConfig({
      runtimeConfig: {
        public: {
          plausible: { ignoredHostnames: [] },
        },
      },
    })

    expect(config.ignoredHostnames).toEqual([])
  })
})

describe('proxy route check', () => {
  it('accepts a handler whose route only shares the prefix of proxyBaseEndpoint', async () => {
    await expect(resolvePlausibleConfig({
      plausible: { proxy: true },
      serverHandlers: [
        { route: '/_plausible-other/x', handler: '~/server/x.ts' },
      ],
    })).resolves.toBeDefined()
  })
})

async function resolvePlausibleConfig(overrides: NuxtConfig) {
  const nuxt = await loadNuxt({
    cwd: join(import.meta.dirname, 'fixture'),
    ready: true,
    overrides,
  })
  const config = nuxt.options.runtimeConfig.public.plausible
  await nuxt.close()
  return config
}
