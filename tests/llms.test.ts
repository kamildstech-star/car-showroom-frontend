import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLlmsTxt } from '../server/utils/llms.ts'

test('buildLlmsTxt omits unverified details when API data is empty', () => {
  const txt = buildLlmsTxt('https://hassanmotors.pk/', {})

  assert.equal(txt.includes('# Hassan Motors'), true)
  assert.equal(txt.includes('**Dealership:** Hassan Motors'), true)
  assert.equal(txt.includes('**Location:**'), false)
  assert.equal(txt.includes('**Opening Hours:**'), false)
  assert.equal(txt.includes('**Phone:**'), false)
  assert.equal(txt.includes('**WhatsApp:**'), false)
  assert.equal(txt.includes('**Email:**'), false)
  assert.equal(txt.includes('documentation assistance'), false)
  assert.equal(txt.includes('/admin/'), false)
  assert.equal(txt.includes('https://hassanmotors.pk/sitemap.xml'), true)
})

test('buildLlmsTxt includes verified fields when provided by settings API', () => {
  const txt = buildLlmsTxt('https://hassanmotors.pk', {
    showroom_name: 'Hassan Motors',
    showroom_tagline: 'Quality Pre-Owned Cars',
    showroom_address: 'Main West Canal Road',
    showroom_city: 'Faisalabad',
    opening_hours: 'Mon - Sat: 10:00 AM - 08:00 PM',
    showroom_phone: '+92 304 1142642',
    showroom_whatsapp: '923041142642',
    showroom_email: 'info@hassanmotors.pk',
  })

  assert.equal(txt.includes('> Quality Pre-Owned Cars'), true)
  assert.equal(txt.includes('**Location:** Main West Canal Road, Faisalabad, Pakistan'), true)
  assert.equal(txt.includes('**Opening Hours:** Mon - Sat: 10:00 AM - 08:00 PM'), true)
  assert.equal(txt.includes('**Phone:** +92 304 1142642'), true)
  assert.equal(txt.includes('**WhatsApp:** https://wa.me/923041142642'), true)
  assert.equal(txt.includes('**Email:** info@hassanmotors.pk'), true)
  assert.equal(txt.includes('documentation assistance'), false)
})
