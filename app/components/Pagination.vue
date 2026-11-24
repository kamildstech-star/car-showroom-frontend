<script setup lang="ts">
import type { PaginatedMeta } from '~/types/car'

const props = defineProps<{
  meta: PaginatedMeta
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
}>()

const changePage = (page: number) => {
  if (page >= 1 && page <= props.meta.last_page && page !== props.meta.current_page) {
    emit('page-change', page)
  }
}
</script>

<template>
  <div v-if="meta.last_page > 1" class="flex items-center justify-between pt-8 border-t border-neutral-800 text-xs">
    <div class="text-neutral-400">
      Showing page <span class="text-white font-bold">{{ meta.current_page }}</span> of <span class="text-white font-bold">{{ meta.last_page }}</span> ({{ meta.total }} vehicles total)
    </div>

    <div class="flex items-center space-x-2">
      <!-- Prev -->
      <button
        type="button"
        :disabled="meta.current_page <= 1"
        @click="changePage(meta.current_page - 1)"
        class="px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
      >
        &larr; Previous
      </button>

      <!-- Page pills -->
      <div class="hidden sm:flex items-center space-x-1">
        <button
          v-for="p in meta.last_page"
          :key="p"
          type="button"
          @click="changePage(p)"
          class="w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center"
          :class="p === meta.current_page ? 'bg-amber-500 text-neutral-950 font-black' : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'"
        >
          {{ p }}
        </button>
      </div>

      <!-- Next -->
      <button
        type="button"
        :disabled="meta.current_page >= meta.last_page"
        @click="changePage(meta.current_page + 1)"
        class="px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
      >
        Next &rarr;
      </button>
    </div>
  </div>
</template>
