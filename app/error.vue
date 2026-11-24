<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-white flex flex-col justify-between font-sans">
    <AppHeader />

    <main class="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div class="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto text-3xl font-black">
        {{ error.statusCode || 404 }}
      </div>

      <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-white">
        {{ error.statusCode === 404 ? 'Vehicle or Page Not Found' : 'Something Went Wrong' }}
      </h1>

      <p class="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
        {{ error.message || 'The vehicle you are looking for may have been sold, archived, or the page link might be incorrect.' }}
      </p>

      <div class="pt-4 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          @click="handleError"
          class="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
        >
          Return to Home
        </button>

        <NuxtLink
          to="/cars"
          class="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 transition"
        >
          Browse Active Inventory &rarr;
        </NuxtLink>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
