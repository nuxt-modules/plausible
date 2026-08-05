import { defineNuxtPlugin, useHead, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'plausible:preconnect',
  setup() {
    const { plausible: options } = useRuntimeConfig().public

    // Note: This plugin is only loaded when proxy is disabled.
    if (options.enabled && options.apiHost && !options.apiHost.startsWith('/')) {
      useHead({
        link: [
          {
            rel: 'preconnect',
            href: options.apiHost,
          },
        ],
      })
    }
  },
})
