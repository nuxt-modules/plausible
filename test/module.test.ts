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
