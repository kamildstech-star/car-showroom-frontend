<script setup lang="ts">
import type { AdminCarDetail } from '~/types/admin'

definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

useSeoMeta({
  title: 'Manage Inventory | Hassan Motors Admin',
})

const {
  getAdminCars,
  patchCarStatus,
  patchCarPublicationStatus,
  patchCarFeatured,
  deleteCar,
  getAdminBrands,
} = useAdmin()

const router = useRouter()
const route = useRoute()

// Query Filters
const search = ref((route.query.search as string) || '')
const statusFilter = ref((route.query.status as string) || '')
const publicationFilter = ref((route.query.publication_status as string) || '')
const brandFilter = ref((route.query.brand as string) || '')
const currentPage = ref(Number(route.query.page) || 1)

// Fetch Brands
const brands = ref<{ id: number; name: string }[]>([])
try {
  const bRes = await getAdminBrands()
  brands.value = bRes.data || []
} catch {
  // Graceful fallback
}

// Fetch Admin Cars
const queryParams = computed(() => {
  const p: Record<string, unknown> = { page: currentPage.value, per_page: 15 }
  if (search.value) p.search = search.value
  if (statusFilter.value) p.status = statusFilter.value
  if (publicationFilter.value) p.publication_status = publicationFilter.value
  if (brandFilter.value) p.brand = brandFilter.value
  return p
})

const { data: carsRes, status: fetchStatus, refresh } = await getAdminCars(queryParams.value)

const cars = computed<AdminCarDetail[]>(() => carsRes.value?.data || [])
const meta = computed(() => carsRes.value?.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 })

// Quick Toggles
const togglingId = ref<number | null>(null)

const toggleStatus = async (car: AdminCarDetail) => {
  togglingId.value = car.id
  const nextStatus = car.status === 'available' ? 'sold' : 'available'
  try {
    await patchCarStatus(car.id, nextStatus)
    refresh()
  } catch (err) {
    console.error('Failed to patch car status', err)
  } finally {
    togglingId.value = null
  }
}

const togglePublication = async (car: AdminCarDetail) => {
  togglingId.value = car.id
  const nextPub = car.publication_status === 'published' ? 'draft' : 'published'
  try {
    await patchCarPublicationStatus(car.id, nextPub)
    refresh()
  } catch (err) {
    console.error('Failed to patch publication status', err)
  } finally {
    togglingId.value = null
  }
}

const toggleFeatured = async (car: AdminCarDetail) => {
  togglingId.value = car.id
  try {
    await patchCarFeatured(car.id, !car.is_featured)
    refresh()
  } catch (err) {
    console.error('Failed to patch featured flag', err)
  } finally {
    togglingId.value = null
  }
}

// Delete Confirmation
const carToDelete = ref<AdminCarDetail | null>(null)
const deleteLoading = ref(false)

const confirmDelete = async () => {
  if (!carToDelete.value) return
  deleteLoading.value = true
  try {
    await deleteCar(carToDelete.value.id)
    carToDelete.value = null
    refresh()
  } catch (err) {
    console.error('Failed to delete car', err)
  } finally {
    deleteLoading.value = false
  }
}

const applyFilters = () => {
  currentPage.value = 1
  refresh()
}

const resetFilters = () => {
  search.value = ''
  statusFilter.value = ''
  publicationFilter.value = ''
  brandFilter.value = ''
  currentPage.value = 1
  refresh()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
      <div>
        <h1 class="text-2xl font-black text-white tracking-tight">Vehicles & Inventory</h1>
        <p class="text-xs text-neutral-400 mt-1">
          Manage all showroom cars, pricing, publication status, and photography.
        </p>
      </div>

      <NuxtLink
        to="/admin/cars/create"
        class="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-neutral-950 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
      >
        + Add New Car
      </NuxtLink>
    </div>

    <!-- Filters Bar -->
    <div class="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center gap-3 text-xs">
      <div class="flex-1 min-w-[200px]">
        <input
          v-model="search"
          type="text"
          placeholder="Search by model or variant..."
          class="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          @keydown.enter="applyFilters"
        />
      </div>

      <select
        v-model="brandFilter"
        class="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
        @change="applyFilters"
      >
        <option value="">All Brands</option>
        <option v-for="b in brands" :key="b.id" :value="b.name">{{ b.name }}</option>
      </select>

      <select
        v-model="statusFilter"
        class="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
        @change="applyFilters"
      >
        <option value="">All Sale Statuses</option>
        <option value="available">Available Only</option>
        <option value="sold">Sold Only</option>
      </select>

      <select
        v-model="publicationFilter"
        class="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
        @change="applyFilters"
      >
        <option value="">All Publications</option>
        <option value="published">Published</option>
        <option value="draft">Draft Only</option>
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

    <!-- Inventory Data Table -->
    <div class="bg-neutral-900/80 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-neutral-300">
          <thead class="bg-neutral-950 border-b border-neutral-800 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            <tr>
              <th class="py-3.5 px-4">Vehicle</th>
              <th class="py-3.5 px-4">Demand (PKR)</th>
              <th class="py-3.5 px-4">Sale Status</th>
              <th class="py-3.5 px-4">Publication</th>
              <th class="py-3.5 px-4">Featured</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-neutral-800/60">
            <tr v-for="car in cars" :key="car.id" class="hover:bg-neutral-800/40 transition">
              <!-- Vehicle Info -->
              <td class="py-3 px-4">
                <div class="flex items-center space-x-3">
                  <div class="w-14 h-10 rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden flex-shrink-0">
                    <img
                      v-if="car.primary_image?.thumbnail_url || car.primary_image?.url"
                      :src="car.primary_image?.thumbnail_url || car.primary_image?.url || ''"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-[10px] text-neutral-600 font-bold">
                      HM
                    </div>
                  </div>
                  <div>
                    <NuxtLink :to="`/admin/cars/${car.id}`" class="font-bold text-white hover:text-amber-400 transition block">
                      {{ car.title }}
                    </NuxtLink>
                    <span class="text-[11px] text-neutral-500">
                      {{ car.year }} &middot; {{ car.transmission }} &middot; {{ car.fuel_type }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Demand -->
              <td class="py-3 px-4 font-bold text-white">
                {{ car.price_formatted }}
              </td>

              <!-- Sale Status Toggle -->
              <td class="py-3 px-4">
                <button
                  type="button"
                  :disabled="togglingId === car.id"
                  @click="toggleStatus(car)"
                  class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition tracking-wider"
                  :class="car.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'"
                  title="Click to toggle Available / Sold"
                >
                  {{ car.status }}
                </button>
              </td>

              <!-- Publication Status Toggle -->
              <td class="py-3 px-4">
                <button
                  type="button"
                  :disabled="togglingId === car.id"
                  @click="togglePublication(car)"
                  class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition tracking-wider"
                  :class="car.publication_status === 'published' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'"
                  title="Click to toggle Published / Draft"
                >
                  {{ car.publication_status }}
                </button>
              </td>

              <!-- Featured Toggle -->
              <td class="py-3 px-4">
                <button
                  type="button"
                  :disabled="togglingId === car.id"
                  @click="toggleFeatured(car)"
                  class="text-base"
                  :title="car.is_featured ? 'Featured on Homepage (Click to unfeature)' : 'Not featured (Click to feature)'"
                >
                  {{ car.is_featured ? '⭐' : '☆' }}
                </button>
              </td>

              <!-- Actions -->
              <td class="py-3 px-4 text-right space-x-2">
                <NuxtLink
                  :to="`/cars/${car.slug}`"
                  target="_blank"
                  class="px-2.5 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition text-[11px]"
                  title="View live page"
                >
                  Preview
                </NuxtLink>

                <NuxtLink
                  :to="`/admin/cars/${car.id}`"
                  class="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 font-semibold text-neutral-200 transition text-[11px]"
                >
                  Edit & Photos
                </NuxtLink>

                <button
                  type="button"
                  @click="carToDelete = car"
                  class="px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition text-[11px]"
                  title="Delete car"
                >
                  Delete
                </button>
              </td>
            </tr>

            <tr v-if="cars.length === 0">
              <td colspan="6" class="text-center py-10 text-neutral-500">
                No vehicles found matching current filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="p-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
        <div>
          Showing page {{ meta.current_page }} of {{ meta.last_page }} ({{ meta.total }} cars total)
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

    <!-- Delete Confirmation Modal -->
    <div v-if="carToDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm" @click="carToDelete = null"></div>
      <div class="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl z-10 space-y-4">
        <h3 class="text-base font-bold text-white">Confirm Delete</h3>
        <p class="text-xs text-neutral-400 leading-relaxed">
          Are you sure you want to delete <strong class="text-white">{{ carToDelete.title }}</strong>? This will soft-delete the vehicle while preserving inquiry history.
        </p>
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="carToDelete = null"
            class="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="deleteLoading"
            @click="confirmDelete"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
          >
            {{ deleteLoading ? 'Deleting...' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
