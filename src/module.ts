import { fileURLToPath } from 'node:url'
import { join } from 'pathe'
import { defu } from 'defu'
import { addImportsDir, addPlugin, defineNuxtModule } from '@nuxt/kit'
import { name, version } from '../package.json'

export interface ModuleOptions {
  /**
   * Whether page views shall be tracked when the URL hash changes
   *
   * @remarks
   * Enable this if your Nuxt app has the `hashMode` router option enabled
   *
   * @default false
   */
  hashMode?: boolean

  /**
   * Whether events shall be tracked when running the site locally
   *
   * @default false
   */
  trackLocalhost?: boolean

  /**
   * The domain to bind tracking event to
   *
   * @default window.location.hostname
   */
  domain?: string

  /**
   * The API host where the events will be sent to
   *
   * @default 'https://plausible.io'
   */
  apiHost?: string

  /**
   * Track the current page and all further pages automatically
   *
   * @remarks
   * Disable this if you want to manually manage pageview tracking
   *
   * @default true
   */
  autoPageviews?: boolean

  /**
   * Track all outbound link clicks automatically
   *
   * @remarks
   * If enabled, a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) automagically detects link nodes throughout the application and binds `click` events to them
   *
   * @default false
   */
  autoOutboundTracking?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'plausible',
    compatibility: {
      nuxt: '^3'
    }
  },
  defaults: {
    hashMode: false,
    trackLocalhost: false,
    domain: '',
    apiHost: 'https://plausible.io',
    autoPageviews: true,
    autoOutboundTracking: false
  },
  setup (options, nuxt) {
    // Add module options to public runtime config
    nuxt.options.runtimeConfig.public.plausible = defu(
      nuxt.options.runtimeConfig.public.plausible,
      options
    )

    // Transpile runtime
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    addImportsDir(join(runtimeDir, 'composables'))

    addPlugin({
      src: join(runtimeDir, 'plugin.client'),
      mode: 'client'
    })
  }
})
