<script setup lang="ts">
import type { Brand, CarFilters } from '~/types/car'

const props = defineProps<{
  filters: CarFilters
  brands: Brand[]
}>()

const emit = defineEmits<{
  (e: 'update:filters', filters: CarFilters): void
  (e: 'reset'): void
}>()

const local = reactive<CarFilters>({ ...props.filters })

watch(() => props.filters, (newVal) => {
  Object.assign(local, newVal)
}, { deep: true })

const applyFilters = () => {
  emit('update:filters', { ...local, page: 1 })
}

const handleReset = () => {
  local.brand = undefined
  local.search = undefined
  local.price_min = undefined
  local.price_max = undefined
  local.year_min = undefined
  local.year_max = undefined
  local.transmission = undefined
  local.fuel_type = undefined
  local.status = undefined
  local.sort_by = 'created_at'
  local.sort_order = 'desc'
  emit('reset')
}
</script>

<template>
  <div class="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <h3 class="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter Inventory
      </h3>
      <button
        type="button"
        @click="handleReset"
        class="text-xs text-neutral-400 hover:text-amber-400 transition"
      >
        Clear All
      </button>
    </div>

    <!-- Search keyword -->
    <div>
      <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
        Model / Keyword
      </label>
      <input
        v-model="local.search"
        type="text"
        placeholder="e.g. Corolla, Civic, Sportage..."
        class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
        @keydown.enter="applyFilters"
      />
    </div>

    <!-- Brand Select -->
    <div>
      <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
        Vehicle Brand
      </label>
      <select
        v-model="local.brand"
        class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-amber-500 transition"
      >
        <option :value="undefined">All Brands</option>
        <option v-for="b in brands" :key="b.id" :value="b.name">
          {{ b.name }}
        </option>
      </select>
    </div>

    <!-- Price Range -->
    <div>
      <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
        Price Range (PKR)
      </label>
      <div class="grid grid-cols-2 gap-2">
        <select
          v-model="local.price_min"
          class="w-full px-2.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option :value="undefined">Min Price</option>
          <option value="1000000">1 Million</option>
          <option value="2500000">2.5 Million</option>
          <option value="5000000">5 Million</option>
          <option value="8000000">8 Million</option>
          <option value="12000000">12 Million</option>
        </select>

        <select
          v-model="local.price_max"
          class="w-full px-2.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option :value="undefined">Max Price</option>
          <option value="3000000">3 Million</option>
          <option value="6000000">6 Million</option>
          <option value="10000000">10 Million</option>
          <option value="15000000">15 Million</option>
          <option value="25000000">25 Million+</option>
        </select>
      </div>
    </div>

    <!-- Year Range -->
    <div>
      <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
        Model Year
      </label>
      <div class="grid grid-cols-2 gap-2">
        <select
          v-model="local.year_min"
          class="w-full px-2.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option :value="undefined">From Year</option>
          <option v-for="y in [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2018, 2015, 2010]" :key="y" :value="y">
            {{ y }}
          </option>
        </select>

        <select
          v-model="local.year_max"
          class="w-full px-2.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option :value="undefined">To Year</option>
          <option v-for="y in [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2018, 2015, 2010]" :key="y" :value="y">
            {{ y }}
          </option>
        </select>
      </div>
    </div>

    <!-- Transmission -->
    <div>
      <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
        Transmission
      </label>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          @click="local.transmission = local.transmission === 'automatic' ? undefined : 'automatic'"
          class="py-2 px-3 rounded-xl text-xs font-semibold border transition"
          :class="local.transmission === 'automatic' ? 'bg-amber-500 text-neutral-950 border-amber-500' : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'"
        >
          Automatic
        </button>
        <button
          type="button"
          @click="local.transmission = local.transmission === 'manual' ? undefined : 'manual'"
          class="py-2 px-3 rounded-xl text-xs font-semibold border transition"
          :class="local.transmission === 'manual' ? 'bg-amber-500 text-neutral-950 border-amber-500' : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'"
        >
          Manual
        </button>
      </div>
    </div>

    <!-- Fuel Type -->
    <div>
      <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
        Fuel Type
      </label>
      <select
        v-model="local.fuel_type"
        class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-amber-500"
      >
        <option :value="undefined">All Fuel Types</option>
        <option value="petrol">Petrol</option>
        <option value="diesel">Diesel</option>
        <option value="hybrid">Hybrid</option>
        <option value="electric">Electric</option>
      </select>
    </div>

    <!-- Sorting -->
    <div>
      <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
        Sort By
      </label>
      <select
        v-model="local.sort_by"
        class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:border-amber-500"
      >
        <option value="created_at">Recently Listed</option>
        <option value="price">Price</option>
        <option value="year">Year</option>
        <option value="mileage">Mileage</option>
      </select>
    </div>

    <!-- Action Buttons -->
    <div class="pt-4 border-t border-neutral-800 space-y-2">
      <button
        type="button"
        @click="applyFilters"
        class="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
      >
        Apply Filters
      </button>
    </div>
  </div>
</template>
