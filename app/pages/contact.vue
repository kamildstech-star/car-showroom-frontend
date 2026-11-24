<script setup lang="ts">
const config = useRuntimeConfig()
const siteUrl = (config.public.siteUrl as string) || 'https://hassanmotors.pk'
const { settings, phoneTel, whatsappUrl, emailMailto } = useShowroom()

useHead({
  link: [
    { rel: 'canonical', href: `${siteUrl}/contact` },
  ],
})

useSeoMeta({
  title: 'Contact Showroom | Hassan Motors Faisalabad',
  description: 'Connect with Hassan Motors in Faisalabad. Reach out for vehicle inquiries, inspection bookings, price negotiations, or showroom visits on Main West Canal Road.',
  ogTitle: 'Contact Hassan Motors Faisalabad',
  ogDescription: 'Call or WhatsApp +92 304 1142642. Main West Canal Road, Faisalabad.',
  ogUrl: `${siteUrl}/contact`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

const { submitLead, trackWhatsAppClick } = useCars()

const form = reactive({
  customer_name: '',
  phone: '',
  message: '',
  website: '', // Honeypot field
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const successResult = ref<{ lead_id: number; whatsapp_url: string } | null>(null)

const handleSubmit = async () => {
  errorMessage.value = null
  if (!form.customer_name || form.customer_name.trim().length < 2) {
    errorMessage.value = 'Please provide your full name (minimum 2 characters).'
    return
  }
  if (!form.phone || form.phone.trim().length < 7) {
    errorMessage.value = 'Please provide a valid phone or WhatsApp number.'
    return
  }

  loading.value = true

  try {
    const res = await submitLead({
      customer_name: form.customer_name,
      phone: form.phone,
      message: form.message || undefined,
      source: 'contact_page',
      website: form.website || undefined,
    })

    if (res.data) {
      successResult.value = res.data
      if (import.meta.client) {
        window.open(res.data.whatsapp_url, '_blank', 'noopener,noreferrer')
        trackWhatsAppClick(res.data.lead_id)
      }
    }
  } catch (err: unknown) {
    const errorObj = err as { data?: { message?: string } }
    errorMessage.value = errorObj.data?.message || `Failed to submit inquiry. Please call us directly at ${settings.value.showroom_phone}.`
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
    <!-- Header -->
    <div class="max-w-2xl space-y-3">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
        Showroom Inquiries
      </div>
      <h1 class="text-4xl sm:text-5xl font-black text-white tracking-tight">
        Get in Touch With <span class="text-amber-500">Hassan Motors</span>
      </h1>
      <p class="text-sm text-neutral-400 leading-relaxed">
        Looking for a specific car, wanting to sell your vehicle, or planning an inspection visit? Connect with our showroom team directly.
      </p>
    </div>

    <!-- Contact Grid: Form (Col 1-2) & Info Cards (Col 3) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
      <!-- Left: Interactive Form -->
      <div class="lg:col-span-2 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
        <h2 class="text-xl font-bold text-white mb-2">Send an Inquiry</h2>
        <p class="text-xs text-neutral-400 mb-8">
          Fill in your inquiry below. Our system records your request securely and routes you directly to our WhatsApp representative.
        </p>

        <!-- Success Screen -->
        <div v-if="successResult" class="p-8 bg-neutral-950 border border-emerald-500/30 rounded-2xl text-center space-y-4">
          <div class="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h3 class="text-lg font-bold text-white">Inquiry Saved Successfully!</h3>
          <p class="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Your inquiry is registered in our showroom database. WhatsApp has been opened in a new tab with your message.
          </p>
          <div class="pt-2">
            <a
              :href="successResult.whatsapp_url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40"
            >
              Re-open WhatsApp Chat
            </a>
          </div>
        </div>

        <!-- Inquiry Form -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Honeypot -->
          <input
            v-model="form.website"
            type="text"
            name="website"
            tabindex="-1"
            autocomplete="off"
            class="hidden"
          />

          <!-- Error Alert -->
          <div v-if="errorMessage" class="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-300">
            {{ errorMessage }}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Your Full Name <span class="text-amber-500">*</span>
              </label>
              <input
                v-model="form.customer_name"
                type="text"
                required
                placeholder="e.g. Tariq Mehmood"
                class="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                Phone / WhatsApp Number <span class="text-amber-500">*</span>
              </label>
              <input
                v-model="form.phone"
                type="tel"
                required
                placeholder="e.g. 0304 1142642"
                class="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Message or Vehicle Requirements
            </label>
            <textarea
              v-model="form.message"
              rows="4"
              placeholder="e.g. I am looking for a 2021-2023 Honda Civic in white color under 7.5M budget, or would like to schedule a showroom visit."
              class="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 px-6 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
            <span>{{ loading ? 'Saving & Opening WhatsApp...' : 'Submit Inquiry & Chat on WhatsApp' }}</span>
          </button>
        </form>
      </div>

      <!-- Right: Direct Information Cards -->
      <div class="lg:col-span-1 space-y-6">
        <!-- WhatsApp Callout -->
        <div class="bg-gradient-to-br from-emerald-950 to-neutral-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
            💬
          </div>
          <h3 class="text-lg font-bold text-white">Instant WhatsApp Chat</h3>
          <p class="text-xs text-neutral-300 leading-relaxed">
            Message us directly on WhatsApp for real-time video tours of cars, high-res photos, and immediate negotiation.
          </p>
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition"
          >
            Open WhatsApp ({{ settings.showroom_phone }})
          </a>
        </div>

        <!-- Showroom Location -->
        <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 class="text-base font-bold text-white">Physical Location</h3>
          <div class="text-xs space-y-2 text-neutral-400">
            <p><strong class="text-neutral-200">Dealership:</strong> {{ settings.showroom_name }}</p>
            <p><strong class="text-neutral-200">Address:</strong> {{ settings.showroom_address }}</p>
            <p><strong class="text-neutral-200">Showroom Hours:</strong></p>
            <p class="text-neutral-300">{{ settings.opening_hours }}</p>
          </div>
        </div>

        <!-- Phone & Email -->
        <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-3 text-xs">
          <div>
            <span class="block text-neutral-500 uppercase tracking-wider font-bold text-[10px]">Direct Hotline</span>
            <a :href="phoneTel" class="text-base font-bold text-white hover:text-amber-400 transition">
              {{ settings.showroom_phone }}
            </a>
          </div>
          <div class="pt-2 border-t border-neutral-800">
            <span class="block text-neutral-500 uppercase tracking-wider font-bold text-[10px]">Email Inquiries</span>
            <a :href="emailMailto" class="text-sm font-semibold text-neutral-300 hover:text-white transition">
              {{ settings.showroom_email }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
