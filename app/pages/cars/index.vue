<script setup lang="ts">
import type { CarFilters, CarListItem } from '~/types/car'

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string) || 'https://hassanmotors.pk'

useHead({
  link: [
    { rel: 'canonical', href: `${siteUrl}/cars` },
  ],
})

useSeoMeta({
  title: 'Showroom Inventory | Verified Pre-Owned & Luxury Cars in Faisalabad',
  description: 'Browse our complete inventory of inspected and verified cars in Faisalabad. Filter by brand, price, year, and transmission at Hassan Motors.',
  ogTitle: 'Showroom Inventory | Hassan Motors Faisalabad',
  ogDescription: 'Browse our complete inventory of inspected and verified cars in Faisalabad.',
  ogUrl: `${siteUrl}/cars`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

const route = useRoute()
const router = useRouter()
const { getCars, getBrands } = useCars()

// Load brands for filter dropdown
const { data: brandsRes } = await getBrands()
const brands = computed(() => brandsRes.value?.data || [])

// Initialize filters from URL query parameters
const filters = reactive<CarFilters>({
  brand: (route.query.brand as string) || undefined,
  search: (route.query.search as string) || undefined,
  price_min: (route.query.price_min as string) || undefined,
  price_max: (route.query.price_max as string) || undefined,
  year_min: (route.query.year_min as string) || undefined,
  year_max: (route.query.year_max as string) || undefined,
  transmission: (route.query.transmission as string) || undefined,
  fuel_type: (route.query.fuel_type as string) || undefined,
  status: (route.query.status as string) || undefined,
  sort_by: (route.query.sort_by as string) || 'created_at',
  sort_order: (route.query.sort_order as 'asc' | 'desc') || 'desc',
  page: Number(route.query.page) || 1,
  per_page: 12,
})

// SSR fetch for filtered cars
const { data: carsRes, status, refresh } = await getCars(filters)

const cars = computed<CarListItem[]>(() => carsRes.value?.data || [])
const meta = computed(() => carsRes.value?.meta || { current_page: 1, last_page: 1, per_page: 12, total: 0 })

// Update URL query when filters change
const updateFilters = (newFilters: CarFilters) => {
  Object.assign(filters, newFilters)
  syncQueryToUrl()
  refresh()
}

const handlePageChange = (newPage: number) => {
  filters.page = newPage
  syncQueryToUrl()
  refresh()
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const syncQueryToUrl = () => {
  const query: Record<string, string | number> = {}
  if (filters.brand) query.brand = filters.brand
  if (filters.search) query.search = filters.search
  if (filters.price_min) query.price_min = filters.price_min
  if (filters.price_max) query.price_max = filters.price_max
  if (filters.year_min) query.year_min = filters.year_min
  if (filters.year_max) query.year_max = filters.year_max
  if (filters.transmission) query.transmission = filters.transmission
  if (filters.fuel_type) query.fuel_type = filters.fuel_type
  if (filters.status) query.status = filters.status
  if (filters.sort_by) query.sort_by = filters.sort_by
  if (filters.page && filters.page > 1) query.page = filters.page

  router.push({ path: '/cars', query })
}

const resetAll = () => {
  filters.brand = undefined
  filters.search = undefined
  filters.price_min = undefined
  filters.price_max = undefined
  filters.year_min = undefined
  filters.year_max = undefined
  filters.transmission = undefined
  filters.fuel_type = undefined
  filters.status = undefined
  filters.sort_by = 'created_at'
  filters.page = 1
  syncQueryToUrl()
  refresh()
}

// Mobile Filter Drawer Toggle
const mobileFilterOpen = ref(false)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <!-- Breadcrumb & Title -->
    <div>
      <nav class="flex text-xs text-neutral-500 mb-2 space-x-2">
        <NuxtLink to="/" class="hover:text-amber-400">Home</NuxtLink>
        <span>/</span>
        <span class="text-neutral-300 font-medium">Showroom Inventory</span>
      </nav>

      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight">
            Showroom Inventory
          </h1>
          <p class="text-xs text-neutral-400 mt-1">
            Displaying {{ meta.total }} verified vehicles available for inspection at Hassan Motors, Faisalabad.
          </p>
        </div>

        <!-- Mobile Filter Button -->
        <button
          type="button"
          @click="mobileFilterOpen = !mobileFilterOpen"
          class="lg:hidden px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-amber-400 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filter Cars ({{ meta.total }})
        </button>
      </div>
    </div>

    <!-- Active Filters Pills -->
    <div v-if="filters.brand || filters.search || filters.transmission || filters.fuel_type || filters.price_max" class="flex flex-wrap items-center gap-2 pt-2">
      <span class="text-xs text-neutral-500">Active Filters:</span>
      <span v-if="filters.brand" class="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 border border-neutral-700 text-amber-400 flex items-center gap-1.5">
        Brand: {{ filters.brand }}
        <button @click="() => { filters.brand = undefined; syncQueryToUrl(); refresh(); }">&times;</button>
      </span>
      <span v-if="filters.search" class="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 border border-neutral-700 text-amber-400 flex items-center gap-1.5">
        Search: "{{ filters.search }}"
        <button @click="() => { filters.search = undefined; syncQueryToUrl(); refresh(); }">&times;</button>
      </span>
      <span v-if="filters.transmission" class="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 border border-neutral-700 text-amber-400 flex items-center gap-1.5 capitalize">
        {{ filters.transmission }}
        <button @click="() => { filters.transmission = undefined; syncQueryToUrl(); refresh(); }">&times;</button>
      </span>
      <button
        @click="resetAll"
        class="text-xs text-neutral-400 hover:text-white underline ml-2"
      >
        Clear All
      </button>
    </div>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      <!-- Desktop Sidebar Filter (col 1) -->
      <aside class="hidden lg:block lg:col-span-1 sticky top-28">
        <CarFilter
          :filters="filters"
          :brands="brands"
          @update:filters="updateFilters"
          @reset="resetAll"
        />
      </aside>

      <!-- Cars Display (col 2-4) -->
      <section class="lg:col-span-3 space-y-6">
        <!-- Loading State -->
        <div v-if="status === 'pending'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
          <div v-for="i in 6" :key="i" class="h-80 bg-neutral-900 rounded-2xl border border-neutral-800"></div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="cars.length === 0"
          class="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-12 text-center space-y-4"
        >
          <div class="w-16 h-16 rounded-full bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto text-2xl font-bold">
            0
          </div>
          <h2 class="text-xl font-bold text-white">No Vehicles Match Your Criteria</h2>
          <p class="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            We couldn't find any showroom inventory matching your current combination of filters. Try broadening your budget range, model year, or clearing the search keyword.
          </p>
          <button
            type="button"
            @click="resetAll"
            class="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition"
          >
            Reset All Filters
          </button>
        </div>

        <!-- Vehicle Cards Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <CarCard v-for="car in cars" :key="car.id" :car="car" />
        </div>

        <!-- Pagination -->
        <Pagination :meta="meta" @page-change="handlePageChange" />
      </section>
    </div>

    <!-- Mobile Filter Slide-Over Drawer -->
    <div v-if="mobileFilterOpen" class="fixed inset-0 z-50 lg:hidden flex">
      <div class="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm" @click="mobileFilterOpen = false"></div>
      <div class="relative ml-auto w-full max-w-xs bg-neutral-950 border-l border-neutral-800 h-full p-6 overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
          <span class="text-sm font-bold uppercase tracking-wider text-white">Filters</span>
          <button @click="mobileFilterOpen = false" class="text-neutral-400 p-2">&times;</button>
        </div>
        <CarFilter
          :filters="filters"
          :brands="brands"
          @update:filters="(f) => { updateFilters(f); mobileFilterOpen = false; }"
          @reset="() => { resetAll(); mobileFilterOpen = false; }"
        />
      </div>
    </div>
  </div>
</template>
