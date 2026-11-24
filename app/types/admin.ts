import type { Brand, CarImage, CarListItem } from './car'

export interface DashboardMetrics {
  total_cars: number
  available_cars: number
  sold_cars: number
  draft_cars: number
  featured_cars: number
  total_leads: number
  new_leads: number
  contacted_leads: number
  converted_leads: number
}

export interface AdminCarDetail extends CarListItem {
  publication_status: 'draft' | 'published'
  description?: string | null
  images: CarImage[]
  leads_count?: number
  created_at?: string
  updated_at?: string
}

export interface AdminLead {
  id: number
  customer_name: string
  phone: string
  message?: string | null
  status: 'new' | 'contacted' | 'converted' | 'lost'
  source: string
  whatsapp_clicked_at?: string | null
  contacted_at?: string | null
  notes?: string | null
  car?: {
    id: number
    brand?: { id: number; name: string } | null
    model: string
    variant?: string | null
    title: string
    year: number
    price: number
    price_formatted: string
    status: string
    publication_status: string
  } | null
  created_at?: string
  updated_at?: string
}

export interface ShowroomSettings {
  showroom_name?: string
  showroom_tagline?: string
  showroom_phone?: string
  showroom_whatsapp?: string
  showroom_email?: string
  showroom_address?: string
  showroom_city?: string
  opening_hours?: string
  [key: string]: string | undefined
}

export interface CarFormData {
  brand_id: number | string
  model: string
  variant?: string
  year: number | string
  price: number | string
  mileage?: number | string
  engine_capacity?: number | string
  transmission: 'manual' | 'automatic'
  fuel_type: 'petrol' | 'diesel' | 'hybrid' | 'electric'
  exterior_color?: string
  registration_city?: string
  assembly?: 'local' | 'imported'
  status: 'available' | 'sold'
  publication_status: 'draft' | 'published'
  is_featured: boolean
  description?: string
}
