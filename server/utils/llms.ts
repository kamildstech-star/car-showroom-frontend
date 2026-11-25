export function buildLlmsTxt(
  siteUrl: string,
  apiData: Record<string, string | undefined> = {}
): string {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '')
  const name = apiData.showroom_name?.trim() || 'Hassan Motors'
  const tagline = apiData.showroom_tagline?.trim()
  const address = apiData.showroom_address?.trim()
  const city = apiData.showroom_city?.trim()
  const hours = apiData.opening_hours?.trim()
  const phone = apiData.showroom_phone?.trim()
  const whatsappDigits = apiData.showroom_whatsapp?.replace(/\D/g, '')
  const email = apiData.showroom_email?.trim()

  const lines: string[] = [`# ${name}`, '']

  if (tagline) {
    lines.push(`> ${tagline}`, '')
  }

  lines.push('## Showroom Information')
  lines.push(`- **Dealership:** ${name}`)

  const locationParts = [address, city].filter(Boolean)
  if (locationParts.length > 0) {
    lines.push(`- **Location:** ${locationParts.join(', ')}, Pakistan`)
  }
  if (hours) {
    lines.push(`- **Opening Hours:** ${hours}`)
  }
  if (phone) {
    lines.push(`- **Phone:** ${phone}`)
  }
  if (whatsappDigits) {
    lines.push(`- **WhatsApp:** https://wa.me/${whatsappDigits}`)
  }
  if (email) {
    lines.push(`- **Email:** ${email}`)
  }

  lines.push(
    '',
    '## Public Pages',
    `- [Home](${cleanSiteUrl}/): Featured vehicles, latest arrivals, and quick inventory search.`,
    `- [Vehicle Inventory](${cleanSiteUrl}/cars): Filterable catalog of vehicles with specifications and pricing in PKR.`,
    `- [About Showroom](${cleanSiteUrl}/about): Dealership overview and contact options.`,
    `- [Contact & Location](${cleanSiteUrl}/contact): Inquiry form and showroom contact details.`,
    `- [XML Sitemap](${cleanSiteUrl}/sitemap.xml): Index of public showroom pages and published vehicle listings.`,
    '',
    '## Data & Accuracy Notes',
    '- Vehicle availability, pricing (PKR), mileage, and specifications are subject to change and should be confirmed on the individual listing page or directly with the showroom.',
    '- Sold vehicle listings may remain accessible for reference and are marked as sold.',
    ''
  )

  return lines.join('\n')
}
