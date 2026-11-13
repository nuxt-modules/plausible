![Nuxt Plausible module](./.github/og.png)

# Nuxt Plausible

[![npm version](https://img.shields.io/npm/v/@nuxtjs/plausible?color=a1b858&label=)](https://www.npmjs.com/package/@nuxtjs/plausible)

Privacy-friendly web analytics for [Nuxt](https://nuxt.com), powered by [Plausible](https://plausible.io).

- [✨ &nbsp;Release Notes](https://github.com/nuxt-modules/plausible/releases)

## Features

- 🌻 No configuration necessary
- 📯 Track events and page views manually with [composables](#composables)
- 📊 Automatic tracking of outbound links, file downloads and form submissions
- 🔀 Optional API proxy to avoid ad blockers
- 📂 [`.env` file support](#set-options-from-environment-variables)
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

Done! Plausible now runs in your application's client.

> [!TIP]
> By default, `@nuxtjs/plausible` uses `window.location.hostname` as the Plausible `domain`. Set the [`domain` option](#module-options) to override it.

## Configuration

Set the [module options](#module-options) under the `plausible` key of your Nuxt configuration.

### Ignore Hostnames

Your `ignoredHostnames` list replaces the default `['localhost']`, so keep `localhost` in it:

```ts
export default defineNuxtConfig({
  plausible: {
    // Skip tracking on the staging domain as well as localhost
    ignoredHostnames: ['localhost', 'staging.example.com'],
  },
})
```

> [!TIP]
> To track events on localhost, set `ignoredHostnames` to an empty array. This also starts counting automated browsers on every hostname, your production one included.

### Set Options From Environment Variables

Set options in your project's `.env` file – Nuxt [replaces public runtime config values](https://nuxt.com/docs/api/nuxt-config#runtimeconfig) with matching environment variables at runtime:

```bash
# Sets the `plausible.domain` option to `example.com`
NUXT_PUBLIC_PLAUSIBLE_DOMAIN=example.com
```

The array and object options, `ignoredHostnames` and `fileDownloads`, take JSON:

```bash
NUXT_PUBLIC_PLAUSIBLE_IGNORED_HOSTNAMES='["localhost","staging.example.com"]'
```

With this setup, you can omit the `plausible` key in your Nuxt configuration – except for `proxy` and `proxyBaseEndpoint`, which are read when the app is built.

### Proxy Events Through Your Server

The proxy routes Plausible events through your Nitro server instead of sending them straight to Plausible's servers, which keeps ad blockers from blocking requests to Plausible's domain.

To enable the proxy, set the `proxy` option to `true`:

```ts
export default defineNuxtConfig({
  plausible: {
    proxy: true,
  },
})
```

The route is `/_plausible/api/event`. A build with `enabled` set to `false` exposes no forwarder.

Because the proxy answers on your own origin, the browser attaches the cookies your site has set. Only the headers Plausible reads travel on: the `user-agent`, which it attributes the visitor and their device by, the `content-type` of the event, and an `x-forwarded-for` carrying the visitor's IP address, which Plausible resolves the country from. Your cookies stay on your server.

Behind a reverse proxy or load balancer, make sure it sets the `x-forwarded-for` header – without it, Plausible receives the reverse proxy's address for every visitor.

The route answers `413` for a body over 8 KB. A Plausible event is a few hundred bytes, and the route takes no authentication.

> [!IMPORTANT]
> Up to v3 the proxy forwarded every header of the incoming request. If you counted on a header beyond those three reaching Plausible, it no longer travels.

### Track Outbound Links, File Downloads and Form Submissions

The [official Plausible tracker](https://github.com/plausible/analytics/tree/master/tracker) tracks outbound link clicks, file downloads and form submissions:

```ts
export default defineNuxtConfig({
  plausible: {
    autoOutboundTracking: true,
    fileDownloads: true,
    formSubmissions: true,
  },
})
```

File download tracking covers common file types (pdf, xlsx, docx, zip, etc.) unless you name extensions yourself:

```ts
export default defineNuxtConfig({
  plausible: {
    fileDownloads: {
      fileExtensions: ['pdf', 'zip', 'csv']
    },
  },
})
```

> [!NOTE]
> These features require the corresponding goals to be configured in your [Plausible dashboard](https://plausible.io/docs/custom-event-goals). Outbound link clicks are tracked as `Outbound Link: Click`, file downloads as `File Download` and form submissions as `Form: Submission`.

## Module Options

| Option                 | Type                                 | Default                      | Description                                                                                                          |
| ---------------------- | ------------------------------------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `enabled`              | `boolean`                            | `true`                       | Whether the tracker shall be enabled.                                                                                |
| `hashMode`             | `boolean`                            | `false`                      | Whether page views shall be tracked when the URL hash changes. Enable this if your Nuxt app uses hash-based routing. |
| `domain`               | `string`                             | `''`                         | The domain to bind tracking events to, `window.location.hostname` when empty.                                         |
| `ignoredHostnames`     | `string[]`                           | `['localhost']`              | Hostnames to ignore when tracking events. See [Ignore Hostnames](#ignore-hostnames).                                 |
| `ignoreSubDomains`     | `boolean`                            | `false`                      | Also ignore subdomains of `ignoredHostnames`. Has no effect on `localhost`, so it does nothing until you add a hostname of your own. |
| `apiHost`              | `string`                             | `'https://plausible.io'`     | The API host to send events to.                                                                           |
| `autoPageviews`        | `boolean`                            | `true`                       | Track page views automatically. Disable this if you want to manually manage pageview tracking.                       |
| `autoOutboundTracking` | `boolean`                            | `false`                      | Track outbound link clicks automatically.                                                                            |
| `fileDownloads`        | `boolean \| { fileExtensions: string[] }` | `false`                      | Track file downloads automatically. Pass an object to customize tracked file extensions.                             |
| `formSubmissions`      | `boolean`                            | `false`                      | Track form submissions automatically.                                                                                |
| `logIgnoredEvents`     | `boolean`                            | `false`                      | Log ignored events to the console.                                                                                   |
| `proxy`                | `boolean`                            | `false`                      | Route events through your own origin instead of the Plausible API host. See [Proxy Events Through Your Server](#proxy-events-through-your-server). |
| `proxyBaseEndpoint`    | `string`                             | `'/_plausible'`              | Base path the proxy answers on. The event route sits below it, at `/_plausible/api/event`.                           |

## Composables

The composables are auto-imported. On the server, they do nothing, since the Plausible instance is only available on the client.

### `useTrackEvent`

Track a custom event. Pass a goal's name as `eventName` to record that goal.

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
useTrackEvent('Download', {
  props: { method: 'HTTP' }
})

// Tracks the `Purchase` goal with revenue data
useTrackEvent('Purchase', {
  revenue: { amount: 15.99, currency: 'USD' }
})
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
useTrackPageview({ url: 'https://example.com/virtual-page' })
```

### `PlausibleEventOptions`

Both composables take the same options:

| Option        | Type                                                          | Description                                                                                                      |
| ------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `props`       | `Record<string, string>`                                      | [Custom properties](https://plausible.io/docs/custom-props/introduction) of the event.                           |
| `revenue`     | `{ amount: number \| string, currency: string }`              | [Revenue](https://plausible.io/docs/ecommerce-revenue-tracking) of the event, in an ISO 4217 `currency` such as `USD`. |
| `interactive` | `boolean`                                                     | Defaults to `true`, and `false` keeps the event out of the bounce rate.                                           |
| `url`         | `string`                                                      | The full page URL to record instead of the current one.                                                          |
| `callback`    | `(result?: { status: number } \| { error: unknown }) => void` | Called with `{ status }` for a response, `{ error }` for a failed request, and no argument for an ignored event. |

## 💻 Development

1. Clone this repository
2. Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
3. Install dependencies using `pnpm install`
4. Run `pnpm run dev:prepare`
5. Start development server using `pnpm run dev`

## License

[MIT](./LICENSE) License © 2022-PRESENT [Johann Schopplich](https://github.com/johannschopplich)
