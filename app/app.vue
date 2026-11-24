<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | Hassan Motors Faisalabad` : 'Hassan Motors | Verified Luxury & Family Cars in Faisalabad'
  },
  htmlAttrs: {
    lang: 'en',
  },
  meta: [
    { name: 'description', content: 'Explore verified luxury cars and quality family vehicles at Hassan Motors, Faisalabad. Non-accidental guarantee, transparent deals, and instant WhatsApp support.' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-amber-500 selection:text-neutral-950">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
