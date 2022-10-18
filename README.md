<p align="center">
  <a href="https://plausible.io/">
    <img src="./.github/plausible-logo.svg" alt="Plausible logo" width="128" height="128">
  </a>
</p>

<h3 align="center">nuxt-plausible</h3>

<p align="center">
  Nuxt 3 module to natively integrate Plausible analytics
  <br>
  <a href="https://plausible.io/"><strong>Visit Plausible »</strong></a>
</p>

# nuxt-plausible

[![npm version](https://img.shields.io/npm/v/nuxt-plausible?color=a1b858&label=)](https://www.npmjs.com/package/nuxt-plausible)

This module provides a minimal [Plausible tracker](https://github.com/plausible/plausible-tracker) integration with Nuxt.

## Features

- 🌻 No configuration necessary
- 📯 Track events and page views manually with [composables](#composables)
- 📂 `.env` file support by [automatically replaced public runtime config values](https://v3.nuxtjs.org/api/configuration/nuxt-config#runtimeconfig)
- 🧺 Sensible default options
- 🦾 SSR-ready

## Setup

```bash
# pnpm
pnpm add -D nuxt-plausible

# npm
npm i -D nuxt-plausible
```

## Basic Usage

Add `nuxt-plausible` to your Nuxt config:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['nuxt-plausible'],
})
```

Done! Plausible will now run in your application's client.

## Configuration

All [supported module options](#module-options) can be set by either the module options key `plausible`, or the public runtime config key with the same name.

```ts
export default defineNuxtConfig({
  modules: ['nuxt-plausible'],

  // Configure using the module options
  plausible: {
    domain: 'example.com',
    autoOutboundTracking: true,
  },

  // **Or** the public runtime config instead
  runtimeConfig: {
    public: {
      plausible: {
        domain: 'example.com',
        autoOutboundTracking: true,
      },
    },
  },
})
```

### Custom Domain

> ℹ️ By default, `nuxt-plausible` will use `window.location.hostname` as the Plausible `domain`, which will suit most users.

#### Via Module Options

If you prefer to use a custom domain, you can either set it using the `plausible` module options:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-plausible'],

  plausible: {
    domain: 'example.com',
  },
})
```

#### Via Public Runtime Config

Alternatively, leveraging [automatically replaced public runtime config values](https://v3.nuxtjs.org/api/configuration/nuxt-config#runtimeconfig) by matching `.env` variables at runtime, set your desired option in your project's `.env` file:

```bash
# Sets the `plausible` public runtime config value for the key `domain`
NUXT_PUBLIC_PLAUSIBLE_DOMAIN=example.com
```

## Module Options

| Option | Type | Description | Default |
| --- | --- | --- | --- |
| `hashMode` | `boolean` | Whether page views shall be tracked when the URL hash changes. Enable this if your Nuxt app has the `hashMode` router option enabled. | `false` |
| `trackLocalhost` | `boolean` | Whether events shall be tracked when running the site locally. | `false` |
| `domain` | `string` | The domain to bind tracking event to. | `window.location.hostname` |
| `apiHost` | `string` | The API host where the events will be sent to. | `https://plausible.io` |
| `autoPageviews` | `boolean` | Track the current page and all further pages automatically. Disable this if you want to manually manage pageview tracking. | `true` |
| `autoOutboundTracking` | `boolean` | Track all outbound link clicks automatically. If enabled, a [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) automagically detects link nodes throughout the application and binds `click` events to them. | `false` |

## Composables

As with other composables in the Nuxt 3 ecosystem, the following ones are available without the need of importing them.

> ℹ️ Since the Plausible instance is available in the client only, calling the tracking composables will have no effect. They will exit gracefully on the server.

### `useTrackEvent`

Track a custom event. Track your defined goals by passing the goal's name as the argument `eventName`.

**Types**

```ts
function useTrackEvent(
  eventName: string,
  options?: EventOptions,
  eventData?: PlausibleOptions,
): void
```

**Example**

```ts
// Tracks the `signup` goal
useTrackEvent('signup')

// Tracks the `Download` goal passing a `method` property.
useTrackEvent('Download', { props: { method: 'HTTP' } })
```

### `useTrackPageview`

Manually track a page view.

Pass optional event data to be sent with the `eventData` argument. Defaults to the current page's data merged with the default options provided during the Plausible initialization.

**Types**

```ts
function useTrackPageview(
  eventData?: PlausibleOptions,
  options?: EventOptions,
): void
```

## 💻 Development

1. Clone this repository
2. Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
3. Install dependencies using `pnpm install`
4. Run `pnpm run dev:prepare`
5. Start development server using `pnpm run dev`

## Similar Packages

- [vue-plausible](https://github.com/moritzsternemann/vue-plausible), without first-class Nuxt 3 and composables.

## License

[MIT](./LICENSE) License © 2022 [Johann Schopplich](https://github.com/johannschopplich)
