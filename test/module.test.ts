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

describe('proxy', () => {
  it('rejects a file route under /_plausible, the default proxyBaseEndpoint', async () => {
    await expect(loadNuxt({
      cwd: join(import.meta.dirname, 'fixture-file-route'),
      ready: true,
    })).rejects.toThrow('The route `/_plausible` is already in use')
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
