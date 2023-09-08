import { defu } from 'defu'
import {
  addImports,
  addPlugin,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
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
      nuxt: '^3',
    },
  },
  defaults: {
    hashMode: false,
    trackLocalhost: false,
    domain: '',
    apiHost: 'https://plausible.io',
    autoPageviews: true,
    autoOutboundTracking: false,
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Add module options to public runtime config
    nuxt.options.runtimeConfig.public.plausible = defu(
      nuxt.options.runtimeConfig.public.plausible,
      options,
    )

    // Transpile runtime
    nuxt.options.build.transpile.push(resolve('runtime'))

    addImports(
      ['useTrackEvent', 'useTrackPageview'].map((name) => ({
        name,
        as: name,
        from: resolve(`runtime/composables/${name}`),
      })),
    )

    addPlugin({
      src: resolve('runtime/plugin.client'),
      mode: 'client',
    })
  },
})
