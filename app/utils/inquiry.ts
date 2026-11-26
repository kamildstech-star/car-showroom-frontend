import type { CarDetail, CarListItem, LeadSubmissionPayload } from '~/types/car'

export interface InquiryFormInput {
  customer_name: string
  phone: string
  message: string
  website?: string
}

export function buildLeadInquiryPayload(
  car: CarDetail | CarListItem | null | undefined,
  form: InquiryFormInput
): LeadSubmissionPayload {
  const trimmedMessage = form.message.trim()

  if (car && car.status === 'sold') {
    const similarContext = `Looking for available alternatives similar to the sold ${car.title}`
    return {
      customer_name: form.customer_name,
      phone: form.phone,
      message: trimmedMessage ? `${similarContext}: ${trimmedMessage}` : `${similarContext}.`,
      car_id: null,
      source: 'sold_similar_inquiry',
      website: form.website || undefined,
    }
  }

  return {
    customer_name: form.customer_name,
    phone: form.phone,
    message: trimmedMessage || undefined,
    car_id: car ? car.id : null,
    source: car ? 'car_detail' : 'contact_page',
    website: form.website || undefined,
  }
}
