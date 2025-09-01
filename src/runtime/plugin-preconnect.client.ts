import { defineNuxtPlugin, useHead, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'plausible:preconnect',
  setup() {
    const { plausible: options } = useRuntimeConfig().public

    // Add preconnect to Plausible API host for better performance
    // Note: This plugin is only loaded when proxy is disabled
    if (options.enabled && options.apiHost) {
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
