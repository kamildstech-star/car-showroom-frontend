<script setup lang="ts">
import type { ShowroomSettings } from '~/types/admin'

definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

useSeoMeta({
  title: 'Showroom Settings | Hassan Motors Admin',
})

const { getSettings, updateSettings } = useAdmin()

const { data: settingsRes, status, refresh } = await getSettings()

const form = reactive<ShowroomSettings>({
  showroom_name: settingsRes.value?.data?.showroom_name || 'Hassan Motors',
  showroom_tagline: settingsRes.value?.data?.showroom_tagline || 'Your Trusted Luxury & Verified Family Car Showroom in Faisalabad',
  showroom_phone: settingsRes.value?.data?.showroom_phone || '+923041142642',
  showroom_whatsapp: settingsRes.value?.data?.showroom_whatsapp || '+923041142642',
  showroom_email: settingsRes.value?.data?.showroom_email || 'info@hassanmotors.pk',
  showroom_address: settingsRes.value?.data?.showroom_address || 'Main West Canal Road, Faisalabad, Punjab, Pakistan',
  showroom_city: settingsRes.value?.data?.showroom_city || 'Faisalabad',
  opening_hours: settingsRes.value?.data?.opening_hours || 'Monday - Saturday: 10:00 AM - 08:00 PM (Sunday Closed)',
})

const loading = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const handleSubmit = async () => {
  loading.value = true
  successMessage.value = null
  errorMessage.value = null

  try {
    await updateSettings(form)
    successMessage.value = 'Showroom contact and operations settings updated successfully!'
    refresh()
    setTimeout(() => {
      successMessage.value = null
    }, 3500)
  } catch (err: unknown) {
    const errorObj = err as { data?: { message?: string } }
    errorMessage.value = errorObj.data?.message || 'Failed to update settings.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="pb-6 border-b border-neutral-800">
      <h1 class="text-2xl font-black text-white tracking-tight">Showroom Configuration & Contact Settings</h1>
      <p class="text-xs text-neutral-400 mt-1">
        Update physical dealership location, official WhatsApp numbers, and operating hours visible on the public website.
      </p>
    </div>

    <!-- Feedback alerts -->
    <div v-if="successMessage" class="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-xs text-emerald-400">
      ✓ {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-300">
      {{ errorMessage }}
    </div>

    <!-- Settings Form -->
    <form @submit.prevent="handleSubmit" class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl text-xs">
      <!-- Section 1: Showroom Identity -->
      <div>
        <h2 class="text-sm font-bold uppercase tracking-wider text-amber-500 mb-4">
          Showroom Brand Identity
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Business Name</label>
            <input
              v-model="form.showroom_name"
              type="text"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Showroom Tagline</label>
            <input
              v-model="form.showroom_tagline"
              type="text"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      <!-- Section 2: Contact Numbers & WhatsApp -->
      <div class="pt-6 border-t border-neutral-800">
        <h2 class="text-sm font-bold uppercase tracking-wider text-amber-500 mb-4">
          Official Inbound Numbers
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Showroom Phone</label>
            <input
              v-model="form.showroom_phone"
              type="text"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">WhatsApp Inquiry Number</label>
            <input
              v-model="form.showroom_whatsapp"
              type="text"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Inquiry Email</label>
            <input
              v-model="form.showroom_email"
              type="email"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      <!-- Section 3: Physical Address & Timings -->
      <div class="pt-6 border-t border-neutral-800">
        <h2 class="text-sm font-bold uppercase tracking-wider text-amber-500 mb-4">
          Showroom Location & Timings
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-2">
            <label class="block font-semibold text-neutral-300 mb-1.5">Showroom Physical Address</label>
            <input
              v-model="form.showroom_address"
              type="text"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">City</label>
            <input
              v-model="form.showroom_city"
              type="text"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div class="sm:col-span-3">
            <label class="block font-semibold text-neutral-300 mb-1.5">Showroom Operating Hours</label>
            <input
              v-model="form.opening_hours"
              type="text"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="pt-6 border-t border-neutral-800 flex justify-end">
        <button
          type="submit"
          :disabled="loading"
          class="px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          {{ loading ? 'Saving Changes...' : 'Save Showroom Settings' }}
        </button>
      </div>
    </form>
  </div>
</template>
