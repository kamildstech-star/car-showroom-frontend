<script setup lang="ts">
const route = useRoute()
const mobileMenuOpen = ref(false)
const { settings, phoneTel, whatsappUrl } = useShowroom()

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Inventory', path: '/cars' },
  { name: 'About Showroom', path: '/about' },
  { name: 'Contact & Location', path: '/contact' },
]

// Close mobile menu on route change
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <header class="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-neutral-950 text-xl tracking-tighter shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            HM
          </div>
          <div>
            <div class="text-xl font-black tracking-wider text-white flex items-center gap-1.5">
              <span>HASSAN</span>
              <span class="text-amber-500">MOTORS</span>
            </div>
            <p class="text-[10px] tracking-widest uppercase text-neutral-400 font-medium">
              {{ settings.showroom_city }}, Pakistan
            </p>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="text-sm font-medium transition-colors hover:text-amber-400"
            :class="route.path === link.path ? 'text-amber-400 font-semibold' : 'text-neutral-300'"
          >
            {{ link.name }}
          </NuxtLink>
        </nav>

        <!-- Right Quick Actions -->
        <div class="hidden md:flex items-center space-x-4">
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-sm"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{{ settings.showroom_phone }}</span>
          </a>

          <NuxtLink
            to="/cars"
            class="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            Browse Cars
          </NuxtLink>
        </div>

        <!-- Mobile Hamburger Button -->
        <div class="flex md:hidden items-center space-x-2">
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold"
          >
            WhatsApp
          </a>
          <button
            type="button"
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Toggle navigation menu"
            :aria-expanded="mobileMenuOpen.toString()"
            aria-controls="mobile-nav-drawer"
          >
            <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <div
      v-if="mobileMenuOpen"
      id="mobile-nav-drawer"
      class="md:hidden border-b border-neutral-800 bg-neutral-950/95 px-4 pt-2 pb-6 space-y-3"
    >
      <NuxtLink
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        class="block px-3 py-2.5 rounded-lg text-base font-medium transition"
        :class="route.path === link.path ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-neutral-300 hover:bg-neutral-900'"
      >
        {{ link.name }}
      </NuxtLink>

      <div class="pt-4 border-t border-neutral-800 space-y-2">
        <a
          :href="phoneTel"
          class="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-200"
        >
          Call Showroom: {{ settings.showroom_phone }}
        </a>
        <a
          :href="whatsappUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  </header>
</template>
