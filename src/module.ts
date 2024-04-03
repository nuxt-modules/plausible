import { defu } from 'defu'
import {
  addImports,
  addPlugin,
  createResolver,
  defineNuxtModule,
  useLogger,
} from '@nuxt/kit'
import { name, version } from '../package.json'

export interface ModuleOptions {
  /**
   * Whether the tracker shall be enabled.
   *
   * @default true
   */
  enabled?: boolean

  /**
   * Whether page views shall be tracked when the URL hash changes.
   *
   * @remarks
   * Enable this if your Nuxt app has the `hashMode` router option enabled.
   *
   * @default false
   */
  hashMode?: boolean

  /**
   * Whether events shall be tracked when running the site locally.
   *
   * @deprecated Please use `ignoredHostnames` instead.
   * @default false
   */
  trackLocalhost?: boolean

  /**
   * Hostnames to ignore when tracking events.
   *
   * @default ['localhost']
   */
  ignoredHostnames?: string[]

  /**
   * The domain to bind tracking event to.
   *
   * @default window.location.hostname
   */
  domain?: string

  /**
   * The API host where the events will be sent to.
   *
   * @default 'https://plausible.io'
   */
  apiHost?: string

  /**
   * Track the current page and all further pages automatically.
   *
   * @remarks
   * Disable this if you want to manually manage pageview tracking.
   *
   * @default true
   */
  autoPageviews?: boolean

  /**
   * Track all outbound link clicks automatically.
   *
   * @remarks
   * If enabled, a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) automagically detects link nodes throughout the application and binds `click` events to them.
   *
   * @default false
   */
  autoOutboundTracking?: boolean

  /**
   * Log events to the console if they are ignored.
   *
   * @default false
   */
  logIgnoredEvents?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'plausible',
    compatibility: {
      nuxt: '^3.7',
    },
  },
  defaults: {
    enabled: true,
    hashMode: false,
    domain: '',
    ignoredHostnames: ['localhost'],
    trackLocalhost: false,
    apiHost: 'https://plausible.io',
    autoPageviews: true,
    autoOutboundTracking: false,
    logIgnoredEvents: false,
  },
  setup(options, nuxt) {
    const logger = useLogger('plausible')
    const { resolve } = createResolver(import.meta.url)

    // Dedupe `ignoredHostnames` items
    options.ignoredHostnames = Array.from(new Set(options.ignoredHostnames))

    // Migrate `trackLocalhost` to `ignoredHostnames`
    if (options.trackLocalhost) {
      logger.warn(
        'The `trackLocalhost` option has been deprecated. Please use `ignoredHostnames` instead.',
      )
      options.ignoredHostnames = options.ignoredHostnames.filter(
        (domain) => domain !== 'localhost',
      )
    }

    // Add module options to public runtime config
    nuxt.options.runtimeConfig.public.plausible = defu(
      nuxt.options.runtimeConfig.public.plausible as Required<ModuleOptions>,
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

    // Split plugins to reduce bundle size

    if (options.autoPageviews) {
      addPlugin({
        src: resolve('runtime/plugin-auto-pageviews.client'),
        mode: 'client',
        order: 1,
      })
    }

    if (options.autoOutboundTracking) {
      addPlugin({
        src: resolve('runtime/plugin-auto-outbound-tracking.client'),
        mode: 'client',
        order: 2,
      })
    }
  },
})
