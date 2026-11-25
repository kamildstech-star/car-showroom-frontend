<script setup lang="ts">
const { settings, phoneTel, whatsappUrl, fullAddress } = useShowroom()
</script>

<template>
  <footer class="bg-neutral-950 border-t border-neutral-800 text-neutral-400">
    <!-- Top Footer -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <!-- Col 1: About Showroom -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-neutral-950 text-sm">
              HM
            </div>
            <span class="text-lg font-black tracking-wider text-white uppercase">
              {{ settings.showroom_name }}
            </span>
          </div>
          <p class="text-xs leading-relaxed text-neutral-400">
            {{ settings.showroom_city }}'s trusted automotive dealership offering non-accidental luxury cars, verified family sedans, and transparent transactions with complete documentation.
          </p>
          <div class="text-xs space-y-1 text-neutral-400">
            <p><strong class="text-neutral-300">Showroom:</strong> {{ fullAddress }}</p>
            <p><strong class="text-neutral-300">Timings:</strong> {{ settings.opening_hours }}</p>
          </div>
        </div>

        <!-- Col 2: Navigation Links -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Quick Navigation
          </h4>
          <ul class="space-y-2.5 text-xs">
            <li>
              <NuxtLink to="/" class="hover:text-amber-400 transition-colors">Home</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cars" class="hover:text-amber-400 transition-colors">Complete Inventory</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cars?status=available" class="hover:text-amber-400 transition-colors">Available Vehicles</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/about" class="hover:text-amber-400 transition-colors">About Hassan Motors</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="hover:text-amber-400 transition-colors">Contact Showroom</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 3: Popular Brands -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Popular Brands
          </h4>
          <ul class="space-y-2.5 text-xs">
            <li>
              <NuxtLink to="/cars?brand=Toyota" class="hover:text-amber-400 transition-colors">Toyota Pakistan</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cars?brand=Honda" class="hover:text-amber-400 transition-colors">Honda Atlas</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cars?brand=Suzuki" class="hover:text-amber-400 transition-colors">Pak Suzuki</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cars?brand=Hyundai" class="hover:text-amber-400 transition-colors">Hyundai Nishat</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cars?brand=KIA" class="hover:text-amber-400 transition-colors">KIA Motors</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 4: Contact & WhatsApp -->
        <div class="space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Direct Inquiries
          </h4>
          <p class="text-xs text-neutral-400">
            Speak directly with our showroom team for instant vehicle pricing, exchange deals, or physical inspection appointments.
          </p>
          <div class="space-y-2">
            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/40"
            >
              WhatsApp: {{ settings.showroom_phone }}
            </a>
            <a
              :href="phoneTel"
              class="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 transition"
            >
              Call: {{ settings.showroom_phone }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Copyright & Admin Link -->
    <div class="border-t border-neutral-900 bg-neutral-950 py-6 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-3">
        <p>
          &copy; {{ new Date().getFullYear() }} {{ settings.showroom_name }}. All rights reserved. {{ settings.showroom_city }}, Pakistan.
        </p>
        <div class="flex items-center space-x-4">
          <span class="inline-flex items-center gap-1.5 text-neutral-500">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Showroom
          </span>
          <NuxtLink
            to="/admin/login"
            class="text-neutral-500 hover:text-neutral-300 transition-colors text-[11px]"
          >
            Admin Portal
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
