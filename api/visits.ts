import type { VercelRequest, VercelResponse } from '@vercel/node'
import { get, list } from '@vercel/blob'
import { timingSafeEqual } from 'node:crypto'

const MAX_VISITS = 150
const FETCH_BATCH_SIZE = 15

interface StoredVisit {
  createdAt: string
  path: string
  source: string
  country: string
  city: string
  device: string
  browser: string
  visitorHash: string
}

type PublicVisit = Omit<StoredVisit, 'visitorHash'>

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const adminKey = process.env.ANALYTICS_ADMIN_KEY
  if (!adminKey) {
    return res.status(503).json({ error: 'Analytics access is not configured yet.' })
  }

  if (!safeEqual(getBearerToken(req), adminKey)) {
    return res.status(401).json({ error: 'Invalid access key.' })
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  if (!blobToken) {
    return res.status(503).json({ error: 'Visit storage is not configured yet.' })
  }

  try {
    const listing = await list({
      prefix: 'visits/',
      limit: 250,
      token: blobToken,
    })

    const recentBlobs = listing.blobs
      .slice()
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .slice(0, MAX_VISITS)

    const storedVisits: StoredVisit[] = []

    for (let index = 0; index < recentBlobs.length; index += FETCH_BATCH_SIZE) {
      const batch = recentBlobs.slice(index, index + FETCH_BATCH_SIZE)
      const resolved = await Promise.all(
        batch.map(async (blob) => {
          try {
            const text = await readBlobText(blob.pathname, blobToken)
            if (!text) return null
            return JSON.parse(text) as StoredVisit
          } catch {
            return null
          }
        }),
      )

      for (const visit of resolved) {
        if (visit) storedVisits.push(visit)
      }
    }

    const visits: PublicVisit[] = storedVisits.map((visit) => ({
      createdAt: visit.createdAt,
      path: visit.path,
      source: visit.source,
      country: visit.country,
      city: visit.city,
      device: visit.device,
      browser: visit.browser,
    }))

    const uniqueVisitors = new Set(storedVisits.map((visit) => visit.visitorHash)).size
    const countries = new Set(storedVisits.map((visit) => visit.country)).size
    const today = new Date().toISOString().slice(0, 10)
    const visitsToday = storedVisits.filter((visit) => visit.createdAt.startsWith(today)).length
    const mobileVisits = storedVisits.filter((visit) => visit.device === 'Mobile').length

    return res.status(200).json({
      visits,
      summary: {
        total: visits.length,
        uniqueVisitors,
        countries,
        visitsToday,
        mobileShare: visits.length ? Math.round((mobileVisits / visits.length) * 100) : 0,
      },
      limited:
        listing.hasMore ||
        listing.blobs.length > MAX_VISITS ||
        storedVisits.length < recentBlobs.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error(
      '[analytics] Failed to load visits:',
      error instanceof Error ? error.message : error,
    )
    return res.status(500).json({ error: 'Could not load visit data.' })
  }
}
