<script setup lang="ts">
import type { CarListItem } from '~/types/car'

const props = defineProps<{
  car: CarListItem
}>()

const imageUrl = computed(() => {
  return props.car.primary_image?.thumbnail_url || props.car.primary_image?.url || '/images/car-placeholder.jpg'
})
</script>

<template>
  <div class="group bg-neutral-900/70 border border-neutral-800/80 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-black/50">
    <!-- Image Thumbnail Container -->
    <NuxtLink :to="`/cars/${car.slug}`" class="relative block aspect-[16/10] bg-neutral-950 overflow-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none">
      <img
        :src="imageUrl"
        :alt="`${car.year} ${car.brand?.name || ''} ${car.title} for sale in Faisalabad - Hassan Motors`.trim()"
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        @error="($event.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'250\' viewBox=\'0 0 400 250\'><rect fill=\'%23171717\' width=\'400\' height=\'250\'/><text fill=\'%23737373\' font-family=\'sans-serif\' font-size=\'16\' dy=\'10.5\' font-weight=\'bold\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\'>Hassan Motors</text></svg>'"
      />

      <!-- Badges overlay -->
      <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
        <span
          v-if="car.status === 'available'"
          class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500 text-neutral-950 shadow-md"
        >
          Available
        </span>
        <span
          v-else
          class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-500/90 text-white shadow-md"
        >
          Sold
        </span>

        <span
          v-if="car.is_featured"
          class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 shadow-md"
        >
          Featured
        </span>
      </div>

      <!-- Year Badge -->
      <div class="absolute bottom-3 right-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-neutral-950/80 backdrop-blur text-neutral-200 border border-neutral-800">
        {{ car.year }}
      </div>
    </NuxtLink>

    <!-- Card Body -->
    <div class="p-5 flex-1 flex flex-col justify-between">
      <div>
        <div class="text-xs uppercase font-semibold text-amber-500 tracking-wider">
          {{ car.brand?.name || 'Verified' }}
        </div>

        <h3 class="text-base font-bold text-white mt-1 group-hover:text-amber-400 transition-colors line-clamp-1">
          <NuxtLink :to="`/cars/${car.slug}`">
            {{ car.title }}
          </NuxtLink>
        </h3>

        <!-- Key specs row -->
        <div class="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-neutral-800/80 text-xs text-neutral-400">
          <div>
            <span class="block text-[10px] text-neutral-500 uppercase">Mileage</span>
            <span class="font-medium text-neutral-200">
              {{ car.mileage ? `${car.mileage.toLocaleString()} km` : 'Unspecified' }}
            </span>
          </div>
          <div>
            <span class="block text-[10px] text-neutral-500 uppercase">Transmission</span>
            <span class="font-medium text-neutral-200 capitalize">{{ car.transmission }}</span>
          </div>
          <div>
            <span class="block text-[10px] text-neutral-500 uppercase">Fuel</span>
            <span class="font-medium text-neutral-200 capitalize">{{ car.fuel_type }}</span>
          </div>
        </div>
      </div>

      <!-- Price & Action -->
      <div class="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
        <div>
          <span class="block text-[10px] uppercase tracking-wider text-neutral-500">Demand</span>
          <span class="text-lg font-black text-white tracking-tight">
            {{ car.price_formatted }}
          </span>
        </div>

        <NuxtLink
          :to="`/cars/${car.slug}`"
          class="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-neutral-800 text-neutral-200 hover:bg-amber-500 hover:text-neutral-950 transition-all"
        >
          View &rarr;
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
