import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLeadInquiryPayload, getInquirySuccessMessage } from '../app/utils/inquiry.ts'
import type { CarDetail } from '../app/types/car.ts'

const baseCar: CarDetail = {
  id: 42,
  brand: { id: 1, name: 'Changan', slug: 'changan' },
  model: 'Alsvin',
  variant: '1.5 DCT Lumiere',
  title: '2021 Changan Alsvin 1.5 DCT Lumiere',
  slug: 'alsvin-15-dct-lumiere-2021',
  year: 2021,
  price: 3800000,
  price_formatted: 'PKR 3,800,000',
  mileage: 35000,
  engine_capacity: 1500,
  transmission: 'automatic',
  fuel_type: 'petrol',
  exterior_color: 'White',
  registration_city: 'Lahore',
  assembly: 'local',
  status: 'available',
  is_featured: false,
  images: [],
}

test('buildLeadInquiryPayload sends car_id for available cars', () => {
  const payload = buildLeadInquiryPayload(baseCar, {
    customer_name: 'Ali',
    phone: '03001234567',
    message: 'Is it available for viewing today?',
  })

  assert.equal(payload.car_id, 42)
  assert.equal(payload.source, 'car_detail')
  assert.equal(payload.message, 'Is it available for viewing today?')
})

test('buildLeadInquiryPayload omits sold car_id and clarifies inquiry is for similar available cars', () => {
  const soldCar: CarDetail = { ...baseCar, status: 'sold' }

  const withoutCustomMessage = buildLeadInquiryPayload(soldCar, {
    customer_name: 'Bilal',
    phone: '03007654321',
    message: '   ',
  })

  assert.equal(withoutCustomMessage.car_id, null)
  assert.equal(withoutCustomMessage.source, 'sold_similar_inquiry')
  assert.equal(
    withoutCustomMessage.message,
    'Looking for available alternatives similar to the sold 2021 Changan Alsvin 1.5 DCT Lumiere.'
  )

  const withCustomMessage = buildLeadInquiryPayload(soldCar, {
    customer_name: 'Bilal',
    phone: '03007654321',
    message: 'Anything in white under 4M?',
  })

  assert.equal(withCustomMessage.car_id, null)
  assert.equal(
    withCustomMessage.message,
    'Looking for available alternatives similar to the sold 2021 Changan Alsvin 1.5 DCT Lumiere: Anything in white under 4M?'
  )
})

test('getInquirySuccessMessage returns distinct conditional messages for available, sold, and general inquiries', () => {
  const soldCar: CarDetail = { ...baseCar, status: 'sold' }

  const availMsg = getInquirySuccessMessage(baseCar)
  const soldMsg = getInquirySuccessMessage(soldCar)
  const generalMsg = getInquirySuccessMessage(null)

  assert.equal(availMsg.includes('vehicle details pre-filled'), true)
  assert.equal(soldMsg.includes('similar available vehicles'), true)
  assert.equal(soldMsg.includes('vehicle details pre-filled'), false)
  assert.equal(generalMsg.includes('WhatsApp has been launched.'), true)
})
