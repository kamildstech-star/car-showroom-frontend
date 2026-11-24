<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

useSeoMeta({
  title: 'Dashboard Overview | Hassan Motors Admin',
})

const { getDashboardData, patchLeadStatus } = useAdmin()
const { user, changePassword, loading: authLoading } = useAuth()

const { data: dashboardRes, status, refresh } = await getDashboardData()

const metrics = computed(() => dashboardRes.value?.data?.metrics || {
  total_cars: 0,
  available_cars: 0,
  sold_cars: 0,
  draft_cars: 0,
  featured_cars: 0,
  total_leads: 0,
  new_leads: 0,
  contacted_leads: 0,
  converted_leads: 0,
})

const recentCars = computed(() => dashboardRes.value?.data?.recent_cars || [])
const recentLeads = computed(() => dashboardRes.value?.data?.recent_leads || [])

// Change Password Accordion State
const showPasswordModal = ref(false)
const passwordForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})
const passwordMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const passwordLoading = ref(false)

const handlePasswordChange = async () => {
  passwordMessage.value = null
  if (!passwordForm.current_password || !passwordForm.password) {
    passwordMessage.value = { type: 'error', text: 'All password fields are required.' }
    return
  }
  if (passwordForm.password !== passwordForm.password_confirmation) {
    passwordMessage.value = { type: 'error', text: 'New password confirmation does not match.' }
    return
  }

  passwordLoading.value = true
  try {
    const res = await changePassword({
      current_password: passwordForm.current_password,
      password: passwordForm.password,
      password_confirmation: passwordForm.password_confirmation,
    })
    passwordMessage.value = { type: 'success', text: res.message || 'Password updated successfully!' }
    passwordForm.current_password = ''
    passwordForm.password = ''
    passwordForm.password_confirmation = ''
    setTimeout(() => {
      showPasswordModal.value = false
      passwordMessage.value = null
    }, 2000)
  } catch (err: unknown) {
    const errorObj = err as { data?: { message?: string } }
    passwordMessage.value = { type: 'error', text: errorObj.data?.message || 'Failed to update password. Verify your current password.' }
  } finally {
    passwordLoading.value = false
  }
}

// Quick status change
const updatingLeadId = ref<number | null>(null)
const handleStatusChange = async (leadId: number, newStatus: string) => {
  updatingLeadId.value = leadId
  try {
    await patchLeadStatus(leadId, newStatus)
    refresh()
  } catch (err) {
    console.error('Failed to update lead status', err)
  } finally {
    updatingLeadId.value = null
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header with Quick Actions -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Showroom Operations Overview
        </h1>
        <p class="text-xs text-neutral-400 mt-1">
          Welcome back, <strong class="text-neutral-200">{{ user?.name || 'Administrator' }}</strong>. Here is the live status of Hassan Motors.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="showPasswordModal = true"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
        >
          Change Password
        </button>
        <NuxtLink
          to="/admin/cars/create"
          class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition shadow-md shadow-amber-500/20"
        >
          + Add Vehicle
        </NuxtLink>
      </div>
    </div>

    <!-- Metrics Cards Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      <div class="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-1">
        <div class="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Total Inventory</div>
        <div class="text-3xl font-black text-white">{{ metrics.total_cars }}</div>
        <div class="text-[11px] text-neutral-400">Cars registered in system</div>
      </div>

      <div class="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-1">
        <div class="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Available for Sale</div>
        <div class="text-3xl font-black text-emerald-400">{{ metrics.available_cars }}</div>
        <div class="text-[11px] text-neutral-400">Publicly visible & active</div>
      </div>

      <div class="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-1">
        <div class="text-[10px] uppercase font-bold text-amber-500 tracking-wider">New Inquiries</div>
        <div class="text-3xl font-black text-amber-500">{{ metrics.new_leads }}</div>
        <div class="text-[11px] text-neutral-400">Requires follow-up</div>
      </div>

      <div class="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 space-y-1">
        <div class="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Vehicles Sold</div>
        <div class="text-3xl font-black text-neutral-300">{{ metrics.sold_cars }}</div>
        <div class="text-[11px] text-neutral-400">Completed deals</div>
      </div>
    </div>

    <!-- Secondary Metrics Row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
      <div class="bg-neutral-950 border border-neutral-800/80 p-3.5 rounded-xl flex items-center justify-between">
        <span class="text-neutral-400">Featured Vehicles:</span>
        <span class="font-bold text-white">{{ metrics.featured_cars }}</span>
      </div>
      <div class="bg-neutral-950 border border-neutral-800/80 p-3.5 rounded-xl flex items-center justify-between">
        <span class="text-neutral-400">Draft Vehicles:</span>
        <span class="font-bold text-white">{{ metrics.draft_cars }}</span>
      </div>
      <div class="bg-neutral-950 border border-neutral-800/80 p-3.5 rounded-xl flex items-center justify-between">
        <span class="text-neutral-400">Contacted Inquiries:</span>
        <span class="font-bold text-white">{{ metrics.contacted_leads }}</span>
      </div>
      <div class="bg-neutral-950 border border-neutral-800/80 p-3.5 rounded-xl flex items-center justify-between">
        <span class="text-neutral-400">Converted Leads:</span>
        <span class="font-bold text-emerald-400">{{ metrics.converted_leads }}</span>
      </div>
    </div>

    <!-- Two-Column Tables Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <!-- Recent Customer Inquiries -->
      <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 class="text-base font-bold text-white">Recent Customer Inquiries</h2>
            <p class="text-[11px] text-neutral-400">Latest leads submitted through website</p>
          </div>
          <NuxtLink to="/admin/leads" class="text-xs font-bold text-amber-500 hover:text-amber-400">
            View All CRM &rarr;
          </NuxtLink>
        </div>

        <div v-if="recentLeads.length > 0" class="divide-y divide-neutral-800/60">
          <div v-for="lead in recentLeads" :key="lead.id" class="py-3.5 flex items-center justify-between gap-3 text-xs">
            <div class="min-w-0">
              <div class="font-bold text-white flex items-center gap-2">
                <span>{{ lead.customer_name }}</span>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  :class="{
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20': lead.status === 'new',
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20': lead.status === 'contacted',
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': lead.status === 'converted',
                    'bg-neutral-800 text-neutral-400': lead.status === 'lost',
                  }"
                >
                  {{ lead.status }}
                </span>
              </div>
              <p class="text-[11px] text-neutral-400 truncate mt-0.5">
                {{ lead.car?.title || 'General Showroom Inquiry' }} &middot; {{ lead.phone }}
              </p>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <a
                :href="`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`"
                target="_blank"
                class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[11px] font-semibold"
              >
                WhatsApp
              </a>
              <NuxtLink
                :to="`/admin/leads/${lead.id}`"
                class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                &rarr;
              </NuxtLink>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-neutral-500 text-xs">
          No customer inquiries recorded yet.
        </div>
      </div>

      <!-- Recent Inventory Additions -->
      <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 class="text-base font-bold text-white">Recent Vehicle Additions</h2>
            <p class="text-[11px] text-neutral-400">Latest cars listed on the showroom floor</p>
          </div>
          <NuxtLink to="/admin/cars" class="text-xs font-bold text-amber-500 hover:text-amber-400">
            Manage All ({{ metrics.total_cars }}) &rarr;
          </NuxtLink>
        </div>

        <div v-if="recentCars.length > 0" class="divide-y divide-neutral-800/60">
          <div v-for="car in recentCars" :key="car.id" class="py-3.5 flex items-center justify-between gap-3 text-xs">
            <div class="flex items-center space-x-3 min-w-0">
              <div class="w-12 h-9 rounded-lg bg-neutral-950 overflow-hidden flex-shrink-0 border border-neutral-800">
                <img
                  v-if="car.primary_image?.thumbnail_url || car.primary_image?.url"
                  :src="car.primary_image?.thumbnail_url || car.primary_image?.url || ''"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-[10px] text-neutral-600 font-bold">
                  HM
                </div>
              </div>
              <div class="min-w-0">
                <div class="font-bold text-white truncate">{{ car.title }}</div>
                <div class="text-[11px] text-neutral-400 mt-0.5">
                  {{ car.price_formatted }} &middot;
                  <span :class="car.status === 'available' ? 'text-emerald-400 font-semibold' : 'text-neutral-500'">
                    {{ car.status }}
                  </span>
                </div>
              </div>
            </div>

            <NuxtLink
              :to="`/admin/cars/${car.id}`"
              class="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 text-xs font-semibold transition"
            >
              Edit &rarr;
            </NuxtLink>
          </div>
        </div>

        <div v-else class="text-center py-8 text-neutral-500 text-xs">
          No vehicles added yet. Click "+ Add Vehicle" to list your first car.
        </div>
      </div>
    </div>

    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm" @click="showPasswordModal = false"></div>
      <div class="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl z-10 space-y-5">
        <div class="flex items-center justify-between pb-3 border-b border-neutral-800">
          <h3 class="text-base font-bold text-white">Change Admin Password</h3>
          <button @click="showPasswordModal = false" class="text-neutral-400 hover:text-white">&times;</button>
        </div>

        <div v-if="passwordMessage" class="p-3 rounded-xl text-xs" :class="passwordMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'">
          {{ passwordMessage.text }}
        </div>

        <form @submit.prevent="handlePasswordChange" class="space-y-4 text-xs">
          <div>
            <label class="block text-neutral-300 font-semibold mb-1">Current Password</label>
            <input
              v-model="passwordForm.current_password"
              type="password"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label class="block text-neutral-300 font-semibold mb-1">New Password</label>
            <input
              v-model="passwordForm.password"
              type="password"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label class="block text-neutral-300 font-semibold mb-1">Confirm New Password</label>
            <input
              v-model="passwordForm.password_confirmation"
              type="password"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button
              type="button"
              @click="showPasswordModal = false"
              class="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="passwordLoading"
              class="px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400"
            >
              {{ passwordLoading ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
