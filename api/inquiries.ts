import type { VercelRequest, VercelResponse } from '@vercel/node'
import { get, list, put } from '@vercel/blob'
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'

const BOT_PATTERN = /bot|crawler|spider|headless|preview|monitor|uptime|pingdom|pagespeed/i
const MAX_INQUIRIES = 150
const FETCH_BATCH_SIZE = 15
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALLOWED_SOURCES = new Set(['website', 'property', 'newsletter'])

interface StoredInquiry {
  createdAt: string
  name: string
  email: string
  phone: string
  interest: string
  message: string
  propertySlug: string
  source: string
  country: string
  city: string
  device: string
  browser: string
  visitorId: string
  consent: boolean
}

interface InquirySummary {
  total: number
  today: number
  withPhone: number
  propertyInquiries: number
}

function headerValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''

  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0)
      return code >= 32 && code !== 127
    })
    .join('')
    .trim()
    .slice(0, maxLength)
}

function cleanMessage(value: unknown): string {
  if (typeof value !== 'string') return ''

  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0)
      return code === 9 || code === 10 || (code >= 32 && code !== 127)
    })
    .join('')
    .trim()
    .slice(0, 4000)
}

function decodeHeader(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function getDevice(userAgent: string): string {
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return 'Tablet'
  if (/mobi|android|iphone|ipod/i.test(userAgent)) return 'Mobile'
  return 'Desktop'
}

function getBrowser(userAgent: string): string {
  if (/edg\//i.test(userAgent)) return 'Edge'
  if (/opr\/|opera/i.test(userAgent)) return 'Opera'
  if (/firefox|fxios/i.test(userAgent)) return 'Firefox'
  if (/chrome|crios/i.test(userAgent)) return 'Chrome'
  if (/safari/i.test(userAgent)) return 'Safari'
  return 'Other'
}

function getBearerToken(req: VercelRequest): string {
  const authorization = req.headers.authorization

  if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim()
  }

  const headerKey = req.headers['x-admin-key']
  return typeof headerKey === 'string' ? headerKey.trim() : ''
}

function safeEqual(value: string, expected: string): boolean {
  const provided = Buffer.from(value)
  const target = Buffer.from(expected)

  return provided.length === target.length && timingSafeEqual(provided, target)
}

async function readBlobText(pathname: string, token: string): Promise<string | null> {
  const blob = await get(pathname, {
    access: 'private',
    useCache: false,
    token,
  })

  if (!blob || blob.statusCode !== 200 || !blob.stream) return null
  return new Response(blob.stream).text()
}

async function storeInquiry(req: VercelRequest, res: VercelResponse) {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  if (!blobToken) {
    return res.status(503).json({ error: 'Inquiry storage is not configured yet.' })
  }

  const userAgent = headerValue(req.headers['user-agent'])

  if (!userAgent || BOT_PATTERN.test(userAgent)) {
    return res.status(202).json({ ok: true })
  }

  let payload: Record<string, unknown>
  try {
    payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Record<
      string,
      unknown
    >
  } catch {
    return res.status(400).json({ error: 'Invalid inquiry data.' })
  }

  const name = cleanText(payload?.name, 120)
  const email = cleanText(payload?.email, 254).toLowerCase()
  const phone = cleanText(payload?.phone, 50)
  const interest = cleanText(payload?.interest, 80) || 'General enquiry'
  const message = cleanMessage(payload?.message)
  const propertySlug = cleanText(payload?.propertySlug, 80)
  const rawSource = cleanText(payload?.source, 30)
  const source = ALLOWED_SOURCES.has(rawSource) ? rawSource : 'website'
  const consent = payload?.consent === true

  if (name.length < 2) {
    return res.status(400).json({ error: 'Please provide a valid name.' })
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' })
  }

  if (!consent) {
    return res.status(400).json({ error: 'Consent is required to submit an inquiry.' })
  }

  const country = decodeHeader(headerValue(req.headers['x-vercel-ip-country']))
  const city = decodeHeader(headerValue(req.headers['x-vercel-ip-city']))
  const ip = headerValue(req.headers['x-forwarded-for']).split(',')[0]?.trim() ?? ''
  const salt = process.env.VISIT_HASH_SALT ?? ''
  const visitorHash = createHash('sha256')
    .update(`${salt}|${ip}|${userAgent}`)
    .digest('hex')
    .slice(0, 24)
  const visitorId = `HF-${visitorHash.slice(0, 6).toUpperCase()}`

  const inquiry: StoredInquiry = {
    createdAt: new Date().toISOString(),
    name,
    email,
    phone,
    interest,
    message,
    propertySlug,
    source,
    country: cleanText(country, 60) || 'Unknown',
    city: cleanText(city, 80),
    device: getDevice(userAgent),
    browser: getBrowser(userAgent),
    visitorId,
    consent,
  }

  const pathname = `inquiries/${String(Date.now()).padStart(13, '0')}-${randomUUID()}.json`

  await put(pathname, JSON.stringify(inquiry), {
    access: 'private',
    addRandomSuffix: false,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
    token: blobToken,
  })

  return res.status(201).json({ ok: true })
}

async function listInquiries(req: VercelRequest, res: VercelResponse) {
  const adminKey = process.env.ANALYTICS_ADMIN_KEY
  if (!adminKey) {
    return res.status(503).json({ error: 'Inquiry access is not configured yet.' })
  }

  if (!safeEqual(getBearerToken(req), adminKey)) {
    return res.status(401).json({ error: 'Invalid access key.' })
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  if (!blobToken) {
    return res.status(503).json({ error: 'Inquiry storage is not configured yet.' })
  }

  const listing = await list({
    prefix: 'inquiries/',
    limit: 250,
    token: blobToken,
  })

  const recentBlobs = listing.blobs
    .slice()
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    .slice(0, MAX_INQUIRIES)

  const inquiries: StoredInquiry[] = []

  for (let index = 0; index < recentBlobs.length; index += FETCH_BATCH_SIZE) {
    const batch = recentBlobs.slice(index, index + FETCH_BATCH_SIZE)
    const resolved = await Promise.all(
      batch.map(async (blob) => {
        try {
          const text = await readBlobText(blob.pathname, blobToken)
          if (!text) return null
          return JSON.parse(text) as StoredInquiry
        } catch {
          return null
        }
      }),
    )

    for (const inquiry of resolved) {
      if (inquiry) inquiries.push(inquiry)
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const summary: InquirySummary = {
    total: inquiries.length,
    today: inquiries.filter((inquiry) => inquiry.createdAt.startsWith(today)).length,
    withPhone: inquiries.filter((inquiry) => inquiry.phone).length,
    propertyInquiries: inquiries.filter((inquiry) => inquiry.propertySlug).length,
  }

  return res.status(200).json({
    inquiries,
    summary,
    limited:
      listing.hasMore ||
      listing.blobs.length > MAX_INQUIRIES ||
      inquiries.length < recentBlobs.length,
    generatedAt: new Date().toISOString(),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')

  try {
    if (req.method === 'POST') {
      return await storeInquiry(req, res)
    }

    if (req.method === 'GET') {
      return await listInquiries(req, res)
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (error) {
    console.error(
      '[inquiries] Request failed:',
      error instanceof Error ? error.message : error,
    )
    return res.status(500).json({ error: 'Could not process the inquiry request.' })
  }
}
