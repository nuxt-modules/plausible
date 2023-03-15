<script setup lang="ts">
const { plausible } = useRuntimeConfig().public

function trackEvent() {
  useTrackEvent('playground')
}

function trackPageview() {
  useTrackPageview()
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
  <button @click="trackEvent">
    useTrackEvent
  </button>
  &nbsp;
  <button @click="trackPageview">
    useTrackPageview
  </button>
</template>
