<script setup lang="ts">
import type { AdminCarDetail, CarFormData } from '~/types/admin'
import type { CarImage } from '~/types/car'

definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

const route = useRoute()
const carId = computed(() => route.params.id as string)

const {
  getAdminCar,
  updateCar,
  uploadCarImages,
  deleteCarImage,
  setPrimaryCarImage,
  reorderCarImages,
  getAdminBrands,
} = useAdmin()

// Fetch car details
const { data: carRes, status, refresh } = await getAdminCar(carId)

if (!carRes.value?.data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Car not found in showroom inventory.',
    fatal: true,
  })
}

const car = computed<AdminCarDetail>(() => carRes.value!.data)
const images = computed<CarImage[]>(() => car.value.images || [])

useSeoMeta({
  title: `Edit ${car.value.title} | Hassan Motors Admin`,
})

// Load Brands
const brands = ref<{ id: number; name: string }[]>([])
try {
  const bRes = await getAdminBrands()
  brands.value = bRes.data || []
} catch {
  // Fallback
}

// Edit Form
const form = reactive<CarFormData>({
  brand_id: car.value.brand?.id || '',
  model: car.value.model || '',
  variant: car.value.variant || '',
  year: car.value.year || new Date().getFullYear(),
  price: car.value.price || '',
  mileage: car.value.mileage || '',
  engine_capacity: car.value.engine_capacity || '',
  transmission: car.value.transmission || 'automatic',
  fuel_type: car.value.fuel_type || 'petrol',
  exterior_color: car.value.exterior_color || '',
  registration_city: car.value.registration_city || '',
  assembly: (car.value.assembly as 'local' | 'imported') || 'local',
  status: car.value.status || 'available',
  publication_status: car.value.publication_status || 'published',
  is_featured: (car.value.is_featured as boolean) || false,
  description: car.value.description || '',
})

const updateLoading = ref(false)
const updateSuccess = ref(false)
const updateError = ref<string | null>(null)

const handleUpdateSpecs = async () => {
  updateLoading.value = true
  updateSuccess.value = false
  updateError.value = null

  try {
    await updateCar(carId.value, form)
    updateSuccess.value = true
    refresh()
    setTimeout(() => {
      updateSuccess.value = false
    }, 3000)
  } catch (err: unknown) {
    const errorObj = err as { data?: { message?: string } }
    updateError.value = errorObj.data?.message || 'Failed to update vehicle.'
  } finally {
    updateLoading.value = false
  }
}

// Image Upload Management
const fileInput = ref<HTMLInputElement | null>(null)
const uploadLoading = ref(false)
const uploadError = ref<string | null>(null)

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  uploadError.value = null
  uploadLoading.value = true

  const formData = new FormData()
  for (let i = 0; i < target.files.length; i++) {
    formData.append(`images[${i}]`, target.files[i])
  }

  try {
    await uploadCarImages(carId.value, formData)
    refresh()
    if (fileInput.value) fileInput.value.value = ''
  } catch (err: unknown) {
    const errorObj = err as { data?: { message?: string } }
    uploadError.value = errorObj.data?.message || 'Failed to upload images. Check file sizes (<5MB) and formats.'
  } finally {
    uploadLoading.value = false
  }
}

// Set Primary Image
const settingPrimaryId = ref<number | null>(null)
const handleSetPrimary = async (imgId: number) => {
  settingPrimaryId.value = imgId
  try {
    await setPrimaryCarImage(carId.value, imgId)
    refresh()
  } catch (err) {
    console.error('Failed to set primary image', err)
  } finally {
    settingPrimaryId.value = null
  }
}

// Delete Image
const deletingImgId = ref<number | null>(null)
const handleDeleteImage = async (imgId: number) => {
  if (!confirm('Are you sure you want to permanently delete this photo?')) return
  deletingImgId.value = imgId
  try {
    await deleteCarImage(carId.value, imgId)
    refresh()
  } catch (err) {
    console.error('Failed to delete image', err)
  } finally {
    deletingImgId.value = null
  }
}

// Reorder Images (Move left / right)
const moveImage = async (currentIndex: number, direction: 'left' | 'right') => {
  const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= images.value.length) return

  const list = [...images.value]
  const temp = list[currentIndex]
  list[currentIndex] = list[targetIndex]
  list[targetIndex] = temp

  const ids = list.map(img => img.id)
  try {
    await reorderCarImages(carId.value, ids)
    refresh()
  } catch (err) {
    console.error('Failed to reorder images', err)
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-10">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
      <div>
        <NuxtLink to="/admin/cars" class="text-xs text-neutral-500 hover:text-amber-400 transition">&larr; Back to Inventory</NuxtLink>
        <h1 class="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
          <span>{{ car.title }}</span>
          <span
            class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            :class="car.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'"
          >
            {{ car.status }}
          </span>
        </h1>
        <p class="text-xs text-neutral-400">Demand: {{ car.price_formatted }} &middot; Slug: {{ car.slug }}</p>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          :to="`/cars/${car.slug}`"
          target="_blank"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition flex items-center gap-1.5"
        >
          <span>View Public Page</span>
          <span>&rarr;</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Section 1: Image Management (Phase 5 in UI) -->
    <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <span class="text-amber-500">📸</span>
            Vehicle Photography & Gallery ({{ images.length }} photos)
          </h2>
          <p class="text-xs text-neutral-400 mt-0.5">
            Upload multiple photos (JPEG, PNG, WebP up to 5MB). Designate primary photo, reorder, or delete.
          </p>
        </div>

        <div>
          <label class="cursor-pointer px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition shadow-md shadow-amber-500/20 inline-flex items-center gap-2">
            <span>{{ uploadLoading ? 'Uploading...' : '+ Upload Photos' }}</span>
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              :disabled="uploadLoading"
              class="hidden"
              @change="handleFileUpload"
            />
          </label>
        </div>
      </div>

      <!-- Upload Error Alert -->
      <div v-if="uploadError" class="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-300">
        {{ uploadError }}
      </div>

      <!-- Image Grid -->
      <div v-if="images.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="(img, idx) in images"
          :key="img.id"
          class="relative group bg-neutral-950 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all"
          :class="img.is_primary ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-neutral-800'"
        >
          <!-- Image Aspect Frame -->
          <div class="aspect-[16/10] bg-neutral-900 overflow-hidden relative">
            <img
              :src="img.thumbnail_url || img.url || ''"
              :alt="img.alt_text || car.title"
              class="w-full h-full object-cover"
            />

            <!-- Primary Badge -->
            <div
              v-if="img.is_primary"
              class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 shadow-md"
            >
              Primary
            </div>

            <!-- Sort Order Pill -->
            <div class="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-neutral-950/80 text-[10px] font-semibold text-neutral-300">
              #{{ idx + 1 }}
            </div>
          </div>

          <!-- Actions Footer on card -->
          <div class="p-2.5 bg-neutral-950/90 border-t border-neutral-800 flex items-center justify-between text-xs">
            <div class="flex items-center space-x-1">
              <!-- Move Left -->
              <button
                type="button"
                :disabled="idx === 0"
                @click="moveImage(idx, 'left')"
                class="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30"
                title="Move left"
              >
                &larr;
              </button>
              <!-- Move Right -->
              <button
                type="button"
                :disabled="idx === images.length - 1"
                @click="moveImage(idx, 'right')"
                class="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30"
                title="Move right"
              >
                &rarr;
              </button>
            </div>

            <div class="flex items-center space-x-2">
              <!-- Set Primary -->
              <button
                v-if="!img.is_primary"
                type="button"
                :disabled="settingPrimaryId === img.id"
                @click="handleSetPrimary(img.id)"
                class="text-[10px] font-bold text-amber-500 hover:text-amber-400 uppercase"
                title="Set as vehicle's main photo"
              >
                {{ settingPrimaryId === img.id ? '...' : 'Make Primary' }}
              </button>

              <!-- Delete -->
              <button
                type="button"
                :disabled="deletingImgId === img.id"
                @click="handleDeleteImage(img.id)"
                class="text-neutral-500 hover:text-rose-400 p-1"
                title="Delete photo"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 border-2 border-dashed border-neutral-800 rounded-2xl text-xs text-neutral-500 space-y-2">
        <div class="text-2xl">📸</div>
        <p class="font-semibold text-neutral-300">No photos uploaded for this car yet</p>
        <p>Click "+ Upload Photos" above to select multiple high-resolution photos.</p>
      </div>
    </div>

    <!-- Section 2: Edit Vehicle Specs Form -->
    <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <h2 class="text-base font-bold text-white flex items-center gap-2">
          <span class="text-amber-500">⚙️</span>
          Vehicle Specifications & Pricing
        </h2>
        <span v-if="updateSuccess" class="text-xs text-emerald-400 font-bold">
          ✓ Changes saved successfully!
        </span>
      </div>

      <div v-if="updateError" class="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-300">
        {{ updateError }}
      </div>

      <form @submit.prevent="handleUpdateSpecs" class="space-y-6 text-xs">
        <!-- Identity -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-semibold text-neutral-300 mb-1">Brand</label>
            <select
              v-model="form.brand_id"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1">Model</label>
            <input
              v-model="form.model"
              type="text"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1">Variant</label>
            <input
              v-model="form.variant"
              type="text"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-semibold text-neutral-300 mb-1">Year</label>
            <input
              v-model.number="form.year"
              type="number"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1">Demand Price (PKR)</label>
            <input
              v-model="form.price"
              type="number"
              required
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1">Mileage (km)</label>
            <input
              v-model="form.mileage"
              type="number"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <!-- Technical -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label class="block font-semibold text-neutral-300 mb-1">Transmission</label>
            <select
              v-model="form.transmission"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1">Fuel Type</label>
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
            <label class="block font-semibold text-neutral-300 mb-1">Sale Status</label>
            <select
              v-model="form.status"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-neutral-300 mb-1">Publication Status</label>
            <select
              v-model="form.publication_status"
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <input
            v-model="form.is_featured"
            type="checkbox"
            id="featured_check"
            class="rounded bg-neutral-950 border-neutral-800 text-amber-500 focus:ring-0"
          />
          <label for="featured_check" class="text-neutral-300 cursor-pointer">
            Display this car in the Homepage Featured Showcase
          </label>
        </div>

        <!-- Description -->
        <div>
          <label class="block font-semibold text-neutral-300 mb-1">Description & Inspection Notes</label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 resize-none"
          ></textarea>
        </div>

        <div class="pt-4 border-t border-neutral-800 flex justify-end">
          <button
            type="submit"
            :disabled="updateLoading"
            class="px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {{ updateLoading ? 'Saving Changes...' : 'Save Specifications' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
