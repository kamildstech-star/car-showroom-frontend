import type {
  Brand,
  CarDetail,
  CarFilters,
  CarListItem,
  LeadSubmissionPayload,
  LeadSubmissionResult,
  PaginatedCarsResponse,
} from '~/types/car'
import type { ApiResponse } from '~/types/api'

export const useCars = () => {
  const { fetchWithState, apiFetch } = useApi()

  /**
   * SSR-compatible fetch for paginated public car listings with filters.
   */
  const getCars = (filters: MaybeRef<CarFilters> = {}) => {
    return fetchWithState<PaginatedCarsResponse>('/cars', {
      query: filters,
      watch: [() => unref(filters)],
    })
  }

  /**
   * SSR-compatible fetch for featured vehicles (showcased on Homepage).
   */
  const getFeaturedCars = () => {
    return fetchWithState<ApiResponse<CarListItem[]>>('/cars/featured')
  }

  /**
   * SSR-compatible fetch for latest arrivals.
   */
  const getLatestCars = () => {
    return fetchWithState<ApiResponse<CarListItem[]>>('/cars/latest')
  }

  /**
   * SSR-compatible fetch for single car details by SEO slug.
   */
  const getCarBySlug = (slug: MaybeRef<string>) => {
    return fetchWithState<ApiResponse<CarDetail>>(`/cars/${unref(slug)}`, {
      watch: [() => unref(slug)],
    })
  }

  /**
   * SSR-compatible fetch for active showroom brands.
   */
  const getBrands = () => {
    return fetchWithState<ApiResponse<Brand[]>>('/brands')
  }

  /**
   * Submit customer inquiry and receive WhatsApp pre-filled URL.
   */
  const submitLead = async (payload: LeadSubmissionPayload) => {
    return apiFetch<ApiResponse<LeadSubmissionResult>>('/leads', {
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Record WhatsApp button click event for auditing.
   */
  const trackWhatsAppClick = async (leadId: number) => {
    try {
      await apiFetch(`/leads/${leadId}/whatsapp-clicked`, {
        method: 'POST',
      })
    } catch {
      // Non-blocking telemetry
    }
  }

  return {
    getCars,
    getFeaturedCars,
    getLatestCars,
    getCarBySlug,
    getBrands,
    submitLead,
    trackWhatsAppClick,
  }
}
