import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Eye,
  Globe2,
  LockKeyhole,
  LogOut,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { BrandMark } from './BrandMark'

const ADMIN_STORAGE_KEY = 'hearth-and-form:analytics-key'
const TABLE_LIMIT = 150
const regionNames =
  typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null

interface Visit {
  createdAt: string
  path: string
  source: string
  country: string
  city: string
  device: string
  browser: string
}

interface VisitSummary {
  total: number
  uniqueVisitors: number
  countries: number
  visitsToday: number
  mobileShare: number
}

interface VisitsResponse {
  visits: Visit[]
  summary: VisitSummary
  limited: boolean
  generatedAt: string
}

type Status = 'locked' | 'loading' | 'ready' | 'error'

function formatVisitTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown time'

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatExportTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function countryLabel(country: string): string {
  if (!country || country === 'Unknown') return 'Unknown'

  try {
    return regionNames?.of(country) ?? country
  } catch {
    return country
  }
}

function locationLabel(visit: Visit): string {
  return [visit.city, countryLabel(visit.country)].filter(Boolean).join(', ') || 'Unknown'
}

function csvCell(value: string): string {
  const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safeValue.replaceAll('"', '""')}"`
}

function downloadCsv(visits: Visit[]) {
  const header = ['Date and time', 'Page', 'Country', 'City', 'Device', 'Browser', 'Source']
  const rows = visits.map((visit) => [
    formatExportTime(visit.createdAt),
    visit.path,
    countryLabel(visit.country),
    visit.city,
    visit.device,
    visit.browser,
    visit.source,
  ])

  const csv = [header, ...rows].map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)

  link.href = url
  link.download = `hearth-and-form-visits-${date}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function AdminVisits() {
  const [accessKey, setAccessKey] = useState('')
  const [status, setStatus] = useState<Status>('locked')
  const [error, setError] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [visits, setVisits] = useState<Visit[]>([])
  const [summary, setSummary] = useState<VisitSummary | null>(null)
  const [limited, setLimited] = useState(false)
  const [generatedAt, setGeneratedAt] = useState('')
  const attemptedStoredKey = useRef(false)

  useEffect(() => {
    document.title = 'Private analytics — Hearth & Form'
    window.scrollTo(0, 0)

    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)

    return () => {
      document.title = 'Hearth & Form — Design-led homes in London & the Cotswolds'
      meta.remove()
    }
  }, [])

  const loadVisits = useCallback(async (key: string, remember: boolean) => {
    const trimmedKey = key.trim()
    if (!trimmedKey) {
      setError('Enter your analytics access key.')
      setStatus('locked')
      return
    }

    setStatus('loading')
    setError('')

    try {
      const response = await fetch(`/api/visits?limit=${TABLE_LIMIT}`, {
        headers: { Authorization: `Bearer ${trimmedKey}` },
      })

      if (response.status === 401) {
        try {
          window.sessionStorage.removeItem(ADMIN_STORAGE_KEY)
        } catch {
          // Ignore storage failures.
        }
        setIsUnlocked(false)
        setStatus('error')
        setError('That access key is not valid.')
        return
      }

      if (response.status === 404) {
        setStatus('error')
        setError('The analytics API only runs on the deployed site.')
        return
      }

      if (response.status === 503) {
        setStatus('error')
        setError('Visit storage is not connected yet. Add the required Vercel environment variables.')
        return
      }

      if (!response.ok) {
        throw new Error(`Analytics request failed with status ${response.status}.`)
      }

      const data = (await response.json()) as VisitsResponse
      if (!Array.isArray(data.visits) || !data.summary) {
        throw new Error('The analytics response was incomplete.')
      }

      if (remember) {
        try {
          window.sessionStorage.setItem(ADMIN_STORAGE_KEY, trimmedKey)
        } catch {
          // Ignore storage failures.
        }
      }

      setAccessKey(trimmedKey)
      setVisits(data.visits)
      setSummary(data.summary)
      setLimited(data.limited)
      setGeneratedAt(data.generatedAt)
      setIsUnlocked(true)
      setStatus('ready')
    } catch (loadError) {
      setStatus('error')
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load the visitor log. Please try again.',
      )
    }
  }, [])

  useEffect(() => {
    if (attemptedStoredKey.current) return
    attemptedStoredKey.current = true

    let storedKey = ''
    try {
      storedKey = window.sessionStorage.getItem(ADMIN_STORAGE_KEY) ?? ''
    } catch {
      // Ignore storage failures.
    }

    if (storedKey) {
      setAccessKey(storedKey)
      void loadVisits(storedKey, false)
    }
  }, [loadVisits])

  const topSources = useMemo(() => {
    const sources = new Map<string, number>()
    visits.forEach((visit) => {
      const source = visit.source || 'Direct'
      sources.set(source, (sources.get(source) ?? 0) + 1)
    })

    return Array.from(sources.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [visits])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void loadVisits(accessKey, true)
  }

  const handleLogout = () => {
    try {
      window.sessionStorage.removeItem(ADMIN_STORAGE_KEY)
    } catch {
      // Ignore storage failures.
    }

    setAccessKey('')
    setVisits([])
    setSummary(null)
    setError('')
    setIsUnlocked(false)
    setStatus('locked')
  }

  const refresh = () => {
    void loadVisits(accessKey, false)
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container admin-header-inner">
          <a className="brand" href="#home">
            <BrandMark className="brand-mark" />
            <span className="brand-type">
              Hearth <em>&amp;</em> Form
            </span>
          </a>
          <div className="admin-header-actions">
            <span className="admin-private-label">
              <LockKeyhole size={12} strokeWidth={1.8} aria-hidden="true" />
              Private
            </span>
            {isUnlocked ? (
              <button type="button" className="admin-header-action" onClick={handleLogout}>
                <LogOut size={13} strokeWidth={1.7} aria-hidden="true" />
                Lock
              </button>
            ) : (
              <a className="admin-header-action" href="#home">
                <ArrowLeft size={13} strokeWidth={1.7} aria-hidden="true" />
                Back to site
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="container">
          {!isUnlocked ? (
            <section className="admin-login" aria-labelledby="admin-login-title">
              <span className="admin-lock-mark" aria-hidden="true">
                <LockKeyhole size={22} strokeWidth={1.5} />
              </span>
              <p className="eyebrow">Private access</p>
              <h1 id="admin-login-title">Visitor log.</h1>
              <p className="admin-login-copy">
                Enter your analytics access key to see who has been visiting the site.
                This page is not linked anywhere on the website.
              </p>

              <form onSubmit={handleSubmit} className="admin-login-form">
                <label htmlFor="analytics-key">Access key</label>
                <input
                  id="analytics-key"
                  type="password"
                  value={accessKey}
                  onChange={(event) => setAccessKey(event.target.value)}
                  placeholder="Enter your private access key"
                  autoComplete="current-password"
                  autoFocus
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'analytics-error' : undefined}
                />
                {error ? (
                  <p className="admin-error" id="analytics-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="btn btn--dark"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      Checking access
                      <RefreshCw className="spin" size={15} strokeWidth={1.8} aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Unlock analytics
                      <Eye size={15} strokeWidth={1.7} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <p className="admin-privacy-note">
                <ShieldCheck size={14} strokeWidth={1.7} aria-hidden="true" />
                Anonymous visits only. No names, email addresses, raw IP addresses, or cookies
                are stored.
              </p>
            </section>
          ) : (
            <>
              <div className="admin-dashboard-head">
                <div>
                  <p className="eyebrow">
                    <span className="eyebrow-dot" aria-hidden="true" />
                    Private analytics
                  </p>
                  <h1>Visitor activity.</h1>
                  <p className="admin-dashboard-copy">
                    Anonymous visits to the public website. Updated every time you refresh.
                  </p>
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="admin-action-button"
                    onClick={refresh}
                    disabled={status === 'loading'}
                  >
                    <RefreshCw
                      className={status === 'loading' ? 'spin' : ''}
                      size={14}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                    Refresh
                  </button>
                  <button
                    type="button"
                    className="admin-action-button admin-action-button--primary"
                    onClick={() => downloadCsv(visits)}
                    disabled={!visits.length}
                  >
                    <Download size={14} strokeWidth={1.7} aria-hidden="true" />
                    Excel export
                  </button>
                </div>
              </div>

              {error ? (
                <p className="admin-load-error" role="alert">
                  {error}
                </p>
              ) : null}

              {summary ? (
                <div className="admin-kpis">
                  <div className="admin-kpi">
                    <span>
                      <Eye size={13} strokeWidth={1.7} aria-hidden="true" />
                      Page views
                    </span>
                    <strong>{summary.total}</strong>
                    <p>Latest {Math.min(summary.total, TABLE_LIMIT)} visits shown</p>
                  </div>
                  <div className="admin-kpi">
                    <span>
                      <Users size={13} strokeWidth={1.7} aria-hidden="true" />
                      Unique visitors
                    </span>
                    <strong>{summary.uniqueVisitors}</strong>
                    <p>Approximate, based on anonymous device signals</p>
                  </div>
                  <div className="admin-kpi">
                    <span>
                      <Globe2 size={13} strokeWidth={1.7} aria-hidden="true" />
                      Countries
                    </span>
                    <strong>{summary.countries}</strong>
                    <p>{summary.visitsToday} visits recorded today</p>
                  </div>
                  <div className="admin-kpi">
                    <span>
                      <MonitorSmartphone size={13} strokeWidth={1.7} aria-hidden="true" />
                      Mobile share
                    </span>
                    <strong>{summary.mobileShare}%</strong>
                    <p>Visits from phones</p>
                  </div>
                </div>
              ) : null}

              {topSources.length ? (
                <div className="admin-sources">
                  <span className="admin-section-label">Top sources</span>
                  <div className="admin-source-list">
                    {topSources.map(([source, count]) => (
                      <span className="admin-source" key={source}>
                        {source} <strong>{count}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <section className="admin-panel" aria-labelledby="recent-visits-title">
                <div className="admin-panel-head">
                  <div>
                    <p className="admin-section-label">Latest activity</p>
                    <h2 id="recent-visits-title">Recent visits</h2>
                  </div>
                  <span className="admin-updated">
                    <CalendarDays size={12} strokeWidth={1.7} aria-hidden="true" />
                    {generatedAt ? formatVisitTime(generatedAt) : 'Not refreshed'}
                  </span>
                </div>

                {status === 'loading' && !visits.length ? (
                  <p className="admin-empty">Loading visitor activity…</p>
                ) : visits.length ? (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th scope="col">When</th>
                          <th scope="col">Page</th>
                          <th scope="col">Location</th>
                          <th scope="col">Device</th>
                          <th scope="col">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visits.map((visit) => (
                          <tr key={`${visit.createdAt}-${visit.path}-${visit.source}-${visit.browser}`}>
                            <td>
                              <time dateTime={visit.createdAt}>
                                {formatVisitTime(visit.createdAt)}
                              </time>
                            </td>
                            <td>
                              <span className="admin-path">{visit.path}</span>
                            </td>
                            <td>{locationLabel(visit)}</td>
                            <td>
                              {visit.device}
                              <span className="admin-cell-sub">{visit.browser}</span>
                            </td>
                            <td>{visit.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="admin-empty">
                    No visits recorded yet. Share the site and check back soon.
                  </p>
                )}

                {limited ? (
                  <p className="admin-limited-note">
                    Showing the latest {TABLE_LIMIT} visits. Older visits remain in the private
                    storage log.
                  </p>
                ) : null}
              </section>

              <p className="admin-dashboard-note">
                <ShieldCheck size={14} strokeWidth={1.7} aria-hidden="true" />
                Private analytics. Visits are anonymous: no names, emails, raw IP addresses, or
                cookies are stored. Approximate location comes from network headers.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
