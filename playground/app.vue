<script setup lang="ts">
import { navigateTo, useHead, useRuntimeConfig, useTrackEvent, useTrackPageview } from '#imports'

const { plausible } = useRuntimeConfig().public

if (import.meta.server) {
  useHead({
    title: '@nuxtjs/plausible',
    link: [
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css',
      },
    ],
  })
}

function trackEvent() {
  useTrackEvent('playground', {
    props: {
      action: 'click',
    },
    callback() {
      console.log('Event tracked')
    },
  })
}

function trackPageview() {
  useTrackPageview()
}

function pushRoute() {
  navigateTo('/about')
}
</script>

<template>
  <header>
    <h1>@nuxtjs/plausible</h1>
  </header>

  <h3>Configuration</h3>
  <details>
    <summary>Public Runtime Options</summary>
    <pre>{{ JSON.stringify(plausible, undefined, 2) }}</pre>
  </details>

  <h3>Composables</h3>
  <p>
    <button @click="trackEvent">
      useTrackEvent
    </button>
    &nbsp;
    <button @click="trackPageview">
      useTrackPageview
    </button>
    &nbsp;
    <button @click="pushRoute">
      navigateTo
    </button>
  </p>

  <h3>Links</h3>
  <ul>
    <li>
      <a href="https://github.com/nuxt-modules/plausible">
        Plausible (same page)
      </a>
    </li>
    <li>
      <a
        href="https://github.com/nuxt-modules/plausible"
        target="_blank"
      >
        Plausible (another tab)
      </a>
    </li>
  </ul>
</template>
