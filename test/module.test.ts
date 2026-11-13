import type { NuxtConfig } from '@nuxt/schema'
import { join } from 'node:path'
import { loadNuxt } from '@nuxt/kit'
import { describe, expect, it } from 'vitest'
import { isRouteWithin } from '../src/utils'

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

describe('isRouteWithin', () => {
  it('matches /_plausible/x against /_plausible', () => {
    expect(isRouteWithin('/_plausible/x', '/_plausible')).toBe(true)
  })

  it('matches /_plausible against itself', () => {
    expect(isRouteWithin('/_plausible', '/_plausible')).toBe(true)
  })

  it('never matches /_plausible-other/x (which only shares the prefix) against /_plausible', () => {
    expect(isRouteWithin('/_plausible-other/x', '/_plausible')).toBe(false)
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
