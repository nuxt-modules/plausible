![Nuxt Plausible module](./.github/og.png)

# Nuxt Plausible

[![npm version](https://img.shields.io/npm/v/@nuxtjs/plausible?color=a1b858&label=)](https://www.npmjs.com/package/@nuxtjs/plausible)

This module provides a minimal [Plausible tracker](https://github.com/plausible/plausible-tracker) integration with Nuxt.

## Features

- 🌻 No configuration necessary
- 📯 Track events and page views manually with [composables](#composables)
- 📂 [`.env` file support](#configuration)
- 🧺 Sensible default options
- 🦾 SSR-ready

## Setup

```bash
# pnpm
pnpm add -D @nuxtjs/plausible

# npm
npm i -D @nuxtjs/plausible
```

## Basic Usage

Add `@nuxtjs/plausible` to the `modules` section of your Nuxt configuration:

```ts
// `nuxt.config.ts`
export default defineNuxtConfig({
  modules: ['@nuxtjs/plausible']
})
```

Done! Plausible will now run in your application's client.

> ℹ️ By default, `@nuxtjs/plausible` will use `window.location.hostname` for the Plausible `domain` configuration key, which will suit most users.

## Configuration

All [supported module options](#module-options) can be configured using the `plausible` key in your Nuxt configuration:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/plausible'],

  plausible: {
    domain: 'example.com'
  }
})
```

### Runtime Config

Alternatively, leveraging [automatically replaced public runtime config values](https://nuxt.com/docs/api/configuration/nuxt-config#runtimeconfig) by matching environment variables at runtime, set your desired option in your project's `.env` file:

```bash
# Sets the `plausible` public runtime config value for the key `domain`
NUXT_PUBLIC_PLAUSIBLE_DOMAIN=example.com
```

And then use the `plausible` runtime config key in your Nuxt configuration:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/plausible'],

  runtimeConfig: {
    public: {
      plausible: {
        // Will be replaced with the value of `NUXT_PUBLIC_PLAUSIBLE_DOMAIN`
        domain: ''
      }
    }
  }
})
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

As with other composables in the Nuxt 3 ecosystem, they are auto-imported and can be used in your application's components.

> ℹ️ Since the Plausible instance is available in the client only, executing the composables on the server will have no effect.

### `useTrackEvent`

Track a custom event. Track your defined goals by passing the goal's name as the argument `eventName`.

**Type Declarations**

```ts
function useTrackEvent(
  eventName: string,
  options?: EventOptions,
  eventData?: PlausibleOptions
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

**Type Declarations**

```ts
function useTrackPageview(
  eventData?: PlausibleOptions,
  options?: EventOptions
): void
```

## 💻 Development

1. Clone this repository
2. Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
3. Install dependencies using `pnpm install`
4. Run `pnpm run dev:prepare`
5. Start development server using `pnpm run dev`

## Similar Packages

- [vue-plausible](https://github.com/moritzsternemann/vue-plausible), without first-class Nuxt 3 and composables.

## Credits

- [SVGBackgrounds.com](https://www.svgbackgrounds.com) for the OpenGraph image background pattern.

## License

[MIT](./LICENSE) License © 2022-2023 [Johann Schopplich](https://github.com/johannschopplich)
