import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Eye,
  Globe2,
  Inbox,
  LockKeyhole,
  LogOut,
  Mail,
  MonitorSmartphone,
  Phone,
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

interface Inquiry {
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
  consent: boolean
}

interface InquirySummary {
  total: number
  today: number
  withPhone: number
  propertyInquiries: number
}

interface InquiriesResponse {
  inquiries: Inquiry[]
  summary: InquirySummary
  limited: boolean
  generatedAt: string
}

type Status = 'locked' | 'loading' | 'ready' | 'error'
type InquiriesStatus = 'idle' | 'loading' | 'ready' | 'error'
type DashboardTab = 'visitors' | 'inquiries'

function formatClockTime(date: Date): string {
  const hours24 = date.getHours()
  const hours12 = hours24 % 12 || 12
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const meridiem = hours24 >= 12 ? 'PM' : 'AM'

  return `${hours12}:${minutes} ${meridiem}`
}

function formatVisitTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown time'

  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)

  return `${datePart}, ${formatClockTime(date)}`
}

function formatExportTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const datePart = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)

  return `${datePart} ${formatClockTime(date)}`
}

function countryLabel(country: string): string {
  if (!country || country === 'Unknown') return 'Unknown'

  try {
    return regionNames?.of(country) ?? country
  } catch {
    return country
  }
}

function formatLocation(city: string, country: string): string {
  return [city, countryLabel(country)].filter(Boolean).join(', ') || 'Unknown'
}

function locationLabel(visit: Visit): string {
  return formatLocation(visit.city, visit.country)
}

function propertyLabel(slug: string): string {
  if (!slug) return 'General enquiry'

  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function sourceLabel(source: string): string {
  if (source === 'property') return 'Property page'
  if (source === 'website') return 'Website form'
  if (source === 'newsletter') return 'Newsletter'
  return source || 'Website'
}

function csvCell(value: string): string {
  const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safeValue.replaceAll('"', '""')}"`
}

function downloadCsvFile(filename: string, header: string[], rows: string[][]) {
  const csv = [header, ...rows].map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)

  link.href = url
  link.download = `${filename}-${date}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function downloadVisitsCsv(visits: Visit[]) {
  downloadCsvFile(
    'hearth-and-form-visits',
    ['Date and time', 'Page', 'Country', 'City', 'Device', 'Browser', 'Source'],
    visits.map((visit) => [
      formatExportTime(visit.createdAt),
      visit.path,
      countryLabel(visit.country),
      visit.city,
      visit.device,
      visit.browser,
      visit.source,
    ]),
  )
}

function downloadInquiriesCsv(inquiries: Inquiry[]) {
  downloadCsvFile(
    'hearth-and-form-inquiries',
    [
      'Date and time',
      'Name',
      'Email',
      'Phone',
      'Interest',
      'Message',
      'Property',
      'Source',
      'Country',
      'City',
      'Device',
      'Browser',
      'Consent',
    ],
    inquiries.map((inquiry) => [
      formatExportTime(inquiry.createdAt),
      inquiry.name,
      inquiry.email,
      inquiry.phone,
      inquiry.interest,
      inquiry.message,
      propertyLabel(inquiry.propertySlug),
      sourceLabel(inquiry.source),
      countryLabel(inquiry.country),
      inquiry.city,
      inquiry.device,
      inquiry.browser,
      inquiry.consent ? 'Yes' : 'No',
    ]),
  )
}

export function AdminVisits() {
  const [accessKey, setAccessKey] = useState(() => {
    try {
      return window.sessionStorage.getItem(ADMIN_STORAGE_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [status, setStatus] = useState<Status>('locked')
  const [error, setError] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [activeTab, setActiveTab] = useState<DashboardTab>('visitors')

  const [visits, setVisits] = useState<Visit[]>([])
  const [summary, setSummary] = useState<VisitSummary | null>(null)
  const [limited, setLimited] = useState(false)
  const [generatedAt, setGeneratedAt] = useState('')

  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [inquirySummary, setInquirySummary] = useState<InquirySummary | null>(null)
  const [inquiriesStatus, setInquiriesStatus] = useState<InquiriesStatus>('idle')
  const [inquiriesError, setInquiriesError] = useState('')
  const [inquiriesLimited, setInquiriesLimited] = useState(false)
  const [inquiriesGeneratedAt, setInquiriesGeneratedAt] = useState('')

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

  const loadInquiries = useCallback(async (key: string) => {
    const trimmedKey = key.trim()
    if (!trimmedKey) return

    setInquiriesStatus('loading')
    setInquiriesError('')

    try {
      const response = await fetch('/api/inquiries', {
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
        setInquiriesStatus('error')
        return
      }

      if (response.status === 404) {
        setInquiriesStatus('error')
        setInquiriesError('The inquiry API only runs on the deployed site.')
        return
      }

      if (response.status === 503) {
        setInquiriesStatus('error')
        setInquiriesError(
          'Inquiry storage is not connected yet. Add the required Vercel environment variables.',
        )
        return
      }

      if (!response.ok) {
        throw new Error(`Inquiry request failed with status ${response.status}.`)
      }

      const data = (await response.json()) as InquiriesResponse
      if (!Array.isArray(data.inquiries) || !data.summary) {
        throw new Error('The inquiry response was incomplete.')
      }

      setInquiries(data.inquiries)
      setInquirySummary(data.summary)
      setInquiriesLimited(data.limited)
      setInquiriesGeneratedAt(data.generatedAt)
      setInquiriesStatus('ready')
    } catch (loadError) {
      setInquiriesStatus('error')
      setInquiriesError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load inquiries. Please try again.',
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
      void loadVisits(storedKey, false)
    }
  }, [loadVisits])

  useEffect(() => {
    if (!isUnlocked || !accessKey || inquiriesStatus !== 'idle') return

    const timer = window.setTimeout(() => {
      void loadInquiries(accessKey)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [accessKey, inquiriesStatus, isUnlocked, loadInquiries])

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

  const showingVisitors = activeTab === 'visitors'
  const isRefreshing = showingVisitors ? status === 'loading' : inquiriesStatus === 'loading'
  const exportDisabled = showingVisitors ? !visits.length : !inquiries.length

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setInquiries([])
    setInquirySummary(null)
    setInquiriesStatus('idle')
    setInquiriesError('')
    setActiveTab('visitors')
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
    setInquiries([])
    setInquirySummary(null)
    setInquiriesStatus('idle')
    setInquiriesError('')
    setError('')
    setIsUnlocked(false)
    setStatus('locked')
    setActiveTab('visitors')
  }

  const refresh = () => {
    if (showingVisitors) {
      void loadVisits(accessKey, false)
      return
    }

    void loadInquiries(accessKey)
  }

  const selectTab = (tab: DashboardTab) => {
    setActiveTab(tab)

    if (tab === 'inquiries' && inquiriesStatus === 'idle' && accessKey) {
      void loadInquiries(accessKey)
    }
  }

  const exportCurrent = () => {
    if (showingVisitors) {
      downloadVisitsCsv(visits)
      return
    }

    downloadInquiriesCsv(inquiries)
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
              <h1 id="admin-login-title">Private dashboard.</h1>
              <p className="admin-login-copy">
                Enter your access key to see visitor activity and the inquiries people have
                submitted. This page is not linked anywhere on the website.
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
                      Unlock dashboard
                      <Eye size={15} strokeWidth={1.7} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <p className="admin-privacy-note">
                <ShieldCheck size={14} strokeWidth={1.7} aria-hidden="true" />
                Visitor analytics are anonymous. Inquiries contain only the contact details a
                visitor chose to send. Everything stays behind your private access key.
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
                  <h1>{showingVisitors ? 'Visitor activity.' : 'Inquiry activity.'}</h1>
                  <p className="admin-dashboard-copy">
                    {showingVisitors
                      ? 'Anonymous visits to the public website. Updated every time you refresh.'
                      : 'People who submitted the private viewing or enquiry form.'}
                  </p>
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="admin-action-button"
                    onClick={refresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw
                      className={isRefreshing ? 'spin' : ''}
                      size={14}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                    Refresh
                  </button>
                  <button
                    type="button"
                    className="admin-action-button admin-action-button--primary"
                    onClick={exportCurrent}
                    disabled={exportDisabled}
                  >
                    <Download size={14} strokeWidth={1.7} aria-hidden="true" />
                    Excel export
                  </button>
                </div>
              </div>

              <div className="admin-tabs" role="group" aria-label="Analytics sections">
                <button
                  type="button"
                  className={`admin-tab ${showingVisitors ? 'is-active' : ''}`}
                  onClick={() => selectTab('visitors')}
                  aria-pressed={showingVisitors}
                >
                  <Eye size={14} strokeWidth={1.7} aria-hidden="true" />
                  Visitors
                  {summary ? <span className="admin-tab-count">{summary.total}</span> : null}
                </button>
                <button
                  type="button"
                  className={`admin-tab ${!showingVisitors ? 'is-active' : ''}`}
                  onClick={() => selectTab('inquiries')}
                  aria-pressed={!showingVisitors}
                >
                  <Inbox size={14} strokeWidth={1.7} aria-hidden="true" />
                  Inquiries
                  {inquiriesStatus === 'ready' ? (
                    <span className="admin-tab-count">{inquiries.length}</span>
                  ) : null}
                </button>
              </div>

              {showingVisitors ? (
                <>
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
                            {visits.map((visit, index) => (
                              <tr key={`${visit.createdAt}-${visit.path}-${index}`}>
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
                        Showing the latest {TABLE_LIMIT} visits. Older visits remain in the
                        private storage log.
                      </p>
                    ) : null}
                  </section>

                  <p className="admin-dashboard-note">
                    <ShieldCheck size={14} strokeWidth={1.7} aria-hidden="true" />
                    Private analytics. Visits are anonymous: no names, emails, raw IP addresses,
                    or cookies are stored. Approximate location comes from network headers.
                  </p>
                </>
              ) : (
                <>
                  {inquiriesError ? (
                    <p className="admin-load-error" role="alert">
                      {inquiriesError}
                    </p>
                  ) : null}

                  {inquirySummary ? (
                    <div className="admin-kpis">
                      <div className="admin-kpi">
                        <span>
                          <Inbox size={13} strokeWidth={1.7} aria-hidden="true" />
                          Total inquiries
                        </span>
                        <strong>{inquirySummary.total}</strong>
                        <p>Latest {Math.min(inquirySummary.total, TABLE_LIMIT)} inquiries shown</p>
                      </div>
                      <div className="admin-kpi">
                        <span>
                          <CalendarDays size={13} strokeWidth={1.7} aria-hidden="true" />
                          Today
                        </span>
                        <strong>{inquirySummary.today}</strong>
                        <p>Inquiries received today</p>
                      </div>
                      <div className="admin-kpi">
                        <span>
                          <Phone size={13} strokeWidth={1.7} aria-hidden="true" />
                          With phone
                        </span>
                        <strong>{inquirySummary.withPhone}</strong>
                        <p>Visitors who shared a number</p>
                      </div>
                      <div className="admin-kpi">
                        <span>
                          <Mail size={13} strokeWidth={1.7} aria-hidden="true" />
                          Property enquiries
                        </span>
                        <strong>{inquirySummary.propertyInquiries}</strong>
                        <p>Linked to a specific residence</p>
                      </div>
                    </div>
                  ) : null}

                  <section className="admin-panel" aria-labelledby="recent-inquiries-title">
                    <div className="admin-panel-head">
                      <div>
                        <p className="admin-section-label">Latest activity</p>
                        <h2 id="recent-inquiries-title">Recent inquiries</h2>
                      </div>
                      <span className="admin-updated">
                        <CalendarDays size={12} strokeWidth={1.7} aria-hidden="true" />
                        {inquiriesGeneratedAt
                          ? formatVisitTime(inquiriesGeneratedAt)
                          : 'Not refreshed'}
                      </span>
                    </div>

                    {inquiriesStatus === 'loading' && !inquiries.length ? (
                      <p className="admin-empty">Loading inquiries…</p>
                    ) : inquiries.length ? (
                      <div className="admin-table-wrap">
                        <table className="admin-table admin-table--inquiries">
                          <thead>
                            <tr>
                              <th scope="col">When</th>
                              <th scope="col">Person</th>
                              <th scope="col">Interest</th>
                              <th scope="col">Message</th>
                              <th scope="col">Property</th>
                              <th scope="col">Location</th>
                              <th scope="col">Phone</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inquiries.map((inquiry, index) => (
                              <tr key={`${inquiry.createdAt}-${inquiry.email}-${index}`}>
                                <td>
                                  <time dateTime={inquiry.createdAt}>
                                    {formatVisitTime(inquiry.createdAt)}
                                  </time>
                                </td>
                                <td>
                                  <strong className="admin-name">{inquiry.name}</strong>
                                  <a
                                    className="admin-email"
                                    href={`mailto:${inquiry.email}`}
                                  >
                                    {inquiry.email}
                                  </a>
                                  <span className="admin-cell-sub">
                                    {sourceLabel(inquiry.source)} · {inquiry.device} ·{' '}
                                    {inquiry.browser}
                                  </span>
                                </td>
                                <td>{inquiry.interest}</td>
                                <td>
                                  {inquiry.message ? (
                                    <span className="admin-message">{inquiry.message}</span>
                                  ) : (
                                    <span className="admin-cell-sub">No message</span>
                                  )}
                                </td>
                                <td>{propertyLabel(inquiry.propertySlug)}</td>
                                <td>{formatLocation(inquiry.city, inquiry.country)}</td>
                                <td>
                                  {inquiry.phone ? (
                                    <a className="admin-email" href={`tel:${inquiry.phone}`}>
                                      {inquiry.phone}
                                    </a>
                                  ) : (
                                    <span className="admin-cell-sub">Not provided</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : inquiriesStatus === 'error' ? null : (
                      <p className="admin-empty">
                        No inquiries yet. When someone submits the form, their message will
                        appear here.
                      </p>
                    )}

                    {inquiriesLimited ? (
                      <p className="admin-limited-note">
                        Showing the latest {TABLE_LIMIT} inquiries. Older entries remain in the
                        private storage log.
                      </p>
                    ) : null}
                  </section>

                  <p className="admin-dashboard-note">
                    <ShieldCheck size={14} strokeWidth={1.7} aria-hidden="true" />
                    Inquiries contain only the contact details visitors chose to submit. Keep
                    this dashboard and its access key private.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
