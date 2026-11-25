<script setup lang="ts">
import type { CarListItem } from '~/types/car'

const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string) || 'https://hassanmotors.pk'

useHead({
  link: [
    { rel: 'canonical', href: `${siteUrl}/` },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'AutoDealer',
        name: 'Hassan Motors',
        image: `${siteUrl}/images/showroom.jpg`,
        telephone: '+923041142642',
        url: siteUrl,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Main West Canal Road',
          addressLocality: 'Faisalabad',
          addressRegion: 'Punjab',
          postalCode: '38000',
          addressCountry: 'PK',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '31.4504',
          longitude: '73.1350',
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '10:00',
            closes: '20:00',
          },
        ],
        priceRange: 'PKR 1,000,000 - 50,000,000',
      }),
    },
  ],
})

useSeoMeta({
  title: 'Hassan Motors | Premium & Verified Car Showroom in Faisalabad',
  description: 'Discover certified luxury cars, sedans, and SUVs in Faisalabad, Pakistan. Verified documentation, transparent pricing, and instant WhatsApp support at Hassan Motors.',
  ogTitle: 'Hassan Motors Faisalabad - Luxury & Verified Car Showroom',
  ogDescription: 'Non-accidental certified vehicles, transparent pricing, and instant WhatsApp inquiries.',
  ogUrl: `${siteUrl}/`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

const { getFeaturedCars, getLatestCars, getBrands } = useCars()
const router = useRouter()

// SSR fetch for data
const { data: featuredRes } = await getFeaturedCars()
const { data: latestRes } = await getLatestCars()
const { data: brandsRes } = await getBrands()

const featuredCars = computed<CarListItem[]>(() => featuredRes.value?.data || [])
const latestCars = computed<CarListItem[]>(() => latestRes.value?.data || [])
const brands = computed(() => brandsRes.value?.data || [])

// Quick Search State
const searchForm = reactive({
  brand: '',
  price_max: '',
  search: '',
})

const handleQuickSearch = () => {
  const query: Record<string, string> = {}
  if (searchForm.brand) query.brand = searchForm.brand
  if (searchForm.price_max) query.price_max = searchForm.price_max
  if (searchForm.search) query.search = searchForm.search

  router.push({ path: '/cars', query })
}
</script>

<template>
  <div class="space-y-20 pb-20">
    <!-- Hero Section -->
    <section class="relative pt-12 pb-24 overflow-hidden border-b border-neutral-800/80">
      <!-- Glow background gradient -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-3xl mx-auto text-center space-y-6">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            Faisalabad's Premier Vehicle Showroom
          </div>

          <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Elevate Your Drive With <span class="text-amber-500">Verified Luxury</span> & Family Cars
          </h1>

          <p class="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Every vehicle at Hassan Motors is thoroughly inspected, document-cleared, and presented with genuine mileage. Transparent deals on Main West Canal Road, Faisalabad.
          </p>

          <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
            <NuxtLink
              to="/cars"
              class="px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/25"
            >
              Browse Inventory &rarr;
            </NuxtLink>

            <a
              href="https://wa.me/923041142642"
              target="_blank"
              rel="noopener noreferrer"
              class="px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-neutral-900 border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition-all flex items-center gap-2"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              WhatsApp Showroom
            </a>
          </div>
        </div>

        <!-- Quick Filter Card -->
        <div class="mt-14 max-w-4xl mx-auto bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur">
          <div class="text-xs font-bold uppercase tracking-wider text-amber-500 mb-4 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Quick Inventory Search
          </div>

          <form @submit.prevent="handleQuickSearch" class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label class="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Brand
              </label>
              <select
                v-model="searchForm.brand"
                class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">All Brands</option>
                <option v-for="b in brands" :key="b.id" :value="b.name">
                  {{ b.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Max Budget (PKR)
              </label>
              <select
                v-model="searchForm.price_max"
                class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Any Budget</option>
                <option value="3000000">Up to 3 Million</option>
                <option value="5000000">Up to 5 Million</option>
                <option value="8000000">Up to 8 Million</option>
                <option value="12000000">Up to 12 Million</option>
                <option value="25000000">Up to 25 Million</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Keyword / Model
              </label>
              <input
                v-model="searchForm.search"
                type="text"
                placeholder="e.g. Corolla, Civic"
                class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div class="flex items-end">
              <button
                type="submit"
                class="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
              >
                Find Cars
              </button>
            </div>
          </form>
        </div>

        <!-- Trust Metrics -->
        <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div class="p-4 bg-neutral-900/40 rounded-2xl border border-neutral-800/60">
            <div class="text-2xl sm:text-3xl font-black text-white">100%</div>
            <div class="text-xs text-neutral-400 mt-1 uppercase font-semibold">Document Verified</div>
          </div>
          <div class="p-4 bg-neutral-900/40 rounded-2xl border border-neutral-800/60">
            <div class="text-2xl sm:text-3xl font-black text-amber-500">Non-Accidental</div>
            <div class="text-xs text-neutral-400 mt-1 uppercase font-semibold">Physical Inspection</div>
          </div>
          <div class="p-4 bg-neutral-900/40 rounded-2xl border border-neutral-800/60">
            <div class="text-2xl sm:text-3xl font-black text-white">+92 304 1142642</div>
            <div class="text-xs text-neutral-400 mt-1 uppercase font-semibold">Instant WhatsApp</div>
          </div>
          <div class="p-4 bg-neutral-900/40 rounded-2xl border border-neutral-800/60">
            <div class="text-2xl sm:text-3xl font-black text-white">West Canal Rd</div>
            <div class="text-xs text-neutral-400 mt-1 uppercase font-semibold">Faisalabad Location</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Vehicles Section -->
    <section v-if="featuredCars.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
        <div>
          <div class="text-xs uppercase font-bold text-amber-500 tracking-wider">
            Curated Selection
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Featured Showroom Cars
          </h2>
          <p class="text-xs text-neutral-400 mt-1">
            Handpicked premium cars available for physical inspection and immediate transfer.
          </p>
        </div>

        <NuxtLink
          to="/cars"
          class="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5"
        >
          <span>View All Inventory</span>
          <span>&rarr;</span>
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <CarCard v-for="car in featuredCars" :key="car.id" :car="car" />
      </div>
    </section>

    <!-- Latest Arrivals Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
        <div>
          <div class="text-xs uppercase font-bold text-amber-500 tracking-wider">
            Fresh Inventory
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Latest Arrivals in Faisalabad
          </h2>
          <p class="text-xs text-neutral-400 mt-1">
            Recently acquired verified vehicles ready for test drive on Canal Road.
          </p>
        </div>

        <NuxtLink
          to="/cars"
          class="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5"
        >
          <span>Browse All ({{ latestCars.length }}+)</span>
          <span>&rarr;</span>
        </NuxtLink>
      </div>

      <div v-if="latestCars.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <CarCard v-for="car in latestCars" :key="car.id" :car="car" />
      </div>

      <div v-else class="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800 p-8">
        <p class="text-sm text-neutral-400">Loading showroom inventory...</p>
      </div>
    </section>

    <!-- Why Choose Hassan Motors -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-8 sm:p-12">
        <div class="max-w-2xl mb-10">
          <div class="text-xs uppercase font-bold text-amber-500 tracking-wider">
            Why Faisalabad Trusts Us
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            The Hassan Motors Standard
          </h2>
          <p class="text-xs text-neutral-400 mt-2 leading-relaxed">
            Buying a pre-owned car should be exciting and secure. We eliminate uncertainty with our strict quality gates and transparent deal structuring.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 class="text-base font-bold text-white">Genuine Mileage & Clear History</h3>
            <p class="text-xs text-neutral-400 leading-relaxed">
              We reject meter-reversed or structurally compromised cars. What you see is genuine, verified, and documented.
            </p>
          </div>

          <div class="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 class="text-base font-bold text-white">100% Biometric & File Verification</h3>
            <p class="text-xs text-neutral-400 leading-relaxed">
              Complete verification with Punjab Excise, original return files, smart cards, and on-spot biometric facilitation.
            </p>
          </div>

          <div class="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 class="text-base font-bold text-white">Fair Pricing & Exchange Options</h3>
            <p class="text-xs text-neutral-400 leading-relaxed">
              Competitive market demands with zero hidden costs. Trade in your existing vehicle with honest evaluation.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Showroom Visit Callout Banner -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="relative bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-3xl p-8 sm:p-12 text-neutral-950 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div class="max-w-xl space-y-2">
          <span class="text-xs font-black uppercase tracking-widest text-neutral-950/80">Visit Our Showroom Today</span>
          <h2 class="text-3xl font-black tracking-tight text-neutral-950 leading-tight">
            Ready for a Test Drive in Faisalabad?
          </h2>
          <p class="text-xs sm:text-sm font-medium text-neutral-950/85">
            Visit our physical dealership on Main West Canal Road, Faisalabad or initiate an inquiry on WhatsApp for rapid response.
          </p>
        </div>

        <div class="flex flex-wrap gap-4">
          <a
            href="https://wa.me/923041142642"
            target="_blank"
            rel="noopener noreferrer"
            class="px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-neutral-950 text-white hover:bg-neutral-900 transition shadow-lg"
          >
            Chat with Hassan Motors
          </a>
          <NuxtLink
            to="/contact"
            class="px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/20 text-neutral-950 hover:bg-white/30 border border-neutral-950/20 transition"
          >
            Showroom Directions &rarr;
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
