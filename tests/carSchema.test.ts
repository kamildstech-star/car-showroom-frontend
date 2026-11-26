import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildBreadcrumbJsonLd,
  buildCarJsonLd,
  buildFactualCarDescription,
  getVehicleViewingNotice,
} from '../app/utils/carDescription.ts'
import type { CarDetail } from '../app/types/car.ts'

const sampleCar: CarDetail = {
  id: 1,
  brand: { id: 1, name: 'Honda', slug: 'honda' },
  model: 'Civic',
  variant: 'VTi Oriel',
  title: '2021 Honda Civic VTi Oriel',
  slug: '2021-honda-civic-vti-oriel',
  year: 2021,
  price: 6500000,
  price_formatted: 'PKR 6,500,000',
  mileage: 42000,
  engine_capacity: 1800,
  transmission: 'automatic',
  fuel_type: 'petrol',
  exterior_color: 'White',
  registration_city: 'Lahore',
  assembly: 'local',
  status: 'available',
  is_featured: true,
  description: null,
  images: [
    {
      id: 10,
      car_id: 1,
      image_path: 'cars/civic.jpg',
      url: 'https://api.hassanmotors.pk/storage/cars/civic.jpg',
      thumbnail_url: 'https://api.hassanmotors.pk/storage/cars/civic-thumb.jpg',
      is_primary: true,
      sort_order: 1,
    },
  ],
}

const sampleShowroom = {
  showroom_name: 'Hassan Motors',
  showroom_address: 'Main West Canal Road',
  showroom_city: 'Faisalabad',
  showroom_phone: '+92 304 1142642',
}

test('buildFactualCarDescription avoids duplicating variant/year in available and sold titles', () => {
  const availText = buildFactualCarDescription(sampleCar, sampleShowroom)
  assert.equal(availText.includes('VTi Oriel (VTi Oriel)'), false)
  assert.equal(availText.includes('2021 2021'), false)
  assert.equal(availText.includes('2021 Honda Civic VTi Oriel listed at Hassan Motors'), true)
  assert.equal(/accident-free|non-accidental|certified|guaranteed|inspected|genuine/i.test(availText), false)

  const soldCar: CarDetail = { ...sampleCar, status: 'sold' }
  const soldText = buildFactualCarDescription(soldCar, sampleShowroom)
  assert.equal(soldText.includes('VTi Oriel (VTi Oriel)'), false)
  assert.equal(soldText.includes('2021 2021'), false)
  assert.equal(soldText.startsWith('2021 Honda Civic VTi Oriel previously listed at Hassan Motors'), true)
  assert.equal(soldText.includes('This vehicle is currently marked as sold.'), true)
})

test('buildFactualCarDescription appends variant only when missing from title', () => {
  const noVariantInTitle: CarDetail = {
    ...sampleCar,
    title: 'Honda Civic',
    variant: 'RS Turbo',
  }
  const text = buildFactualCarDescription(noVariantInTitle, sampleShowroom)
  assert.equal(text.startsWith('2021 Honda Civic (RS Turbo) listed at'), true)
})

test('buildCarJsonLd matches visible details for available and sold cars without fake reviews', () => {
  const desc = buildFactualCarDescription(sampleCar, sampleShowroom)
  const availableSchema = JSON.parse(
    JSON.stringify(
      buildCarJsonLd(
        sampleCar,
        'https://hassanmotors.pk/cars/2021-honda-civic-vti-oriel',
        'https://hassanmotors.pk',
        sampleShowroom,
        desc
      )
    )
  )

  assert.equal(availableSchema['@type'], 'Car')
  assert.equal(availableSchema['@id'], 'https://hassanmotors.pk/cars/2021-honda-civic-vti-oriel#car')
  assert.equal(availableSchema.name, sampleCar.title)
  assert.equal(availableSchema.model, sampleCar.model)
  assert.equal(availableSchema.vehicleModelDate, String(sampleCar.year))
  assert.equal(availableSchema.vehicleTransmission, sampleCar.transmission)
  assert.equal(availableSchema.fuelType, sampleCar.fuel_type)
  assert.equal(availableSchema.description, desc)
  assert.equal(availableSchema.brand.name, 'Honda')
  assert.deepEqual(availableSchema.image, ['https://api.hassanmotors.pk/storage/cars/civic.jpg'])
  assert.equal(availableSchema.offers.price, 6500000)
  assert.equal(availableSchema.offers.availability, 'https://schema.org/InStock')
  assert.equal(availableSchema.offers.seller['@id'], 'https://hassanmotors.pk/#dealer')
  assert.equal(availableSchema.offers.seller.name, sampleShowroom.showroom_name)
  assert.equal(availableSchema.offers.seller.telephone, sampleShowroom.showroom_phone)
  assert.equal(availableSchema.aggregateRating, undefined)
  assert.equal(availableSchema.review, undefined)
})

test('buildCarJsonLd omits missing optional fields and images cleanly', () => {
  const minimalCar: CarDetail = {
    id: 2,
    brand: undefined,
    model: 'Alto',
    variant: null,
    title: 'Suzuki Alto 2022',
    slug: 'suzuki-alto-2022',
    year: 2022,
    price: 0,
    price_formatted: 'PKR 0',
    mileage: null,
    engine_capacity: null,
    transmission: 'manual',
    fuel_type: 'petrol',
    exterior_color: null,
    registration_city: null,
    assembly: null,
    status: 'sold',
    is_featured: false,
    images: [],
    primary_image: null,
  }

  const schema = JSON.parse(
    JSON.stringify(
      buildCarJsonLd(
        minimalCar,
        'https://hassanmotors.pk/cars/suzuki-alto-2022',
        'https://hassanmotors.pk',
        sampleShowroom,
        buildFactualCarDescription(minimalCar, sampleShowroom)
      )
    )
  )

  assert.equal(schema.brand, undefined)
  assert.equal(schema.vehicleConfiguration, undefined)
  assert.equal(schema.mileageFromOdometer, undefined)
  assert.equal(schema.vehicleEngine, undefined)
  assert.equal(schema.color, undefined)
  assert.equal(schema.image, undefined)
  assert.equal(schema.offers.availability, 'https://schema.org/SoldOut')
  assert.equal(schema.offers.price, undefined)
})

test('buildBreadcrumbJsonLd generates 3-level BreadcrumbList', () => {
  const bc = buildBreadcrumbJsonLd(
    '2021 Honda Civic VTi Oriel',
    'https://hassanmotors.pk/cars/2021-honda-civic-vti-oriel',
    'https://hassanmotors.pk/'
  ) as { '@type': string; itemListElement: Array<{ position: number; name: string; item: string }> }

  assert.equal(bc['@type'], 'BreadcrumbList')
  assert.equal(bc.itemListElement.length, 3)
  assert.equal(bc.itemListElement[1]?.item, 'https://hassanmotors.pk/cars')
  assert.equal(bc.itemListElement[2]?.name, '2021 Honda Civic VTi Oriel')
})

test('getVehicleViewingNotice differentiates available viewing from sold alternative notice without inspection claims', () => {
  const availNotice = getVehicleViewingNotice('available', 'Hassan Motors', 'Main West Canal Road, Faisalabad, Pakistan')
  const soldNotice = getVehicleViewingNotice('sold', 'Hassan Motors', 'Main West Canal Road, Faisalabad, Pakistan')

  assert.equal(availNotice.title, 'Showroom Viewing')
  assert.equal(availNotice.body.includes('view this vehicle in person'), true)
  assert.equal(/inspection/i.test(availNotice.body), false)

  assert.equal(soldNotice.title, 'Looking for a Similar Vehicle?')
  assert.equal(soldNotice.body.includes('no longer available for viewing'), true)
  assert.equal(soldNotice.body.includes('view this vehicle in person'), false)
})
