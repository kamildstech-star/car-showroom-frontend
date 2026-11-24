<script setup lang="ts">
import type { CarImage } from '~/types/car'

const props = defineProps<{
  images: CarImage[]
  carTitle: string
}>()

const activeIndex = ref(0)

const activeImage = computed(() => {
  if (!props.images || props.images.length === 0) {
    return null
  }
  return props.images[activeIndex.value] || props.images[0]
})

const nextImage = () => {
  if (props.images.length > 0) {
    activeIndex.value = (activeIndex.value + 1) % props.images.length
  }
}

const prevImage = () => {
  if (props.images.length > 0) {
    activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (props.images.length <= 1) return
  if (e.key === 'ArrowRight') {
    nextImage()
  } else if (e.key === 'ArrowLeft') {
    prevImage()
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Main Display Frame -->
    <div
      class="relative aspect-[16/10] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden group shadow-2xl focus-within:ring-2 focus-within:ring-amber-500"
      tabindex="0"
      :aria-label="`${carTitle} image gallery. Use arrow keys to navigate.`"
    >
      <template v-if="activeImage && activeImage.url">
        <img
          :src="activeImage.url"
          :alt="activeImage.alt_text || `${carTitle} - Photo ${activeIndex + 1}`"
          class="w-full h-full object-cover transition-all duration-300"
        />

        <!-- Primary Badge if applicable -->
        <div v-if="activeImage.is_primary" class="absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 shadow-md">
          Featured Photo
        </div>

        <!-- Navigation Arrows (if multiple images) -->
        <div v-if="images.length > 1" class="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            @click="prevImage"
            class="w-10 h-10 rounded-full bg-neutral-950/80 hover:bg-neutral-900 text-white flex items-center justify-center border border-neutral-700 transition focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            aria-label="Previous photo"
          >
            &larr;
          </button>
          <button
            type="button"
            @click="nextImage"
            class="w-10 h-10 rounded-full bg-neutral-950/80 hover:bg-neutral-900 text-white flex items-center justify-center border border-neutral-700 transition focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            aria-label="Next photo"
          >
            &rarr;
          </button>
        </div>

        <!-- Photo Counter Badge -->
        <div class="absolute bottom-4 right-4 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-950/80 backdrop-blur text-neutral-200 border border-neutral-800" aria-live="polite">
          {{ activeIndex + 1 }} / {{ images.length }}
        </div>
      </template>

      <!-- Fallback empty state -->
      <div v-else class="w-full h-full flex flex-col items-center justify-center text-neutral-500 p-8 text-center">
        <div class="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3 font-black text-xl">
          HM
        </div>
        <p class="text-sm font-medium text-neutral-400">{{ carTitle }}</p>
        <p class="text-xs text-neutral-600 mt-1">Official vehicle photography on file at showroom</p>
      </div>
    </div>

    <!-- Thumbnail Strip -->
    <div v-if="images.length > 1" class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin" role="region" aria-label="Photo thumbnails">
      <button
        v-for="(img, idx) in images"
        :key="img.id"
        type="button"
        @click="activeIndex = idx"
        :aria-label="`View ${img.alt_text || carTitle + ' photo ' + (idx + 1)}`"
        :aria-current="activeIndex === idx ? 'true' : undefined"
        class="relative flex-shrink-0 w-24 sm:w-28 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        :class="activeIndex === idx ? 'border-amber-500 scale-95 shadow-md shadow-amber-500/20' : 'border-neutral-800 hover:border-neutral-700 opacity-60 hover:opacity-100'"
      >
        <img
          :src="img.thumbnail_url || img.url || ''"
          :alt="img.alt_text || `${carTitle} photo ${idx + 1}`"
          loading="lazy"
          class="w-full h-full object-cover"
        />
      </button>
    </div>
  </div>
</template>
