import type {
  AdminCarDetail,
  AdminLead,
  CarFormData,
  DashboardMetrics,
  ShowroomSettings,
} from '~/types/admin'
import type { ApiResponse } from '~/types/api'
import type { Brand, CarImage, CarListItem, PaginatedMeta } from '~/types/car'

export const useAdmin = () => {
  const { apiFetch, fetchWithState } = useApi()

  // Dashboard Metrics
  const getDashboardData = () => {
    return fetchWithState<ApiResponse<{
      metrics: DashboardMetrics
      recent_cars: CarListItem[]
      recent_leads: AdminLead[]
    }>>('/admin/dashboard')
  }

  // Car Management
  const getAdminCars = (query: Record<string, unknown> = {}) => {
    return fetchWithState<ApiResponse<AdminCarDetail[]> & { meta: PaginatedMeta }>('/admin/cars', {
      query,
    })
  }

  const getAdminCar = (id: MaybeRef<string | number>) => {
    return fetchWithState<ApiResponse<AdminCarDetail>>(`/admin/cars/${unref(id)}`, {
      watch: [() => unref(id)],
    })
  }

  const createCar = (data: CarFormData) => {
    return apiFetch<ApiResponse<AdminCarDetail>>('/admin/cars', {
      method: 'POST',
      body: data,
    })
  }

  const updateCar = (id: string | number, data: Partial<CarFormData>) => {
    return apiFetch<ApiResponse<AdminCarDetail>>(`/admin/cars/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  const deleteCar = (id: string | number) => {
    return apiFetch<ApiResponse<null>>(`/admin/cars/${id}`, {
      method: 'DELETE',
    })
  }

  const patchCarStatus = (id: string | number, status: 'available' | 'sold') => {
    return apiFetch<ApiResponse<AdminCarDetail>>(`/admin/cars/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
  }

  const patchCarPublicationStatus = (id: string | number, publication_status: 'draft' | 'published') => {
    return apiFetch<ApiResponse<AdminCarDetail>>(`/admin/cars/${id}/publication-status`, {
      method: 'PATCH',
      body: { publication_status },
    })
  }

  const patchCarFeatured = (id: string | number, is_featured: boolean) => {
    return apiFetch<ApiResponse<AdminCarDetail>>(`/admin/cars/${id}/featured`, {
      method: 'PATCH',
      body: { is_featured },
    })
  }

  // Car Images Management
  const uploadCarImages = (carId: string | number, formData: FormData) => {
    return apiFetch<ApiResponse<CarImage[]>>(`/admin/cars/${carId}/images`, {
      method: 'POST',
      body: formData,
    })
  }

  const deleteCarImage = (carId: string | number, imageId: number) => {
    return apiFetch<ApiResponse<null>>(`/admin/cars/${carId}/images/${imageId}`, {
      method: 'DELETE',
    })
  }

  const setPrimaryCarImage = (carId: string | number, imageId: number) => {
    return apiFetch<ApiResponse<CarImage>>(`/admin/cars/${carId}/images/${imageId}/primary`, {
      method: 'PATCH',
    })
  }

  const reorderCarImages = (carId: string | number, imageIds: number[]) => {
    return apiFetch<ApiResponse<CarImage[]>>(`/admin/cars/${carId}/images/reorder`, {
      method: 'PUT',
      body: { image_ids: imageIds },
    })
  }

  // Brands
  const getAdminBrands = () => {
    return apiFetch<ApiResponse<Brand[]>>('/admin/brands')
  }

  // Leads CRM
  const getAdminLeads = (query: Record<string, unknown> = {}) => {
    return fetchWithState<ApiResponse<AdminLead[]> & { meta: PaginatedMeta }>('/admin/leads', {
      query,
    })
  }

  const getAdminLead = (id: MaybeRef<string | number>) => {
    return fetchWithState<ApiResponse<AdminLead>>(`/admin/leads/${unref(id)}`, {
      watch: [() => unref(id)],
    })
  }

  const patchLeadStatus = (id: string | number, status: string) => {
    return apiFetch<ApiResponse<AdminLead>>(`/admin/leads/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
  }

  const patchLeadNotes = (id: string | number, notes: string | null) => {
    return apiFetch<ApiResponse<AdminLead>>(`/admin/leads/${id}/notes`, {
      method: 'PATCH',
      body: { notes },
    })
  }

  // Settings
  const getSettings = () => {
    return fetchWithState<ApiResponse<ShowroomSettings>>('/admin/settings')
  }

  const updateSettings = (settings: ShowroomSettings) => {
    return apiFetch<ApiResponse<ShowroomSettings>>('/admin/settings', {
      method: 'PUT',
      body: settings,
    })
  }

  return {
    getDashboardData,
    getAdminCars,
    getAdminCar,
    createCar,
    updateCar,
    deleteCar,
    patchCarStatus,
    patchCarPublicationStatus,
    patchCarFeatured,
    uploadCarImages,
    deleteCarImage,
    setPrimaryCarImage,
    reorderCarImages,
    getAdminBrands,
    getAdminLeads,
    getAdminLead,
    patchLeadStatus,
    patchLeadNotes,
    getSettings,
    updateSettings,
  }
}
