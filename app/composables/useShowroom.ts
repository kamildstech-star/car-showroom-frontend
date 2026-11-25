import type { ApiResponse } from '~/types/api'
import type { ShowroomSettings } from '~/types/admin'

const FALLBACK_SETTINGS = {
  showroom_name: 'Hassan Motors',
  showroom_tagline: 'Pre-Owned & Luxury Vehicle Showroom',
  showroom_phone: '+92 304 1142642',
  showroom_whatsapp: '923041142642',
  showroom_email: 'info@hassanmotors.pk',
  showroom_address: 'Main West Canal Road',
  showroom_city: 'Faisalabad',
  opening_hours: 'Mon - Sat: 10:00 AM - 08:00 PM',
}

const DAY_MAP: Record<string, string> = {
  mon: 'Monday',
  monday: 'Monday',
  tue: 'Tuesday',
  tues: 'Tuesday',
  tuesday: 'Tuesday',
  wed: 'Wednesday',
  wednesday: 'Wednesday',
  thu: 'Thursday',
  thur: 'Thursday',
  thurs: 'Thursday',
  thursday: 'Thursday',
  fri: 'Friday',
  friday: 'Friday',
  sat: 'Saturday',
  saturday: 'Saturday',
  sun: 'Sunday',
  sunday: 'Sunday',
}

const ORDERED_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

function to24Hour(hourStr: string, minStr: string, meridiem?: string): string | null {
  let hour = parseInt(hourStr, 10)
  const min = parseInt(minStr, 10)
  if (Number.isNaN(hour) || Number.isNaN(min) || min < 0 || min > 59) return null

  if (meridiem) {
    const m = meridiem.toUpperCase()
    if (hour < 1 || hour > 12) return null
    if (m === 'AM') {
      if (hour === 12) hour = 0
    } else if (m === 'PM') {
      if (hour !== 12) hour += 12
    } else {
      return null
    }
  } else if (hour < 0 || hour > 23) {
    return null
  }

  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export function parseOpeningHoursSpecification(raw?: string) {
  if (!raw) return null
  const trimmed = raw.trim()
  const match = trimmed.match(
    /^(?:(daily)|([a-z]+)\s*[-–to]+\s*([a-z]+))\s*[:,]?\s*(\d{1,2}):(\d{2})\s*(am|pm)?\s*[-–to]+\s*(\d{1,2}):(\d{2})\s*(am|pm)?$/i
  )
  if (!match) return null

  const [, daily, startDayRaw, endDayRaw, openH, openM, openMer, closeH, closeM, closeMer] = match
  let dayOfWeek: string[] = []

  if (daily) {
    dayOfWeek = [...ORDERED_DAYS]
  } else {
    const startDay = DAY_MAP[startDayRaw!.toLowerCase()]
    const endDay = DAY_MAP[endDayRaw!.toLowerCase()]
    if (!startDay || !endDay) return null
    const startIdx = ORDERED_DAYS.indexOf(startDay)
    const endIdx = ORDERED_DAYS.indexOf(endDay)
    if (startIdx === -1 || endIdx === -1) return null
    if (startIdx <= endIdx) {
      dayOfWeek = ORDERED_DAYS.slice(startIdx, endIdx + 1)
    } else {
      dayOfWeek = [...ORDERED_DAYS.slice(startIdx), ...ORDERED_DAYS.slice(0, endIdx + 1)]
    }
  }

  const opens = to24Hour(openH!, openM!, openMer)
  const closes = to24Hour(closeH!, closeM!, closeMer)
  if (!opens || !closes) return null

  return [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek,
      opens,
      closes,
    },
  ]
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

  const openingHoursSpec = computed(() => {
    return parseOpeningHoursSpecification(settings.value.opening_hours)
  })

  return {
    settings,
    phoneTel,
    whatsappUrl,
    fullAddress,
    openingHoursSpec,
    pending,
    error,
    refresh,
  }
}
