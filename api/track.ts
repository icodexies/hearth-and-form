import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put } from '@vercel/blob'
import { createHash, randomUUID } from 'node:crypto'

const BOT_PATTERN = /bot|crawler|spider|headless|preview|monitor|uptime|pingdom|pagespeed/i
const MAX_PATH_LENGTH = 180

interface VisitPayload {
  path?: unknown
  referrer?: unknown
}

interface VisitRecord {
  createdAt: string
  path: string
  source: string
  country: string
  city: string
  device: string
  browser: string
  visitorHash: string
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

function cleanPath(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const pathname = value.split(/[?#]/)[0]

  if (!pathname.startsWith('/') || pathname.startsWith('//')) return null
  if (pathname.startsWith('/api') || pathname.startsWith('/studio')) return null

  return pathname.slice(0, MAX_PATH_LENGTH)
}

function decodeHeader(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function getSource(referrer: string, requestHost: string): string {
  if (!referrer) return 'Direct'

  try {
    const hostname = new URL(referrer).hostname.replace(/^www\./, '')
    if (!hostname || hostname === requestHost.replace(/^www\./, '')) return 'Direct'
    return cleanText(hostname, 80)
  } catch {
    return 'Direct'
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  if (!blobToken) {
    return res.status(204).end()
  }

  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as VisitPayload
    const path = cleanPath(body?.path) ?? '/'
    const userAgent = headerValue(req.headers['user-agent'])

    if (!userAgent || BOT_PATTERN.test(userAgent)) {
      return res.status(204).end()
    }

    const ip = headerValue(req.headers['x-forwarded-for']).split(',')[0]?.trim() ?? ''
    const salt = process.env.VISIT_HASH_SALT ?? ''
    const requestHost = headerValue(req.headers.host).split(':')[0] ?? ''
    const referrer = cleanText(body?.referrer, 2000)
    const city = decodeHeader(headerValue(req.headers['x-vercel-ip-city']))
    const country = decodeHeader(headerValue(req.headers['x-vercel-ip-country']))

    const visitorHash = createHash('sha256')
      .update(`${salt}|${ip}|${userAgent}`)
      .digest('hex')
      .slice(0, 24)

    const visit: VisitRecord = {
      createdAt: new Date().toISOString(),
      path,
      source: getSource(referrer, requestHost),
      country: cleanText(country, 60) || 'Unknown',
      city: cleanText(city, 80),
      device: getDevice(userAgent),
      browser: getBrowser(userAgent),
      visitorHash,
    }

    const pathname = `visits/${String(Date.now()).padStart(13, '0')}-${randomUUID()}.json`

    await put(pathname, JSON.stringify(visit), {
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
      token: blobToken,
    })

    return res.status(204).end()
  } catch (error) {
    console.error(
      '[analytics] Failed to record visit:',
      error instanceof Error ? error.message : error,
    )
    return res.status(204).end()
  }
}
