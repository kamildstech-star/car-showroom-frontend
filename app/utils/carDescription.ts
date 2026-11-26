import type { CarDetail } from '~/types/car'

export interface ShowroomSchemaInfo {
  showroom_name: string
  showroom_address: string
  showroom_city: string
  showroom_phone: string
}

export function buildFactualCarDescription(
  car: CarDetail,
  showroom: Pick<ShowroomSchemaInfo, 'showroom_name' | 'showroom_address' | 'showroom_city'>
): string {
  const locationParts = [showroom.showroom_address, showroom.showroom_city].filter(Boolean)
  const locationText = locationParts.length > 0 ? ` in ${locationParts.join(', ')}` : ''
  const titleWithYear = car.title.includes(String(car.year))
    ? car.title
    : `${car.year} ${car.title}`
  const hasVariantInTitle =
    Boolean(car.variant) &&
    car.title.toLowerCase().includes(car.variant!.trim().toLowerCase())
  const variantText = car.variant && !hasVariantInTitle ? ` (${car.variant})` : ''

  const statusSentence =
    car.status === 'sold'
      ? `${titleWithYear}${variantText} previously listed at ${showroom.showroom_name}${locationText}. This vehicle is currently marked as sold.`
      : `${titleWithYear}${variantText} listed at ${showroom.showroom_name}${locationText}${car.price_formatted ? ` at ${car.price_formatted}` : ''}.`

  const specs: string[] = []
  if (car.transmission) specs.push(`${car.transmission} transmission`)
  if (car.fuel_type) specs.push(`${car.fuel_type} fuel`)
  if (car.engine_capacity) specs.push(`${car.engine_capacity} cc engine`)
  if (car.mileage !== null && car.mileage !== undefined) {
    specs.push(`${car.mileage.toLocaleString('en-US')} km recorded mileage`)
  }
  if (car.exterior_color) specs.push(`${car.exterior_color} exterior`)
  if (car.registration_city) specs.push(`${car.registration_city} registration`)
  if (car.assembly) specs.push(`${car.assembly} assembly`)

  if (specs.length === 0) {
    return statusSentence
  }

  return `${statusSentence} Recorded specifications: ${specs.join(', ')}.`
}

export function buildCarJsonLd(
  car: CarDetail,
  canonicalUrl: string,
  siteUrl: string,
  showroom: ShowroomSchemaInfo,
  description: string
): Record<string, unknown> {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '')
  const imageUrls = (car.images || [])
    .map((img) => img.url)
    .filter((url): url is string => Boolean(url))

  if (imageUrls.length === 0 && car.primary_image?.url) {
    imageUrls.push(car.primary_image.url)
  }

  const numericPrice = Number(car.price)

  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    priceCurrency: 'PKR',
    availability:
      car.status === 'available'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
    itemCondition: 'https://schema.org/UsedCondition',
    url: canonicalUrl,
    seller: {
      '@type': 'AutoDealer',
      '@id': `${cleanSiteUrl}/#dealer`,
      name: showroom.showroom_name,
      telephone: showroom.showroom_phone,
    },
  }

  if (Number.isFinite(numericPrice) && numericPrice > 0) {
    offer.price = numericPrice
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    '@id': `${canonicalUrl}#car`,
    name: car.title,
    url: canonicalUrl,
    description,
    brand: car.brand?.name
      ? {
          '@type': 'Brand',
          name: car.brand.name,
        }
      : undefined,
    model: car.model,
    vehicleConfiguration: car.variant || undefined,
    vehicleModelDate: String(car.year),
    mileageFromOdometer:
      car.mileage !== null && car.mileage !== undefined
        ? {
            '@type': 'QuantitativeValue',
            value: car.mileage,
            unitCode: 'KMT',
          }
        : undefined,
    vehicleTransmission: car.transmission,
    fuelType: car.fuel_type,
    vehicleEngine: car.engine_capacity
      ? {
          '@type': 'EngineSpecification',
          engineDisplacement: {
            '@type': 'QuantitativeValue',
            value: car.engine_capacity,
            unitCode: 'CMQ',
          },
        }
      : undefined,
    color: car.exterior_color || undefined,
    image: imageUrls.length > 0 ? imageUrls : undefined,
    offers: offer,
  }
}

export function buildBreadcrumbJsonLd(
  carTitle: string,
  canonicalUrl: string,
  siteUrl: string
): Record<string, unknown> {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '')
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${cleanSiteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Inventory',
        item: `${cleanSiteUrl}/cars`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: carTitle,
        item: canonicalUrl,
      },
    ],
  }
}
