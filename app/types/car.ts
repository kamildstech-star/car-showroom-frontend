export interface Brand {
  id: number
  name: string
  slug: string
  is_active?: boolean
  cars_count?: number
}

export interface CarImage {
  id: number
  car_id: number
  image_path: string
  thumbnail_path?: string | null
  url: string | null
  thumbnail_url: string | null
  alt_text?: string | null
  is_primary: boolean
  sort_order: number
}

export interface CarListItem {
  id: number
  brand?: Brand
  model: string
  variant?: string | null
  title: string
  slug: string
  year: number
  price: number
  price_formatted: string
  mileage?: number | null
  engine_capacity?: number | null
  transmission: 'manual' | 'automatic'
  fuel_type: 'petrol' | 'diesel' | 'hybrid' | 'electric'
  exterior_color?: string | null
  registration_city?: string | null
  assembly?: 'local' | 'imported' | null
  status: 'available' | 'sold'
  is_featured: boolean
  published_at?: string | null
  primary_image?: CarImage | null
}

export interface CarDetail extends CarListItem {
  description?: string | null
  images: CarImage[]
  created_at?: string
}

export interface CarFilters {
  brand?: string
  search?: string
  price_min?: number | string
  price_max?: number | string
  year_min?: number | string
  year_max?: number | string
  mileage_min?: number | string
  mileage_max?: number | string
  transmission?: string
  fuel_type?: string
  status?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface PaginatedMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedCarsResponse {
  success: boolean
  message?: string
  data: CarListItem[]
  meta: PaginatedMeta
}

export interface LeadSubmissionPayload {
  customer_name: string
  phone: string
  message?: string
  car_id?: number | null
  source?: string
  website?: string // Honeypot field
}

export interface LeadSubmissionResult {
  lead_id: number
  whatsapp_url: string
}
