<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { user, logout, loading } = useAuth()

const mobileOpen = ref(false)

const navItems = [
  { name: 'Dashboard Overview', path: '/admin', icon: '📊' },
  { name: 'Vehicles & Inventory', path: '/admin/cars', icon: '🚗' },
  { name: 'Add New Vehicle', path: '/admin/cars/create', icon: '➕' },
  { name: 'Customer Inquiries', path: '/admin/leads', icon: '💬' },
  { name: 'Showroom Settings', path: '/admin/settings', icon: '⚙️' },
]

const handleLogout = async () => {
  await logout()
  router.push('/admin/login')
}

// Close drawer on route change
watch(() => route.path, () => {
  mobileOpen.value = false
})
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col md:flex-row antialiased">
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex flex-col w-64 bg-neutral-900 border-r border-neutral-800 p-6 justify-between flex-shrink-0">
      <div class="space-y-8">
        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-neutral-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
            HM
          </div>
          <div>
            <div class="text-sm font-black tracking-wider text-white">HASSAN MOTORS</div>
            <div class="text-[10px] tracking-widest uppercase text-amber-500 font-bold">Admin Portal</div>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1.5">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition"
            :class="route.path === item.path ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'"
          >
            <span>{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Bottom Profile & Logout -->
      <div class="pt-6 border-t border-neutral-800 space-y-3">
        <div class="px-2">
          <span class="block text-[10px] uppercase font-bold text-neutral-500">Authenticated Admin</span>
          <span class="text-xs font-medium text-neutral-300 truncate block mt-0.5">
            {{ user?.email || 'admin@hassanmotors.pk' }}
          </span>
        </div>

        <div class="space-y-1 pt-1">
          <NuxtLink
            to="/"
            target="_blank"
            class="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <span>View Public Website</span>
            <span class="text-[10px]">&rarr;</span>
          </NuxtLink>

          <button
            type="button"
            :disabled="loading"
            @click="handleLogout"
            class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition"
          >
            <span>Sign Out</span>
            <span class="text-[10px]">&rarr;</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header class="md:hidden flex items-center justify-between bg-neutral-900 border-b border-neutral-800 px-4 py-3 sticky top-0 z-40">
      <div class="flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-black text-sm">
          HM
        </div>
        <span class="text-xs font-black text-white tracking-wider">HM ADMIN</span>
      </div>

      <button
        type="button"
        @click="mobileOpen = !mobileOpen"
        class="p-2 text-neutral-400 hover:text-white"
        aria-label="Toggle admin navigation"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>

    <!-- Mobile Drawer -->
    <div v-if="mobileOpen" class="md:hidden fixed inset-0 z-50 flex">
      <div class="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm" @click="mobileOpen = false"></div>
      <div class="relative w-64 max-w-xs bg-neutral-900 border-r border-neutral-800 h-full p-6 flex flex-col justify-between">
        <div class="space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
            <span class="text-xs font-black tracking-wider text-white">HM ADMIN</span>
            <button @click="mobileOpen = false" class="text-neutral-400 text-lg">&times;</button>
          </div>

          <nav class="space-y-1.5">
            <NuxtLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition"
              :class="route.path === item.path ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:bg-neutral-800'"
            >
              <span>{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </NuxtLink>
          </nav>
        </div>

        <div class="pt-4 border-t border-neutral-800 space-y-2">
          <NuxtLink to="/" target="_blank" class="block text-xs text-neutral-400 py-1.5">
            View Public Website &rarr;
          </NuxtLink>
          <button @click="handleLogout" class="block w-full text-left text-xs text-rose-400 py-1.5 font-semibold">
            Sign Out &rarr;
          </button>
        </div>
      </div>
    </div>

    <!-- Main Admin Workspace -->
    <main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <div class="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
        <slot />
      </div>
    </main>
  </div>
</template>
