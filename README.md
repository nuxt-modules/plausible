![Nuxt Plausible module](./.github/og.png)

# Nuxt Plausible

[![npm version](https://img.shields.io/npm/v/@nuxtjs/plausible?color=a1b858&label=)](https://www.npmjs.com/package/@nuxtjs/plausible)

Native integration of [Plausible Analytics](https://plausible.io) for [Nuxt](https://nuxt.com).

## Features

- 🌻 No configuration necessary
- 📯 Track events and page views manually with [composables](#composables)
- 📊 Automatic tracking of outbound links, file downloads, and form submissions
- 🔀 Optional API proxy to avoid ad blockers
- 📂 [`.env` file support](#configuration)
- 🧺 Sensible default options
- 🦾 SSR-ready

## Setup

```bash
npx nuxt module add plausible
```

## Basic Usage

Add `@nuxtjs/plausible` to the `modules` section of your Nuxt configuration:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['@nuxtjs/plausible'],
})
```

Done! Plausible will now run in your application's client.

> [!TIP]
> By default, `@nuxtjs/plausible` will use `window.location.hostname` for the Plausible `domain` configuration key, which should suit most use cases. If you need to customize the domain, you can do so in the [module options](#module-options).

## Configuration

All [supported module options](#module-options) can be configured using the `plausible` key in your Nuxt configuration:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/plausible'],

  plausible: {
    // Prevent tracking on localhost
    ignoredHostnames: ['localhost'],
  },
})
```

> [!TIP]
> To allow tracking events on localhost, set the `ignoredHostnames` option to an empty array.

### Runtime Config

Alternatively, leveraging [automatically replaced public runtime config values](https://nuxt.com/docs/api/configuration/nuxt-config#runtimeconfig) by matching environment variables at runtime, set your desired option in your project's `.env` file:

```bash
# Sets the `plausible.domain` option to `example.com`
NUXT_PUBLIC_PLAUSIBLE_DOMAIN=example.com
```

With this setup, you can omit the `plausible` key in your Nuxt configuration.

### Proxy Configuration

The module provides a proxy feature that routes Plausible events through your Nitro server instead of sending them directly to Plausible's servers. This is useful to prevent ad blockers from blocking requests to Plausible's domain.

To enable the proxy, set the `proxy` option to `true`:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/plausible'],

  plausible: {
    proxy: true,
  },
})
```

> [!NOTE]
> When enabled, all Plausible events will be sent to your server first, which then forwards them to Plausible's API. The default proxy endpoint is `/_plausible`, but you can customize the path using the `proxyBaseEndpoint` module option.

### Enhanced Tracking

The module supports automatic tracking of outbound link clicks, file downloads, and form submissions – all powered by the [official Plausible tracker](https://github.com/plausible/analytics/tree/master/tracker).

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/plausible'],

  plausible: {
    autoOutboundTracking: true,
    fileDownloads: true,
    formSubmissions: true,
  },
})
```

By default, file download tracking covers common file types (pdf, xlsx, docx, zip, etc.). You can customize which file extensions are tracked:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/plausible'],

  plausible: {
    fileDownloads: { fileExtensions: ['pdf', 'zip', 'csv'] },
  },
})
```

> [!NOTE]
> These features require the corresponding goals to be configured in your [Plausible dashboard](https://plausible.io/docs/custom-event-goals). Outbound link clicks are tracked as `Outbound Link: Click`, file downloads as `File Download`, and form submissions as `Form: Submission`.

## Module Options

| Option                 | Type                                 | Default                      | Description                                                                                                          |
| ---------------------- | ------------------------------------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `enabled`              | `boolean`                            | `true`                       | Whether the tracker shall be enabled.                                                                                |
| `hashMode`             | `boolean`                            | `false`                      | Whether page views shall be tracked when the URL hash changes. Enable this if your Nuxt app uses hash-based routing. |
| `domain`               | `string`                             | `'window.location.hostname'` | The domain to bind tracking events to.                                                                               |
| `ignoredHostnames`     | `string[]`                           | `['localhost']`              | Hostnames to ignore when tracking events.                                                                            |
| `ignoreSubDomains`     | `boolean`                            | `false`                      | Also ignore subdomains of `ignoredHostnames`.                                                                        |
| `apiHost`              | `string`                             | `'https://plausible.io'`     | The API host where events will be sent to.                                                                           |
| `autoPageviews`        | `boolean`                            | `true`                       | Track page views automatically. Disable this if you want to manually manage pageview tracking.                       |
| `autoOutboundTracking` | `boolean`                            | `false`                      | Track outbound link clicks automatically.                                                                            |
| `fileDownloads`        | `boolean \| { fileExtensions: string[] }` | `false`                      | Track file downloads automatically. Pass an object to customize tracked file extensions.                             |
| `formSubmissions`      | `boolean`                            | `false`                      | Track form submissions automatically.                                                                                |
| `logIgnoredEvents`     | `boolean`                            | `false`                      | Log ignored events to the console.                                                                                   |
| `proxy`                | `boolean`                            | `false`                      | Proxy the event endpoint through the current origin.                                                                 |
| `proxyBaseEndpoint`    | `string`                             | `'/_plausible'`              | The base endpoint path for the proxy.                                                                                |

## Composables

As with other composables in the Nuxt ecosystem, they are auto-imported and can be used in your application's components.

> [!NOTE]
> Since the Plausible instance is only available on the client, executing the composables on the server will have no effect.

### `useTrackEvent`

Track a custom event. Track your defined goals by passing the goal's name as the argument `eventName`.

**Type Declarations**

```ts
function useTrackEvent(
  eventName: string,
  options?: PlausibleEventOptions,
): void
```

**Example**

```ts
// Tracks the `signup` goal
useTrackEvent('signup')

// Tracks the `Download` goal passing a `method` property
useTrackEvent('Download', { props: { method: 'HTTP' } })
```

### `useTrackPageview`

Manually track a page view.

**Type Declarations**

```ts
function useTrackPageview(
  options?: PlausibleEventOptions,
): void
```

**Example**

```ts
useTrackPageview()

// Track with a custom URL
useTrackPageview({ url: '/virtual-page' })
```

## 💻 Development

1. Clone this repository
2. Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
3. Install dependencies using `pnpm install`
4. Run `pnpm run dev:prepare`
5. Start development server using `pnpm run dev`

## License

[MIT](./LICENSE) License © 2022-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
