import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildBreadcrumbJsonLd,
  buildCarJsonLd,
  buildFactualCarDescription,
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
  images: [],
}

const sampleShowroom = {
  showroom_name: 'Hassan Motors',
  showroom_address: 'Main West Canal Road',
  showroom_city: 'Faisalabad',
  showroom_phone: '+92 304 1142642',
}

test('buildFactualCarDescription uses only verified fields and omits unverified claims', () => {
  const text = buildFactualCarDescription(sampleCar, sampleShowroom)

  assert.equal(text.includes('2021 Honda Civic VTi Oriel'), true)
  assert.equal(text.includes('Hassan Motors'), true)
  assert.equal(text.includes('Main West Canal Road, Faisalabad'), true)
  assert.equal(text.includes('42,000 km recorded mileage'), true)
  assert.equal(text.includes('1800 cc engine'), true)
  assert.equal(/accident-free|non-accidental|certified|guaranteed|inspected|genuine/i.test(text), false)
})

test('buildCarJsonLd generates valid Car schema for available and sold cars without fake reviews', () => {
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
  assert.equal(availableSchema.brand.name, 'Honda')
  assert.equal(availableSchema.offers.availability, 'https://schema.org/InStock')
  assert.equal(availableSchema.offers.seller['@id'], 'https://hassanmotors.pk/#dealer')
  assert.equal(availableSchema.aggregateRating, undefined)
  assert.equal(availableSchema.review, undefined)

  const soldCar: CarDetail = { ...sampleCar, status: 'sold', mileage: null, exterior_color: null, price: 0 }
  const soldSchema = JSON.parse(
    JSON.stringify(
      buildCarJsonLd(
        soldCar,
        'https://hassanmotors.pk/cars/2021-honda-civic-vti-oriel',
        'https://hassanmotors.pk',
        sampleShowroom,
        buildFactualCarDescription(soldCar, sampleShowroom)
      )
    )
  )

  assert.equal(soldSchema.offers.availability, 'https://schema.org/SoldOut')
  assert.equal(soldSchema.offers.price, undefined)
  assert.equal(soldSchema.mileageFromOdometer, undefined)
  assert.equal(soldSchema.color, undefined)
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
