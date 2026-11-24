<script setup lang="ts">
import type { AdminLead } from '~/types/admin'

definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

const route = useRoute()
const leadId = computed(() => route.params.id as string)

const { getAdminLead, patchLeadStatus, patchLeadNotes } = useAdmin()

const { data: leadRes, refresh } = await getAdminLead(leadId)

if (!leadRes.value?.data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Inquiry record not found.',
    fatal: true,
  })
}

const lead = computed<AdminLead>(() => leadRes.value!.data)

useSeoMeta({
  title: `Inquiry: ${lead.value.customer_name} | Hassan Motors Admin`,
})

// Status update
const statusLoading = ref(false)
const handleStatusChange = async (newStatus: string) => {
  statusLoading.value = true
  try {
    await patchLeadStatus(leadId.value, newStatus)
    refresh()
  } catch (err) {
    console.error('Failed to update status', err)
  } finally {
    statusLoading.value = false
  }
}

// Notes editor
const notes = ref(lead.value.notes || '')
const notesLoading = ref(false)
const notesSuccess = ref(false)

const handleSaveNotes = async () => {
  notesLoading.value = true
  notesSuccess.value = false
  try {
    await patchLeadNotes(leadId.value, notes.value)
    notesSuccess.value = true
    refresh()
    setTimeout(() => {
      notesSuccess.value = false
    }, 2500)
  } catch (err) {
    console.error('Failed to save notes', err)
  } finally {
    notesLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
      <div>
        <NuxtLink to="/admin/leads" class="text-xs text-neutral-500 hover:text-amber-400 transition">&larr; Back to Inquiries</NuxtLink>
        <h1 class="text-2xl font-black text-white tracking-tight mt-1">
          Inquiry: {{ lead.customer_name }}
        </h1>
        <p class="text-xs text-neutral-400">
          Source: {{ lead.source }} &middot; Created on: {{ new Date(lead.created_at || '').toLocaleString() }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <a
          :href="`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`"
          target="_blank"
          class="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-950/40"
        >
          <span>💬 Open WhatsApp Chat</span>
        </a>
        <a
          :href="`tel:${lead.phone}`"
          class="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-neutral-900 border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition"
        >
          Call: {{ lead.phone }}
        </a>
      </div>
    </div>

    <!-- Main Grid: Info Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <!-- Card 1: Customer Contact -->
      <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-amber-500">
          Customer Profile
        </h3>
        <div class="space-y-2 text-xs">
          <div>
            <span class="block text-[10px] uppercase text-neutral-500 font-bold">Full Name</span>
            <span class="text-sm font-bold text-white">{{ lead.customer_name }}</span>
          </div>
          <div>
            <span class="block text-[10px] uppercase text-neutral-500 font-bold">Phone Number</span>
            <span class="text-sm font-bold text-white">{{ lead.phone }}</span>
          </div>
        </div>
      </div>

      <!-- Card 2: CRM Status Selector -->
      <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-amber-500">
          Lead Status
        </h3>
        <div class="space-y-2 text-xs">
          <label class="block text-[10px] uppercase text-neutral-500 font-bold">Current Stage</label>
          <select
            :value="lead.status"
            :disabled="statusLoading"
            class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-bold uppercase focus:outline-none focus:border-amber-500"
            :class="{
              'text-amber-400': lead.status === 'new',
              'text-blue-400': lead.status === 'contacted',
              'text-emerald-400': lead.status === 'converted',
              'text-neutral-400': lead.status === 'lost',
            }"
            @change="handleStatusChange(($event.target as HTMLSelectElement).value)"
          >
            <option value="new">New (Uncontacted)</option>
            <option value="contacted">Contacted (In Discussion)</option>
            <option value="converted">Converted (Deal Closed)</option>
            <option value="lost">Lost</option>
          </select>

          <p v-if="lead.contacted_at" class="text-[10px] text-neutral-500 mt-1">
            First contacted: {{ new Date(lead.contacted_at).toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Card 3: Engagement Audit -->
      <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4">
        <h3 class="text-xs font-bold uppercase tracking-wider text-amber-500">
          Website Action Audit
        </h3>
        <div class="space-y-2 text-xs">
          <div v-if="lead.whatsapp_clicked_at" class="text-emerald-400">
            <span class="font-bold">✓ WhatsApp Button Clicked</span>
            <p class="text-[10px] text-neutral-500 mt-0.5">
              Customer clicked to open WhatsApp on {{ new Date(lead.whatsapp_clicked_at).toLocaleString() }}
            </p>
          </div>
          <div v-else class="text-neutral-400">
            <span>Website inquiry only</span>
            <p class="text-[10px] text-neutral-500 mt-0.5">Customer submitted form without clicking WhatsApp button.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Inquired Vehicle Card (if applicable) -->
    <div v-if="lead.car" class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold uppercase tracking-wider text-white">Inquired Vehicle Specifications</h3>
        <NuxtLink :to="`/admin/cars/${lead.car.id}`" class="text-xs font-bold text-amber-500 hover:text-amber-400">
          Edit Vehicle &rarr;
        </NuxtLink>
      </div>

      <div class="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div>
          <span class="text-base font-bold text-white block">{{ lead.car.title }}</span>
          <span class="text-neutral-400 text-xs mt-0.5 block">
            Year: {{ lead.car.year }} &middot; Status: {{ lead.car.status }} &middot; Publication: {{ lead.car.publication_status }}
          </span>
        </div>
        <div class="text-base font-black text-amber-500">
          {{ lead.car.price_formatted }}
        </div>
      </div>
    </div>

    <!-- Customer's Inquired Message -->
    <div v-if="lead.message" class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-2">
      <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">Customer's Message</h3>
      <p class="text-sm text-neutral-200 leading-relaxed whitespace-pre-line bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
        {{ lead.message }}
      </p>
    </div>

    <!-- Internal Admin Notes (Private from public) -->
    <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-bold text-white">Showroom Internal Notes</h3>
          <p class="text-xs text-neutral-400">Private admin notes on customer negotiation, exchange offers, or follow-up schedules.</p>
        </div>
        <span v-if="notesSuccess" class="text-xs text-emerald-400 font-bold">
          ✓ Notes saved!
        </span>
      </div>

      <form @submit.prevent="handleSaveNotes" class="space-y-4 text-xs">
        <textarea
          v-model="notes"
          rows="4"
          placeholder="e.g. Offered 6.5M cash. Customer has 2019 Civic for exchange. Follow up on Tuesday morning..."
          class="w-full px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none text-xs"
        ></textarea>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="notesLoading"
            class="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            {{ notesLoading ? 'Saving...' : 'Save Internal Notes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
