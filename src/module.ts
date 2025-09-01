import {
  addImports,
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  useLogger,
} from '@nuxt/kit'
import { defu } from 'defu'
import { joinURL, withLeadingSlash } from 'ufo'
import { name, version } from '../package.json'

const DEFAULT_HOSTNAMES = ['localhost']

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
   * Ignore the hostname if it is a subdomain of `ignoredHostnames`.
   *
   * @default false
   */
  ignoreSubDomains?: boolean

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

  /**
   * Whether to proxy the event endpoint through the current origin.
   *
   * @default false
   */
  proxy?: boolean

  /**
   * The base endpoint to proxy the Plausible event endpoint through.
   *
   * @remarks
   * When proxying is enabled, the frontend will send events to this endpoint instead of the Plausible API host.
   *
   * @default '/_plausible'
   */
  proxyBaseEndpoint?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'plausible',
    compatibility: {
      nuxt: '>=3',
    },
  },
  defaults: {
    enabled: true,
    hashMode: false,
    domain: '',
    ignoredHostnames: undefined,
    ignoreSubDomains: false,
    trackLocalhost: undefined,
    apiHost: 'https://plausible.io',
    autoPageviews: true,
    autoOutboundTracking: false,
    logIgnoredEvents: false,
    proxy: false,
    proxyBaseEndpoint: '/_plausible',
  },
  setup(options, nuxt) {
    const logger = useLogger('plausible')
    const { resolve } = createResolver(import.meta.url)

    // Set default hostnames if `ignoredHostnames` is not set
    options.ignoredHostnames ??= [...DEFAULT_HOSTNAMES]

    // Dedupe `ignoredHostnames` items
    options.ignoredHostnames = Array.from(new Set(options.ignoredHostnames))

    if (options.trackLocalhost !== undefined) {
      logger.warn('The `trackLocalhost` option has been deprecated. Please use `ignoredHostnames` instead.')
    }
    // Migrate `trackLocalhost` to `ignoredHostnames`
    else if (options.trackLocalhost) {
      options.ignoredHostnames = options.ignoredHostnames.filter(
        domain => domain !== 'localhost',
      )
    }

    // Add module options to public runtime config
    nuxt.options.runtimeConfig.public.plausible = defu(
      nuxt.options.runtimeConfig.public.plausible as Required<ModuleOptions>,
      options,
    )

    // Transpile runtime
    nuxt.options.build.transpile.push(resolve('runtime'))

    if (nuxt.options.runtimeConfig.public.plausible.proxy) {
      const proxyBaseEndpoint = withLeadingSlash(nuxt.options.runtimeConfig.public.plausible.proxyBaseEndpoint)
      const hasUserProvidedProxyBase = [...nuxt.options.serverHandlers, ...nuxt.options.devServerHandlers].some(handler => handler.route?.startsWith(proxyBaseEndpoint))

      if (hasUserProvidedProxyBase) {
        throw new Error(`The route \`${proxyBaseEndpoint}\` is already in use. Please use the \`proxyBaseEndpoint\` option to change the base URL of the proxy endpoint.`)
      }

      addServerHandler({
        route: joinURL(proxyBaseEndpoint, 'api/event'),
        handler: resolve('runtime/server/event-handler'),
        method: 'post',
      })
    }

    addImports(
      ['useTrackEvent', 'useTrackPageview'].map(name => ({
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

    // Add preconnect link when proxy is not used
    if (!options.proxy) {
      addPlugin({
        src: resolve('runtime/plugin-preconnect.client'),
        mode: 'client',
        order: -1, // Run early to add preconnect before other resources
      })
    }
  },
})
