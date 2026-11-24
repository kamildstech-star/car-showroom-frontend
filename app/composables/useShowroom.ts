import type { ApiResponse } from '~/types/api'
import type { ShowroomSettings } from '~/types/admin'

export const FALLBACK_SETTINGS: Required<ShowroomSettings> = {
  showroom_name: 'Hassan Motors',
  showroom_tagline: 'Your Trusted Luxury & Verified Family Car Showroom in Faisalabad',
  showroom_phone: '+923041142642',
  showroom_whatsapp: '+923041142642',
  showroom_email: 'info@hassanmotors.pk',
  showroom_address: 'Main West Canal Road, Faisalabad, Punjab, Pakistan',
  showroom_city: 'Faisalabad',
  opening_hours: 'Monday – Saturday: 10:00 AM – 08:00 PM (Sunday Closed)',
}

/**
 * Single source of truth for public showroom details.
 * Fetches allowlisted public settings from /api/v1/settings with SSR hydration
 * and safe fallback defaults.
 */
export const useShowroom = () => {
  const { fetchWithState } = useApi()

  // Use fixed key to preserve SSR hydration state across client without extra requests
  const { data: settingsRes } = fetchWithState<ApiResponse<ShowroomSettings>>('/settings', {
    key: 'public_showroom_settings',
    lazy: false,
  })

  const settings = computed<Required<ShowroomSettings>>(() => {
    const raw = settingsRes.value?.data || {}
    return {
      showroom_name: raw.showroom_name?.trim() || FALLBACK_SETTINGS.showroom_name,
      showroom_tagline: raw.showroom_tagline?.trim() || FALLBACK_SETTINGS.showroom_tagline,
      showroom_phone: raw.showroom_phone?.trim() || FALLBACK_SETTINGS.showroom_phone,
      showroom_whatsapp: raw.showroom_whatsapp?.trim() || FALLBACK_SETTINGS.showroom_whatsapp,
      showroom_email: raw.showroom_email?.trim() || FALLBACK_SETTINGS.showroom_email,
      showroom_address: raw.showroom_address?.trim() || FALLBACK_SETTINGS.showroom_address,
      showroom_city: raw.showroom_city?.trim() || FALLBACK_SETTINGS.showroom_city,
      opening_hours: raw.opening_hours?.trim() || FALLBACK_SETTINGS.opening_hours,
    }
  })

  const phoneTel = computed(() => {
    const cleanNumber = settings.value.showroom_phone.replace(/\s+/g, '')
    return `tel:${cleanNumber}`
  })

  const whatsappUrl = computed(() => {
    const cleanNumber = settings.value.showroom_whatsapp.replace(/\D/g, '')
    return `https://wa.me/${cleanNumber}`
  })

  const emailMailto = computed(() => {
    return `mailto:${settings.value.showroom_email}`
  })

  return {
    settings,
    phoneTel,
    whatsappUrl,
    emailMailto,
    FALLBACK_SETTINGS,
  }
}
