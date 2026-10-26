import { supabase } from './supabase'

export interface InquiryPayload {
  name: string
  email: string
  phone?: string
  interest: string
  message?: string
  propertySlug?: string | null
  source?: string
  consent?: boolean
}

interface DemoInquiry extends InquiryPayload {
  id: string
  created_at: string
}

const DEMO_STORAGE_KEY = 'hearth-and-form:inquiries'

function saveDemoInquiry(payload: InquiryPayload) {
  try {
    const existing = JSON.parse(window.localStorage.getItem(DEMO_STORAGE_KEY) ?? '[]') as DemoInquiry[]
    const inquiry: DemoInquiry = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify([...existing, inquiry]))
  } catch {
    // A demo submission should never block the thank-you state.
  }
}

async function saveToPrivateInbox(payload: InquiryPayload): Promise<boolean> {
  if (payload.source === 'newsletter') return false

  try {
    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    return response.ok
  } catch {
    return false
  }
}

/**
 * In production, inquiries go to the private Vercel Blob inbox used by the
 * hidden dashboard. Supabase remains a fallback if the private inbox is
 * unavailable. Local development keeps a localStorage fallback.
 */
export async function submitInquiry(payload: InquiryPayload): Promise<{ demo: boolean }> {
  if (await saveToPrivateInbox(payload)) {
    return { demo: false }
  }

  if (supabase) {
    const { error } = await supabase.from('inquiries').insert({
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone?.trim() || null,
      interest: payload.interest,
      message: payload.message?.trim() || null,
      property_slug: payload.propertySlug || null,
      source: payload.source ?? 'website',
    })

    if (error) {
      throw new Error(error.message)
    }

    return { demo: false }
  }

  saveDemoInquiry(payload)
  await new Promise((resolve) => window.setTimeout(resolve, 650))
  return { demo: true }
}
