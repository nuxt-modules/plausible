<script setup lang="ts">
const { plausible } = useRuntimeConfig().public

function trackEvent() {
  useTrackEvent('playground', { props: { action: 'click' }, callback: () => console.log('Event tracked') })
}

function trackPageview() {
  useTrackPageview()
}

function pushRoute() {
  navigateTo('/about')
}
</script>

<template>
  <Head>
    <Title>@nuxtjs/plausible</Title>
    <Link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css"
    />
  </Head>

  <header>
    <h1>@nuxtjs/plausible</h1>
  </header>

  <h3>Configuration</h3>
  <details>
    <summary>Public Runtime Options</summary>
    <pre>{{ JSON.stringify(plausible, null, 2) }}</pre>
  </details>

  <h3>Composables</h3>
  <button @click="trackEvent">useTrackEvent</button>
  &nbsp;
  <button @click="trackPageview">useTrackPageview</button>
  &nbsp;
  <button @click="pushRoute">navigateTo</button>

  <h3>Links</h3>
  <ul>
    <li>
      <a href="https://github.com/nuxt-modules/plausible">Plausible (same page)</a>
    </li>
    <li>
      <a href="https://github.com/nuxt-modules/plausible" target="_blank">Plausible (another tab)</a>
    </li>
  </ul>
</template>
