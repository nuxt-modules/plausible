import {
  addImports,
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule,
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
   * If enabled, outbound link clicks are tracked automatically.
   *
   * @default false
   */
  autoOutboundTracking?: boolean

  /**
   * Track file downloads automatically.
   *
   * @remarks
   * When enabled, clicks on links to common file types are tracked as `File Download` events.
   * Pass an object with `fileExtensions` to customize which file types are tracked.
   *
   * @default false
   */
  fileDownloads?: boolean | { fileExtensions: string[] }

  /**
   * Track form submissions automatically.
   *
   * @default false
   */
  formSubmissions?: boolean

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

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    plausible: Required<ModuleOptions>
  }
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
    apiHost: 'https://plausible.io',
    autoPageviews: true,
    autoOutboundTracking: false,
    fileDownloads: false,
    formSubmissions: false,
    logIgnoredEvents: false,
    proxy: false,
    proxyBaseEndpoint: '/_plausible',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Set default hostnames if `ignoredHostnames` is not set
    options.ignoredHostnames ??= [...DEFAULT_HOSTNAMES]

    // Dedupe `ignoredHostnames` items
    options.ignoredHostnames = Array.from(new Set(options.ignoredHostnames))

    // Add module options to public runtime config
    nuxt.options.runtimeConfig.public.plausible = defu(
      nuxt.options.runtimeConfig.public.plausible,
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
