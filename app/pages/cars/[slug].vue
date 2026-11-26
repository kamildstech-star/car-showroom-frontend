<script setup lang="ts">
import type { CarDetail, CarListItem } from '~/types/car'
import {
  buildBreadcrumbJsonLd,
  buildCarJsonLd,
  buildFactualCarDescription,
} from '~/utils/carDescription'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { getCarBySlug, getCars } = useCars()
const { settings, phoneTel, fullAddress } = useShowroom()

// Fetch car details by slug with SSR
const { data: carRes, error } = await getCarBySlug(slug)

// If car not found or draft, throw 404 error for Nuxt SSR
if (error.value || !carRes.value?.data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Vehicle Not Found',
    message: 'The requested vehicle is either unavailable, drafted, or does not exist.',
    fatal: true,
  })
}

const car = computed<CarDetail>(() => carRes.value!.data)

const config = useRuntimeConfig()
const siteUrl = ((config.public.siteUrl as string) || 'https://hassanmotors.pk').replace(/\/$/, '')
const canonicalUrl = computed(() => `${siteUrl}/cars/${car.value.slug}`)

const displayDescription = computed(() => {
  const raw = car.value.description?.trim()
  return raw || buildFactualCarDescription(car.value, settings.value)
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(
        buildCarJsonLd(
          car.value,
          canonicalUrl.value,
          siteUrl,
          settings.value,
          displayDescription.value
        )
      ),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(
        buildBreadcrumbJsonLd(car.value.title, canonicalUrl.value, siteUrl)
      ),
    },
  ],
}))

// Dynamic SEO Metadata
useSeoMeta({
  title: () => `${car.value.title} | ${settings.value.showroom_name} ${settings.value.showroom_city}`,
  description: () => displayDescription.value,
  ogTitle: () => `${car.value.title} - ${car.value.price_formatted}`,
  ogDescription: () => `${car.value.title} (${car.value.status === 'sold' ? 'Sold' : car.value.price_formatted}) at ${settings.value.showroom_name}, ${settings.value.showroom_city}.`,
  ogUrl: () => canonicalUrl.value,
  ogType: 'website',
  ogImage: () => car.value.primary_image?.url || undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: () => `${car.value.title} - ${car.value.price_formatted}`,
  twitterDescription: () => `${car.value.status === 'sold' ? 'Sold' : car.value.price_formatted} · ${settings.value.showroom_name} ${settings.value.showroom_city}`,
  twitterImage: () => car.value.primary_image?.url || undefined,
})

// Fetch available vehicles for related inventory (prioritize available vehicles)
const { data: availableRes } = await getCars({ status: 'available', per_page: 6 })
const relatedCars = computed<CarListItem[]>(() => {
  return (availableRes.value?.data || [])
    .filter((c) => c.id !== car.value.id && c.status === 'available')
    .slice(0, 3)
})

// Inquiry Modal State
const inquiryModalOpen = ref(false)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
    <!-- Breadcrumb -->
    <nav aria-label="Breadcrumb" class="flex flex-wrap items-center text-xs text-neutral-500 gap-2">
      <NuxtLink to="/" class="hover:text-amber-400">Home</NuxtLink>
      <span>/</span>
      <NuxtLink to="/cars" class="hover:text-amber-400">Inventory</NuxtLink>
      <span>/</span>
      <span class="text-neutral-300 font-medium truncate max-w-xs sm:max-w-md">{{ car.title }}</span>
    </nav>

    <!-- Prominent Sold Vehicle Banner -->
    <div
      v-if="car.status === 'sold'"
      role="status"
      class="bg-rose-950/40 border border-rose-500/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
    >
      <div class="space-y-1.5">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
          Sold Vehicle Archive
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-white">
          This Vehicle Has Been Sold
        </h2>
        <p class="text-xs sm:text-sm text-neutral-300 max-w-2xl">
          This listing is kept for reference and is no longer available for purchase. Explore currently available vehicles in our showroom inventory.
        </p>
      </div>

      <div class="flex flex-wrap gap-3 flex-shrink-0">
        <NuxtLink
          v-if="car.brand?.name"
          :to="`/cars?brand=${encodeURIComponent(car.brand.name)}&status=available`"
          class="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-neutral-950 transition"
        >
          Available {{ car.brand.name }} Cars
        </NuxtLink>
        <NuxtLink
          to="/cars?status=available"
          class="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800 transition"
        >
          Browse Available Inventory
        </NuxtLink>
      </div>
    </div>

    <!-- Main Grid: Gallery & Specs (Col 1-2), Action Sidebar (Col 3) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
      <!-- Left Column: Gallery, Specs & Description -->
      <div class="lg:col-span-2 space-y-10">
        <!-- Vehicle Gallery -->
        <CarGallery :images="car.images || []" :car-title="car.title" />

        <!-- Key Highlights Grid -->
        <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 class="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Vehicle Overview & Specifications
          </h2>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
              <span class="block text-[10px] uppercase font-bold text-neutral-500">Model Year</span>
              <span class="text-base font-bold text-white mt-0.5 block">{{ car.year }}</span>
            </div>

            <div class="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
              <span class="block text-[10px] uppercase font-bold text-neutral-500">Mileage</span>
              <span class="text-base font-bold text-white mt-0.5 block">
                {{ car.mileage !== null && car.mileage !== undefined ? `${car.mileage.toLocaleString()} km` : 'Unspecified' }}
              </span>
            </div>

            <div class="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
              <span class="block text-[10px] uppercase font-bold text-neutral-500">Transmission</span>
              <span class="text-base font-bold text-white mt-0.5 block capitalize">{{ car.transmission }}</span>
            </div>

            <div class="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
              <span class="block text-[10px] uppercase font-bold text-neutral-500">Fuel Type</span>
              <span class="text-base font-bold text-white mt-0.5 block capitalize">{{ car.fuel_type }}</span>
            </div>

            <div class="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
              <span class="block text-[10px] uppercase font-bold text-neutral-500">Engine Capacity</span>
              <span class="text-base font-bold text-white mt-0.5 block">
                {{ car.engine_capacity ? `${car.engine_capacity} cc` : 'N/A' }}
              </span>
            </div>

            <div class="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
              <span class="block text-[10px] uppercase font-bold text-neutral-500">Exterior Color</span>
              <span class="text-base font-bold text-white mt-0.5 block capitalize">
                {{ car.exterior_color || 'Unspecified' }}
              </span>
            </div>

            <div class="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
              <span class="block text-[10px] uppercase font-bold text-neutral-500">Registration</span>
              <span class="text-base font-bold text-white mt-0.5 block capitalize">
                {{ car.registration_city || 'Unregistered' }}
              </span>
            </div>

            <div class="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
              <span class="block text-[10px] uppercase font-bold text-neutral-500">Assembly</span>
              <span class="text-base font-bold text-white mt-0.5 block capitalize">
                {{ car.assembly || 'Local' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Description Box (Explicit seller notes or factual DB summary) -->
        <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 class="text-lg font-bold text-white uppercase tracking-wider">
            Vehicle Summary & Notes
          </h2>
          <div class="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
            {{ displayDescription }}
          </div>
        </div>

        <!-- Showroom Viewing Notice -->
        <div class="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0 flex items-center justify-center text-2xl font-bold">
            ✓
          </div>
          <div class="space-y-1 text-center sm:text-left">
            <h3 class="text-base font-bold text-white">In-Person Viewing Welcome</h3>
            <p class="text-xs text-neutral-400 leading-relaxed">
              Visit {{ settings.showroom_name }} at {{ fullAddress }} to inspect the vehicle and review available records in person.
            </p>
          </div>
        </div>
      </div>

      <!-- Right Column: Sticky Pricing & Action Card -->
      <div class="lg:col-span-1 space-y-6 lg:sticky lg:top-28">
        <div class="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <!-- Title & Badges -->
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-amber-500">
                {{ car.brand?.name || 'Vehicle Listing' }}
              </span>
              <span
                v-if="car.status === 'available'"
                class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500 text-neutral-950"
              >
                Available
              </span>
              <span
                v-else
                class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-500/90 text-white"
              >
                Sold
              </span>
            </div>

            <h1 class="text-2xl font-black text-white tracking-tight leading-tight">
              {{ car.title }}
            </h1>
          </div>

          <!-- Price -->
          <div class="pt-4 border-t border-neutral-800">
            <span class="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {{ car.status === 'sold' ? 'Listed Price (PKR)' : 'Demand (PKR)' }}
            </span>
            <div class="text-3xl font-black text-white tracking-tight mt-0.5">
              {{ car.price_formatted }}
            </div>
            <p v-if="car.status === 'available'" class="text-[11px] text-neutral-400 mt-1">
              Available for showroom viewing and direct discussion
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3 pt-2">
            <button
              type="button"
              @click="inquiryModalOpen = true"
              class="w-full py-4 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
              <span>{{ car.status === 'sold' ? 'Ask About Similar Cars' : 'Inquire via WhatsApp' }}</span>
            </button>

            <a
              :href="phoneTel"
              class="w-full py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider bg-neutral-950 border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition flex items-center justify-center gap-2"
            >
              <span>Call Showroom: {{ settings.showroom_phone }}</span>
            </a>
          </div>

          <!-- Showroom Highlights -->
          <div class="pt-6 border-t border-neutral-800 space-y-3 text-xs text-neutral-400">
            <div class="flex items-center gap-2.5">
              <span class="text-amber-500 font-bold">✓</span>
              <span>Physical showroom viewing available</span>
            </div>
            <div class="flex items-center gap-2.5">
              <span class="text-amber-500 font-bold">✓</span>
              <span>Direct communication with showroom staff</span>
            </div>
            <div class="flex items-center gap-2.5">
              <span class="text-amber-500 font-bold">✓</span>
              <span>In-person inspection available during showroom hours</span>
            </div>
          </div>
        </div>

        <!-- Showroom Location Card -->
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 text-xs text-neutral-400 space-y-2">
          <div class="text-white font-bold flex items-center gap-2">
            <span class="text-amber-500">📍</span> {{ settings.showroom_name }}
          </div>
          <p>{{ fullAddress }}</p>
          <p class="text-neutral-500">{{ settings.opening_hours }}</p>
        </div>
      </div>
    </div>

    <!-- Related / Available Vehicles -->
    <div v-if="relatedCars.length > 0" class="pt-12 border-t border-neutral-800 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">
            {{ car.status === 'sold' ? 'Similar Available Vehicles' : `More From ${settings.showroom_name}` }}
          </h2>
          <p class="text-xs text-neutral-400">Explore other available cars currently in our showroom inventory.</p>
        </div>
        <NuxtLink to="/cars?status=available" class="text-xs font-bold uppercase text-amber-400 hover:text-amber-300">
          View All &rarr;
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <CarCard v-for="c in relatedCars" :key="c.id" :car="c" />
      </div>
    </div>

    <!-- Inquiry Modal -->
    <InquiryModal v-model="inquiryModalOpen" :car="car" />
  </div>
</template>
