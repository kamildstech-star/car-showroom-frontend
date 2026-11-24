<script setup lang="ts">
const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string) || 'https://hassanmotors.pk'

useHead({
  link: [
    { rel: 'canonical', href: `${siteUrl}/about` },
  ],
})

useSeoMeta({
  title: 'About Hassan Motors | Faisalabad’s Premier Car Dealership',
  description: 'Learn about Hassan Motors in Faisalabad. Established on principles of integrity, verified documentation, and luxury automotive standards on Main West Canal Road.',
  ogTitle: 'About Hassan Motors Faisalabad',
  ogDescription: 'Trusted car dealership in Faisalabad, Pakistan. Non-accidental guarantee, 100% verified files.',
  ogUrl: `${siteUrl}/about`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
    <!-- Hero / Headline -->
    <div class="max-w-3xl space-y-4">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
        About Our Showroom
      </div>
      <h1 class="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
        Faisalabad's Destination for <span class="text-amber-500">Verified Automotive</span> Excellence
      </h1>
      <p class="text-base text-neutral-400 leading-relaxed">
        Located on Main West Canal Road in Faisalabad, Hassan Motors was founded with a singular commitment: to provide car buyers with 100% transparency, verified documentation, and guaranteed non-accidental vehicles.
      </p>
    </div>

    <!-- 3 Pillars Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xl font-bold">
          🛡️
        </div>
        <h3 class="text-lg font-bold text-white">Non-Accidental Guarantee</h3>
        <p class="text-xs text-neutral-400 leading-relaxed">
          Every vehicle undergoes rigorous structural examination. We ensure all original factory seals, pillars, aprons, and chassis remain strictly intact with zero hidden accident history.
        </p>
      </div>

      <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xl font-bold">
          📄
        </div>
        <h3 class="text-lg font-bold text-white">Complete Document Integrity</h3>
        <p class="text-xs text-neutral-400 leading-relaxed">
          We deal strictly in vehicles with verifiable ownership. Original return files, Punjab or Islamabad excise smart cards, biometric availability, and token tax clearances are fully inspected.
        </p>
      </div>

      <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xl font-bold">
          🤝
        </div>
        <h3 class="text-lg font-bold text-white">Honest Deal Structuring</h3>
        <p class="text-xs text-neutral-400 leading-relaxed">
          No broker gimmicks or hidden charges. Whether purchasing for your family or executing an upgrade through car exchange, our team delivers straight talk and fair market pricing.
        </p>
      </div>
    </div>

    <!-- Showroom Information Details -->
    <div class="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      <div class="space-y-6">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-amber-500">Showroom Presence</span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Visit Us on Main West Canal Road
          </h2>
          <p class="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
            Our central location on West Canal Road makes it convenient for families and enthusiasts across Faisalabad, Chiniot, Jhang, and surrounding regions to visit, inspect, and test drive.
          </p>
        </div>

        <div class="space-y-3 text-xs text-neutral-300">
          <p><strong class="text-white">Physical Address:</strong> Main West Canal Road, Faisalabad, Punjab, Pakistan</p>
          <p><strong class="text-white">Showroom Timings:</strong> Monday – Saturday: 10:00 AM – 08:00 PM (Sunday Closed)</p>
          <p><strong class="text-white">Official WhatsApp / Call:</strong> +92 304 1142642</p>
          <p><strong class="text-white">Official Email:</strong> info@hassanmotors.pk</p>
        </div>

        <div class="pt-2 flex flex-wrap gap-4">
          <a
            href="https://wa.me/923041142642"
            target="_blank"
            rel="noopener noreferrer"
            class="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950/40"
          >
            Chat with Owner on WhatsApp
          </a>
          <NuxtLink
            to="/cars"
            class="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-neutral-950 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 transition"
          >
            Browse Available Inventory &rarr;
          </NuxtLink>
        </div>
      </div>

      <div class="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h4 class="text-sm font-bold uppercase tracking-wider text-white">Our Buying & Exchange Promise</h4>
        <ul class="space-y-3 text-xs text-neutral-400">
          <li class="flex items-start gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span>Comprehensive on-spot computer and scanner diagnostics allowed.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span>Instant vehicle documentation transfer facilitation.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span>Accurate, genuine odometer readings recorded on purchase agreements.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-400 font-bold">✓</span>
            <span>Transparent vehicle exchange with same-day settlement.</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
