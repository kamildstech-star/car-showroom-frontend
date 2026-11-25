interface PublicSettingsResponse {
  success?: boolean
  data?: Record<string, string | undefined>
}

const FALLBACK = {
  showroom_name: 'Hassan Motors',
  showroom_tagline: 'Pre-Owned & Luxury Vehicle Showroom',
  showroom_phone: '+92 304 1142642',
  showroom_whatsapp: '923041142642',
  showroom_email: 'info@hassanmotors.pk',
  showroom_address: 'Main West Canal Road',
  showroom_city: 'Faisalabad',
  opening_hours: 'Mon - Sat: 10:00 AM - 08:00 PM',
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = ((config.public.apiBase as string) || 'http://localhost:8000').replace(/\/$/, '')
  const prefix = (config.public.apiPrefix as string) || '/api/v1'
  const siteUrl = ((config.public.siteUrl as string) || 'https://hassanmotors.pk').replace(/\/$/, '')

  let apiData: Record<string, string | undefined> = {}
  try {
    const res = await $fetch<PublicSettingsResponse>(`${apiBase}${prefix}/settings`, {
      headers: { Accept: 'application/json' },
    })
    apiData = res?.data || {}
  } catch {
    // Use safe fallback values if backend is unavailable
  }

  const name = apiData.showroom_name || FALLBACK.showroom_name
  const tagline = apiData.showroom_tagline || FALLBACK.showroom_tagline
  const phone = apiData.showroom_phone || FALLBACK.showroom_phone
  const whatsappDigits = (apiData.showroom_whatsapp || FALLBACK.showroom_whatsapp).replace(/\D/g, '')
  const email = apiData.showroom_email || FALLBACK.showroom_email
  const address = apiData.showroom_address || FALLBACK.showroom_address
  const city = apiData.showroom_city || FALLBACK.showroom_city
  const hours = apiData.opening_hours || FALLBACK.opening_hours

  const content = `# ${name}

> ${tagline} located at ${address}, ${city}, Pakistan.

## Showroom Information
- **Dealership:** ${name}
- **Location:** ${address}, ${city}, Pakistan
- **Opening Hours:** ${hours}
- **Phone:** ${phone}
- **WhatsApp:** https://wa.me/${whatsappDigits}
- **Email:** ${email}

## Public Pages
- [Home](${siteUrl}/): Showroom overview, featured vehicles, and quick inventory search.
- [Vehicle Inventory](${siteUrl}/cars): Filterable catalog of pre-owned cars with specifications and pricing in PKR.
- [About Showroom](${siteUrl}/about): Dealership overview, physical viewing details, and documentation assistance.
- [Contact & Location](${siteUrl}/contact): Direct inquiry options, showroom address, and phone/WhatsApp details.
- [XML Sitemap](${siteUrl}/sitemap.xml): Complete list of public showroom pages and published vehicle listings.

## Data & Accuracy Notes
- Vehicle availability, pricing (PKR), mileage, and specifications are subject to change and should be confirmed on the individual listing page or directly with the showroom.
- Sold vehicle listings may remain accessible for reference and are marked as sold.
`

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  return content
})
