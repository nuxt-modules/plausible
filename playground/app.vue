<script setup lang="ts">
const { plausible } = useRuntimeConfig().public
</script>

<template>
  <div>
    <h1>nuxt-plausible</h1>
    <strong>Options</strong>
    <pre>{{ JSON.stringify(plausible, null, 2) }}</pre>
  </div>
</template>
