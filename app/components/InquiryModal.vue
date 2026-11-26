<script setup lang="ts">
import type { CarDetail, CarListItem } from '~/types/car'
import { buildLeadInquiryPayload, getInquirySuccessMessage } from '~/utils/inquiry'

const props = defineProps<{
  modelValue: boolean
  car?: CarDetail | CarListItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { submitLead, trackWhatsAppClick } = useCars()
const { settings } = useShowroom()
const isSoldCar = computed(() => props.car?.status === 'sold')
const successMessageText = computed(() => getInquirySuccessMessage(props.car))

const form = reactive({
  customer_name: '',
  phone: '',
  message: '',
  website: '', // Honeypot trap
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const successResult = ref<{ lead_id: number; whatsapp_url: string } | null>(null)

const closeModal = () => {
  emit('update:modelValue', false)
  // Reset form after delay
  setTimeout(() => {
    successResult.value = null
    errorMessage.value = null
  }, 300)
}

const handleSubmit = async () => {
  errorMessage.value = null
  if (!form.customer_name || form.customer_name.trim().length < 2) {
    errorMessage.value = 'Please provide your name (at least 2 characters).'
    return
  }
  if (!form.phone || form.phone.trim().length < 7) {
    errorMessage.value = 'Please provide a valid phone or WhatsApp number.'
    return
  }

  loading.value = true

  try {
    const payload = buildLeadInquiryPayload(props.car, form)
    const res = await submitLead(payload)

    if (res.data) {
      successResult.value = res.data
      // Automatically open WhatsApp in a new tab
      if (import.meta.client) {
        window.open(res.data.whatsapp_url, '_blank', 'noopener,noreferrer')
        // Audit click event
        trackWhatsAppClick(res.data.lead_id)
      }
    }
  } catch (err: unknown) {
    const errorObj = err as { data?: { message?: string } }
    errorMessage.value = errorObj.data?.message || 'Failed to submit inquiry. Please try again or call us directly.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm transition-opacity"
      @click="closeModal"
    ></div>

    <!-- Modal Box -->
    <div class="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 overflow-hidden">
      <!-- Close button -->
      <button
        type="button"
        @click="closeModal"
        class="absolute top-5 right-5 text-neutral-400 hover:text-white transition p-2"
        aria-label="Close modal"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Success Screen -->
      <div v-if="successResult" class="text-center py-6 space-y-4">
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl font-bold">
          ✓
        </div>
        <h3 class="text-xl font-bold text-white">Inquiry Saved!</h3>
        <p class="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
          {{ successMessageText }}
        </p>

        <div class="pt-4 space-y-3">
          <a
            :href="successResult.whatsapp_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40"
          >
            Re-open WhatsApp Chat
          </a>
          <button
            type="button"
            @click="closeModal"
            class="w-full py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            Done
          </button>
        </div>
      </div>

      <!-- Form Screen -->
      <div v-else class="space-y-5">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            {{ settings.showroom_name }} {{ settings.showroom_city }}
          </div>
          <h3 class="text-xl font-bold text-white">
            <template v-if="isSoldCar">Ask About Similar Available Cars</template>
            <template v-else-if="car">Inquire About {{ car.title }}</template>
            <template v-else>Contact Showroom</template>
          </h3>
          <p class="text-xs text-neutral-400 mt-1">
            <template v-if="isSoldCar">
              {{ car?.title }} is sold. Share your preferences below and we will connect you on WhatsApp regarding similar available inventory.
            </template>
            <template v-else>
              Fill in your details below. We save your inquiry securely and connect you directly to our WhatsApp representative.
            </template>
          </p>
        </div>

        <!-- Vehicle Context Tag if available car selected -->
        <div v-if="car && !isSoldCar" class="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
          <div>
            <span class="block font-bold text-neutral-200">{{ car.title }}</span>
            <span class="text-neutral-500">{{ car.year }} &middot; {{ car.transmission }} &middot; {{ car.fuel_type }}</span>
          </div>
          <span class="text-amber-500 font-bold">{{ car.price_formatted }}</span>
        </div>
        <div v-else-if="car && isSoldCar" class="bg-rose-950/30 p-3 rounded-xl border border-rose-500/30 text-xs text-rose-200">
          Reference: <strong>{{ car.title }}</strong> (Sold) &mdash; Inquiry will be sent for similar available vehicles.
        </div>

        <!-- Error alert -->
        <div v-if="errorMessage" class="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-300">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Honeypot -->
          <input
            v-model="form.website"
            type="text"
            name="website"
            tabindex="-1"
            autocomplete="off"
            class="hidden"
          />

          <div>
            <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Your Full Name <span class="text-amber-500">*</span>
            </label>
            <input
              v-model="form.customer_name"
              type="text"
              required
              placeholder="e.g. Muhammad Ali"
              class="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Phone / WhatsApp Number <span class="text-amber-500">*</span>
            </label>
            <input
              v-model="form.phone"
              type="tel"
              required
              placeholder="e.g. 0300 1234567"
              class="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Message or Specific Questions (Optional)
            </label>
            <textarea
              v-model="form.message"
              rows="3"
              placeholder="e.g. Is price negotiable? Can I inspect the car tomorrow afternoon?"
              class="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ loading ? 'Saving & Connecting...' : 'Connect on WhatsApp &rarr;' }}</span>
          </button>

          <p class="text-[10px] text-center text-neutral-500">
            Showroom Hotline: {{ settings.showroom_phone }} &middot; We never share your contact details.
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
