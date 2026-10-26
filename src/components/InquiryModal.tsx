import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, LoaderCircle } from 'lucide-react'
import type { Property } from '../lib/data'
import { submitInquiry } from '../lib/inquiries'
import { BrandMark } from './BrandMark'
import { Modal } from './Modal'

interface InquiryModalProps {
  property?: Property | null
  defaultInterest?: string
  onClose: () => void
}

interface FormState {
  name: string
  email: string
  phone: string
  interest: string
  message: string
  consent: boolean
}

type FormErrors = Partial<Record<'name' | 'email' | 'consent', string>>

const interestOptions = ['Buying a home', 'Selling a home', 'Interior design', 'General enquiry']

export function InquiryModal({ property, defaultInterest, onClose }: InquiryModalProps) {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    interest: defaultInterest ?? 'Buying a home',
    message: property ? `I would like to arrange a viewing of ${property.title}.` : '',
    consent: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [serverError, setServerError] = useState('')
  const [wasDemo, setWasDemo] = useState(false)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'success') {
      successRef.current?.focus()
    }
  }, [status])

  const updateField = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (key in errors) {
      setErrors((current) => ({ ...current, [key]: undefined }))
    }
    if (status === 'error') {
      setStatus('idle')
      setServerError('')
    }
  }

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}

    if (form.name.trim().length < 2) {
      nextErrors.name = 'Please tell us your name.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!form.consent) {
      nextErrors.consent = 'Please agree to be contacted about your enquiry.'
    }

    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'loading') return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setStatus('loading')
    setServerError('')

    try {
      const result = await submitInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        interest: form.interest,
        message: form.message,
        propertySlug: property?.slug ?? null,
        source: property ? 'property' : 'website',
        consent: form.consent,
      })
      setWasDemo(result.demo)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setServerError(
        error instanceof Error
          ? error.message
          : 'We could not send that just now. Please try again.',
      )
    }
  }

  const image = property?.image ?? '/images/hero-detail.webp'
  const firstName = form.name.trim().split(' ')[0]

  return (
    <Modal onClose={onClose} labelledBy="inquiry-modal-title" className="inquiry-modal">
      <div className="inquiry-grid">
        <div className="inquiry-media">
          <img src={image} alt="" decoding="async" />
          <div className="inquiry-media-overlay">
            <span className="inquiry-brand">
              <BrandMark className="brand-mark" />
              Hearth <em>&amp;</em> Form
            </span>
            {property ? (
              <div>
                <p className="inquiry-media-label">Private viewing</p>
                <h3>{property.title}</h3>
                <p>{property.location}</p>
              </div>
            ) : (
              <div>
                <p className="inquiry-media-label">Our promise</p>
                <h3>Good homes begin with good questions.</h3>
                <p>We reply within one working day.</p>
              </div>
            )}
          </div>
        </div>

        <div className="inquiry-content">
          {status === 'success' ? (
            <div
              className="inquiry-success"
              ref={successRef}
              role="status"
              tabIndex={-1}
            >
              <span className="success-mark" aria-hidden="true">
                <Check size={28} strokeWidth={1.8} />
              </span>
              <p className="eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                Enquiry received
              </p>
              <h2 id="inquiry-modal-title">
                Thank you{firstName ? `, ${firstName}` : ''}.
              </h2>
              <p>
                Your note is with our team. We will be in touch within one working day
                to arrange the next step.
              </p>
              {property ? (
                <p className="inquiry-success-detail">
                  Enquiry — <strong>{property.title}</strong>, {property.location}
                </p>
              ) : null}
              {wasDemo ? (
                <p className="inquiry-demo-note">
                  Demo mode is active. Add your Supabase environment variables to receive
                  enquiries in your dashboard.
                </p>
              ) : null}
              <button type="button" className="btn btn--dark" onClick={onClose}>
                Back to the studio
              </button>
            </div>
          ) : (
            <>
              <p className="eyebrow">
                {property ? 'Viewing · By appointment' : 'Enquiry · Say hello'}
              </p>
              <h2 id="inquiry-modal-title">
                {property ? 'Arrange a viewing.' : 'Let’s find your place.'}
              </h2>
              <p className="inquiry-intro">
                {property
                  ? `Register your interest in ${property.title} and we will arrange a private visit at a time that suits you.`
                  : 'Tell us a little about what you are looking for. A real person from the studio will reply within one working day.'}
              </p>

              <form className="inquiry-form" onSubmit={handleSubmit} noValidate>
                <div className="field-row">
                  <div className={`field ${errors.name ? 'has-error' : ''}`}>
                    <label htmlFor="inquiry-name">Full name</label>
                    <input
                      id="inquiry-name"
                      name="name"
                      value={form.name}
                      onChange={(event) => updateField('name', event.target.value)}
                      autoComplete="name"
                      placeholder="Your name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'inquiry-name-error' : undefined}
                      data-autofocus
                    />
                    {errors.name ? (
                      <p className="field-error" id="inquiry-name-error">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div className={`field ${errors.email ? 'has-error' : ''}`}>
                    <label htmlFor="inquiry-email">Email</label>
                    <input
                      id="inquiry-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField('email', event.target.value)}
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'inquiry-email-error' : undefined}
                    />
                    {errors.email ? (
                      <p className="field-error" id="inquiry-email-error">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="inquiry-phone">Phone (optional)</label>
                    <input
                      id="inquiry-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) => updateField('phone', event.target.value)}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+44 7700 900 000"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="inquiry-interest">I&apos;m interested in</label>
                    <select
                      id="inquiry-interest"
                      name="interest"
                      value={form.interest}
                      onChange={(event) => updateField('interest', event.target.value)}
                    >
                      {interestOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="inquiry-message">
                    Anything we should know? <span>(optional)</span>
                  </label>
                  <textarea
                    id="inquiry-message"
                    name="message"
                    rows={3}
                    value={form.message}
                    onChange={(event) => updateField('message', event.target.value)}
                    placeholder="Your timeline, the area you love, or the feeling you are after."
                  />
                </div>

                <label className={`checkbox ${errors.consent ? 'has-error' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(event) => updateField('consent', event.target.checked)}
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={errors.consent ? 'inquiry-consent-error' : undefined}
                  />
                  <span>
                    I agree to be contacted about this enquiry. No lists, no noise.
                  </span>
                </label>
                {errors.consent ? (
                  <p className="field-error" id="inquiry-consent-error">
                    {errors.consent}
                  </p>
                ) : null}

                {status === 'error' ? (
                  <p className="form-error" role="alert">
                    {serverError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="btn btn--dark inquiry-submit"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      Sending your note
                      <LoaderCircle className="spin" size={16} strokeWidth={1.8} aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Send enquiry
                      <span className="btn-icon">
                        <Check size={15} strokeWidth={2} aria-hidden="true" />
                      </span>
                    </>
                  )}
                </button>
                <p className="inquiry-fineprint">
                  We reply within one working day. Your details stay with our studio.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
