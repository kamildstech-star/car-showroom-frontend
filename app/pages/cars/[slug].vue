<script setup lang="ts">
import type { CarDetail, CarListItem } from '~/types/car'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { getCarBySlug, getLatestCars } = useCars()

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
const siteUrl = (config.public.siteUrl as string) || 'https://hassanmotors.pk'
const canonicalUrl = computed(() => `${siteUrl}/cars/${car.value.slug}`)

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Car',
        name: car.value.title,
        brand: {
          '@type': 'Brand',
          name: car.value.brand?.name || 'Verified',
        },
        model: car.value.model,
        vehicleModelDate: car.value.year,
        mileageFromOdometer: car.value.mileage ? {
          '@type': 'QuantitativeValue',
          value: car.value.mileage,
          unitCode: 'KMT',
        } : undefined,
        vehicleTransmission: car.value.transmission,
        fuelType: car.value.fuel_type,
        color: car.value.exterior_color || undefined,
        image: car.value.primary_image?.url || undefined,
        offers: {
          '@type': 'Offer',
          price: car.value.price,
          priceCurrency: 'PKR',
          availability: car.value.status === 'available'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/SoldOut',
          url: canonicalUrl.value,
          seller: {
            '@type': 'AutoDealer',
            name: 'Hassan Motors',
            telephone: '+923041142642',
          },
        },
      }),
    },
  ],
})

// Dynamic SEO Metadata
useSeoMeta({
  title: `${car.value.title} | Hassan Motors Faisalabad`,
  description: car.value.description || `Explore ${car.value.title} available for sale at Hassan Motors Faisalabad. Verified documentation, genuine mileage, and physical inspection on West Canal Road.`,
  ogTitle: `${car.value.title} - PKR ${car.value.price_formatted}`,
  ogDescription: `Verified pre-owned ${car.value.title}. Demand: ${car.value.price_formatted}. Located at Hassan Motors, Faisalabad.`,
  ogUrl: canonicalUrl.value,
  ogType: 'website',
  ogImage: car.value.primary_image?.url || undefined,
  twitterCard: 'summary_large_image',
  twitterTitle: `${car.value.title} - PKR ${car.value.price_formatted}`,
  twitterDescription: `Demand: ${car.value.price_formatted} &middot; Genuine mileage, verified file. Hassan Motors Faisalabad.`,
  twitterImage: car.value.primary_image?.url || undefined,
})

// Fetch recommended/latest vehicles
const { data: latestRes } = await getLatestCars()
const relatedCars = computed<CarListItem[]>(() => {
  return (latestRes.value?.data || []).filter(c => c.id !== car.value.id).slice(0, 3)
})

// Inquiry Modal State
const inquiryModalOpen = ref(false)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
    <!-- Breadcrumb -->
    <nav class="flex flex-wrap items-center text-xs text-neutral-500 gap-2">
      <NuxtLink to="/" class="hover:text-amber-400">Home</NuxtLink>
      <span>/</span>
      <NuxtLink to="/cars" class="hover:text-amber-400">Inventory</NuxtLink>
      <span>/</span>
      <span class="text-neutral-300 font-medium truncate max-w-xs sm:max-w-md">{{ car.title }}</span>
    </nav>

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
                {{ car.mileage ? `${car.mileage.toLocaleString()} km` : 'Unspecified' }}
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

        <!-- Description Box -->
        <div v-if="car.description" class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 class="text-lg font-bold text-white uppercase tracking-wider">
            Seller & Vehicle Notes
          </h2>
          <div class="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
            {{ car.description }}
          </div>
        </div>

        <!-- Inspection Assurance -->
        <div class="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0 flex items-center justify-center text-2xl font-bold">
            ✓
          </div>
          <div class="space-y-1 text-center sm:text-left">
            <h3 class="text-base font-bold text-white">Physical Inspection Welcome</h3>
            <p class="text-xs text-neutral-400 leading-relaxed">
              Bring your trusted mechanic or third-party car inspection service to our showroom on Main West Canal Road, Faisalabad. We stand behind our transparency.
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
                {{ car.brand?.name || 'Verified Vehicle' }}
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
            <span class="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">Demand (PKR)</span>
            <div class="text-3xl font-black text-white tracking-tight mt-0.5">
              {{ car.price_formatted }}
            </div>
            <p class="text-[11px] text-neutral-400 mt-1">
              Negotiable on physical table meeting &middot; Cash / Pay Order
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
              <span>Inquire via WhatsApp</span>
            </button>

            <a
              href="tel:+923041142642"
              class="w-full py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider bg-neutral-950 border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition flex items-center justify-center gap-2"
            >
              <span>Call Showroom: +92 304 1142642</span>
            </a>
          </div>

          <!-- Showroom Assurances -->
          <div class="pt-6 border-t border-neutral-800 space-y-3 text-xs text-neutral-400">
            <div class="flex items-center gap-2.5">
              <span class="text-amber-500 font-bold">✓</span>
              <span>Original file & biometric ready for transfer</span>
            </div>
            <div class="flex items-center gap-2.5">
              <span class="text-amber-500 font-bold">✓</span>
              <span>Non-accidental certified chassis & seals</span>
            </div>
            <div class="flex items-center gap-2.5">
              <span class="text-amber-500 font-bold">✓</span>
              <span>Exchange option with market adjustment</span>
            </div>
          </div>
        </div>

        <!-- Showroom Location Card -->
        <div class="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 text-xs text-neutral-400 space-y-2">
          <div class="text-white font-bold flex items-center gap-2">
            <span class="text-amber-500">📍</span> Hassan Motors Faisalabad
          </div>
          <p>Main West Canal Road, Faisalabad, Punjab, Pakistan</p>
          <p class="text-neutral-500">Open Monday &ndash; Saturday: 10:00 AM &ndash; 08:00 PM</p>
        </div>
      </div>
    </div>

    <!-- Related / Recommended Vehicles -->
    <div v-if="relatedCars.length > 0" class="pt-12 border-t border-neutral-800 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">More From Hassan Motors</h2>
          <p class="text-xs text-neutral-400">Explore other verified cars currently on our showroom floor.</p>
        </div>
        <NuxtLink to="/cars" class="text-xs font-bold uppercase text-amber-400 hover:text-amber-300">
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
