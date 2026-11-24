<script setup lang="ts">
import type { AdminLead } from '~/types/admin'

definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

useSeoMeta({
  title: 'Customer Inquiries & Leads | Hassan Motors Admin',
})

const { getAdminLeads, patchLeadStatus } = useAdmin()
const route = useRoute()

const search = ref((route.query.search as string) || '')
const statusFilter = ref((route.query.status as string) || '')
const currentPage = ref(Number(route.query.page) || 1)

const queryParams = computed(() => {
  const p: Record<string, unknown> = { page: currentPage.value, per_page: 15 }
  if (search.value) p.search = search.value
  if (statusFilter.value) p.status = statusFilter.value
  return p
})

const { data: leadsRes, refresh } = await getAdminLeads(queryParams.value)

const leads = computed<AdminLead[]>(() => leadsRes.value?.data || [])
const meta = computed(() => leadsRes.value?.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 })

// Inline status update
const updatingId = ref<number | null>(null)
const handleStatusUpdate = async (leadId: number, newStatus: string) => {
  updatingId.value = leadId
  try {
    await patchLeadStatus(leadId, newStatus)
    refresh()
  } catch (err) {
    console.error('Failed to update status', err)
  } finally {
    updatingId.value = null
  }
}

const applyFilters = () => {
  currentPage.value = 1
  refresh()
}

const resetFilters = () => {
  search.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  refresh()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
      <div>
        <h1 class="text-2xl font-black text-white tracking-tight">Customer Inquiries & Leads CRM</h1>
        <p class="text-xs text-neutral-400 mt-1">
          Review inbound customer inquiries, audit WhatsApp engagements, and record follow-up notes.
        </p>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center gap-3 text-xs">
      <div class="flex-1 min-w-[200px]">
        <input
          v-model="search"
          type="text"
          placeholder="Search by customer name or phone..."
          class="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          @keydown.enter="applyFilters"
        />
      </div>

      <select
        v-model="statusFilter"
        class="px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
        @change="applyFilters"
      >
        <option value="">All Inquiry Statuses</option>
        <option value="new">New (Needs Follow-up)</option>
        <option value="contacted">Contacted</option>
        <option value="converted">Converted (Deal Closed)</option>
        <option value="lost">Lost</option>
      </select>

      <button
        type="button"
        @click="applyFilters"
        class="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition"
      >
        Filter
      </button>

      <button
        type="button"
        @click="resetFilters"
        class="px-3 py-2 text-neutral-400 hover:text-white transition"
      >
        Reset
      </button>
    </div>

    <!-- Leads CRM Table -->
    <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-neutral-300">
          <thead class="bg-neutral-950 border-b border-neutral-800 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            <tr>
              <th class="py-3.5 px-4">Customer Details</th>
              <th class="py-3.5 px-4">Inquired Vehicle</th>
              <th class="py-3.5 px-4">Lead Status</th>
              <th class="py-3.5 px-4">Engagement Audit</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-neutral-800/60">
            <tr v-for="lead in leads" :key="lead.id" class="hover:bg-neutral-800/40 transition">
              <!-- Customer -->
              <td class="py-3.5 px-4">
                <NuxtLink :to="`/admin/leads/${lead.id}`" class="font-bold text-white hover:text-amber-400 block">
                  {{ lead.customer_name }}
                </NuxtLink>
                <div class="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                  <span>{{ lead.phone }}</span>
                  <a
                    :href="`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`"
                    target="_blank"
                    class="text-emerald-400 hover:underline"
                    title="Open WhatsApp chat directly"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </td>

              <!-- Vehicle -->
              <td class="py-3.5 px-4">
                <div v-if="lead.car" class="font-semibold text-neutral-200">
                  <NuxtLink :to="`/admin/cars/${lead.car.id}`" class="hover:text-amber-400">
                    {{ lead.car.title }}
                  </NuxtLink>
                  <div class="text-[11px] text-neutral-500">{{ lead.car.price_formatted }}</div>
                </div>
                <div v-else class="text-neutral-500 italic">
                  General Showroom Inquiry
                </div>
              </td>

              <!-- Status Dropdown -->
              <td class="py-3.5 px-4">
                <select
                  :value="lead.status"
                  :disabled="updatingId === lead.id"
                  class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-neutral-950 border transition"
                  :class="{
                    'text-amber-400 border-amber-500/30': lead.status === 'new',
                    'text-blue-400 border-blue-500/30': lead.status === 'contacted',
                    'text-emerald-400 border-emerald-500/30': lead.status === 'converted',
                    'text-neutral-400 border-neutral-700': lead.status === 'lost',
                  }"
                  @change="handleStatusUpdate(lead.id, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </td>

              <!-- Audit Timestamps -->
              <td class="py-3.5 px-4 text-[11px] space-y-0.5">
                <div v-if="lead.whatsapp_clicked_at" class="text-emerald-400 flex items-center gap-1">
                  <span>✓</span>
                  <span>WhatsApp button clicked</span>
                </div>
                <div v-else class="text-neutral-500">
                  Form submitted only
                </div>

                <div v-if="lead.contacted_at" class="text-neutral-400">
                  Contacted: {{ new Date(lead.contacted_at).toLocaleDateString() }}
                </div>
              </td>

              <!-- Action Link -->
              <td class="py-3.5 px-4 text-right">
                <NuxtLink
                  :to="`/admin/leads/${lead.id}`"
                  class="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 text-xs font-semibold transition"
                >
                  View & Notes &rarr;
                </NuxtLink>
              </td>
            </tr>

            <tr v-if="leads.length === 0">
              <td colspan="5" class="text-center py-10 text-neutral-500">
                No customer inquiries match current filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
        <div>
          Showing page {{ meta.current_page }} of {{ meta.last_page }} ({{ meta.total }} leads total)
        </div>
        <div class="flex items-center gap-2">
          <button
            :disabled="meta.current_page <= 1"
            @click="() => { currentPage--; refresh(); }"
            class="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 disabled:opacity-40"
          >
            &larr; Prev
          </button>
          <button
            :disabled="meta.current_page >= meta.last_page"
            @click="() => { currentPage++; refresh(); }"
            class="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 disabled:opacity-40"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
