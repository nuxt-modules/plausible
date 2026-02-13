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
    callback(result) {
      console.log('Event tracked', result)
    },
  })
}

function trackNonInteractiveEvent() {
  useTrackEvent('background-task', {
    interactive: false,
    callback(result) {
      console.log('Non-interactive event tracked', result)
    },
  })
}

function trackRevenue() {
  useTrackEvent('Purchase', {
    revenue: { amount: 29.99, currency: 'USD' },
    props: { plan: 'Pro' },
    callback(result) {
      console.log('Revenue event tracked', result)
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
  <div class="button-group">
    <button @click="trackEvent">
      useTrackEvent
    </button>
    <button @click="trackNonInteractiveEvent">
      Non-interactive Event
    </button>
    <button @click="trackRevenue">
      Revenue Event
    </button>
    <button @click="trackPageview">
      useTrackPageview
    </button>
    <button @click="pushRoute">
      navigateTo
    </button>
  </div>

  <h3>File Downloads</h3>
  <ul>
    <li><a href="/test.pdf">Download PDF</a></li>
    <li><a href="/test.zip">Download ZIP</a></li>
  </ul>

  <h3>Form Submissions</h3>
  <form @submit.prevent>
    <label>Email: <input type="email" name="email" placeholder="test@example.com"></label>
    &nbsp;
    <button type="submit">
      Submit
    </button>
  </form>

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

<style>
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
