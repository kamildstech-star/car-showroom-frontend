import type { ApiResponse } from '~/types/api'
import type { ShowroomSettings } from '~/types/admin'

const FALLBACK_SETTINGS = {
  showroom_name: 'Hassan Motors',
  showroom_tagline: "Faisalabad's Premier Vehicle Showroom",
  showroom_phone: '+92 304 1142642',
  showroom_whatsapp: '923041142642',
  showroom_email: 'info@hassanmotors.pk',
  showroom_address: 'Main West Canal Road',
  showroom_city: 'Faisalabad',
  opening_hours: 'Mon - Sat: 10:00 AM - 08:00 PM',
}

export const useShowroom = () => {
  const { fetchWithState } = useApi()
  const nuxtApp = useNuxtApp()

  const { data, pending, error, refresh } = fetchWithState<ApiResponse<ShowroomSettings>>('/settings', {
    key: 'showroom-public-settings',
    default: () => ({ success: true, data: {} }),
    getCachedData: (key) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
  })

  const settings = computed(() => {
    const apiData = data.value?.data || {}
    return {
      showroom_name: apiData.showroom_name || FALLBACK_SETTINGS.showroom_name,
      showroom_tagline: apiData.showroom_tagline || FALLBACK_SETTINGS.showroom_tagline,
      showroom_phone: apiData.showroom_phone || FALLBACK_SETTINGS.showroom_phone,
      showroom_whatsapp: apiData.showroom_whatsapp || FALLBACK_SETTINGS.showroom_whatsapp,
      showroom_email: apiData.showroom_email || FALLBACK_SETTINGS.showroom_email,
      showroom_address: apiData.showroom_address || FALLBACK_SETTINGS.showroom_address,
      showroom_city: apiData.showroom_city || FALLBACK_SETTINGS.showroom_city,
      opening_hours: apiData.opening_hours || FALLBACK_SETTINGS.opening_hours,
    }
  })

  const phoneTel = computed(() => {
    const cleaned = settings.value.showroom_phone.replace(/[^\d+]/g, '')
    return `tel:${cleaned}`
  })

  const whatsappUrl = computed(() => {
    const digits = settings.value.showroom_whatsapp.replace(/\D/g, '')
    return `https://wa.me/${digits}`
  })

  const fullAddress = computed(() => {
    return `${settings.value.showroom_address}, ${settings.value.showroom_city}, Pakistan`
  })

  return {
    settings,
    phoneTel,
    whatsappUrl,
    fullAddress,
    pending,
    error,
    refresh,
  }
}
