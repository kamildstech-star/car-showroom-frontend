<script setup lang="ts">
import type { CarFormData } from '~/types/admin'

definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

useSeoMeta({
  title: 'Add New Vehicle | Hassan Motors Admin',
})

const { createCar, getAdminBrands } = useAdmin()
const router = useRouter()

// Load brands
const brands = ref<{ id: number; name: string }[]>([])
try {
  const bRes = await getAdminBrands()
  brands.value = bRes.data || []
} catch {
  // Fallback
}

const form = reactive<CarFormData>({
  brand_id: brands.value[0]?.id || '',
  model: '',
  variant: '',
  year: new Date().getFullYear(),
  price: '',
  mileage: '',
  engine_capacity: '',
  transmission: 'automatic',
  fuel_type: 'petrol',
  exterior_color: '',
  registration_city: 'Faisalabad',
  assembly: 'local',
  status: 'available',
  publication_status: 'published',
  is_featured: false,
  description: '',
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})

const handleSubmit = async () => {
  errorMessage.value = null
  fieldErrors.value = {}
  loading.value = true

  try {
    const res = await createCar(form)
    if (res.data?.id) {
      // Direct user to image upload view for the newly created car
      router.push(`/admin/cars/${res.data.id}`)
    } else {
      router.push('/admin/cars')
    }
  } catch (err: unknown) {
    const errorObj = err as { data?: { message?: string; errors?: Record<string, string[]> } }
    errorMessage.value = errorObj.data?.message || 'Failed to create vehicle. Please review form errors.'
    if (errorObj.data?.errors) {
      fieldErrors.value = errorObj.data.errors
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <NuxtLink to="/admin/cars" class="text-xs text-neutral-500 hover:text-amber-400 transition">&larr; Back to Inventory</NuxtLink>
        <h1 class="text-2xl font-black text-white tracking-tight mt-1">Register New Vehicle</h1>
        <p class="text-xs text-neutral-400">Enter vehicle specifications. You can upload photos on the next screen.</p>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-300">
      {{ errorMessage }}
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
      <!-- Section 1: Basic Identity -->
      <div>
        <h2 class="text-sm font-bold uppercase tracking-wider text-amber-500 mb-4">
          1. Vehicle Identification
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Brand <span class="text-amber-500">*</span></label>
            <select
              v-model="form.brand_id"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option disabled value="">Select Brand</option>
              <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
            <span v-if="fieldErrors['brand_id']" class="text-[11px] text-rose-400 mt-1 block">{{ fieldErrors['brand_id'][0] }}</span>
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Model <span class="text-amber-500">*</span></label>
            <input
              v-model="form.model"
              type="text"
              required
              placeholder="e.g. Corolla, Civic, Sportage"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
            <span v-if="fieldErrors['model']" class="text-[11px] text-rose-400 mt-1 block">{{ fieldErrors['model'][0] }}</span>
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Variant (Optional)</label>
            <input
              v-model="form.variant"
              type="text"
              placeholder="e.g. Altis Grande, RS Turbo, AWD"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      <!-- Section 2: Year, Pricing & Mileage -->
      <div class="pt-6 border-t border-neutral-800">
        <h2 class="text-sm font-bold uppercase tracking-wider text-amber-500 mb-4">
          2. Commercials & Metrics
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Model Year <span class="text-amber-500">*</span></label>
            <input
              v-model.number="form.year"
              type="number"
              required
              min="1990"
              max="2030"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
            <span v-if="fieldErrors['year']" class="text-[11px] text-rose-400 mt-1 block">{{ fieldErrors['year'][0] }}</span>
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Demand Price (PKR) <span class="text-amber-500">*</span></label>
            <input
              v-model="form.price"
              type="number"
              required
              placeholder="e.g. 6800000"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
            <span v-if="fieldErrors['price']" class="text-[11px] text-rose-400 mt-1 block">{{ fieldErrors['price'][0] }}</span>
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Mileage (Kilometers)</label>
            <input
              v-model="form.mileage"
              type="number"
              placeholder="e.g. 45000"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      <!-- Section 3: Technical Specifications -->
      <div class="pt-6 border-t border-neutral-800">
        <h2 class="text-sm font-bold uppercase tracking-wider text-amber-500 mb-4">
          3. Technical Specifications
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Transmission</label>
            <select
              v-model="form.transmission"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Fuel Type</label>
            <select
              v-model="form.fuel_type"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Engine (CC)</label>
            <input
              v-model="form.engine_capacity"
              type="number"
              placeholder="e.g. 1800"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Exterior Color</label>
            <input
              v-model="form.exterior_color"
              type="text"
              placeholder="e.g. Super White"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Registration City</label>
            <input
              v-model="form.registration_city"
              type="text"
              placeholder="e.g. Faisalabad, Lahore"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Assembly</label>
            <select
              v-model="form.assembly"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="local">Local</option>
              <option value="imported">Imported</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Sale Status</label>
            <select
              v-model="form.status"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1.5">Publication</label>
            <select
              v-model="form.publication_status"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex items-center gap-2">
          <input
            v-model="form.is_featured"
            type="checkbox"
            id="is_featured"
            class="rounded bg-neutral-950 border-neutral-800 text-amber-500 focus:ring-0"
          />
          <label for="is_featured" class="text-xs text-neutral-300 cursor-pointer">
            Feature this car on the Homepage showcase
          </label>
        </div>
      </div>

      <!-- Section 4: Description -->
      <div class="pt-6 border-t border-neutral-800 text-xs">
        <label class="block font-semibold text-neutral-300 mb-1.5">Vehicle Description & Seller Notes</label>
        <textarea
          v-model="form.description"
          rows="4"
          placeholder="Detailed notes regarding condition, genuine seals, token tax status, and extra accessories..."
          class="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 resize-none"
        ></textarea>
      </div>

      <!-- Action Buttons -->
      <div class="pt-6 border-t border-neutral-800 flex items-center justify-end gap-3">
        <NuxtLink to="/admin/cars" class="px-5 py-2.5 rounded-xl text-xs bg-neutral-800 text-neutral-300">
          Cancel
        </NuxtLink>
        <button
          type="submit"
          :disabled="loading"
          class="px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          {{ loading ? 'Saving Vehicle...' : 'Save & Upload Photos &rarr;' }}
        </button>
      </div>
    </form>
  </div>
</template>
