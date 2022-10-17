<script setup lang="ts">
const { plausible } = useRuntimeConfig().public
</script>

<template>
  <h1>nuxt-plausible</h1>
  <strong>Options</strong>
  <pre>{{ JSON.stringify(plausible, null, 2) }}</pre>
</template>
