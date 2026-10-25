import { useState, type FormEvent } from 'react'
import { ArrowRight, ArrowUpRight, LoaderCircle, Mail } from 'lucide-react'
import { navLinks } from '../lib/data'
import { submitInquiry } from '../lib/inquiries'
import { BrandMark } from './BrandMark'

interface FooterProps {
  onBook: () => void
}

type NewsletterStatus = 'idle' | 'loading' | 'success' | 'error'

const currentYear = new Date().getFullYear()

export function Footer({ onBook }: FooterProps) {
  const [email, setEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<NewsletterStatus>('idle')
  const [newsletterMessage, setNewsletterMessage] = useState('')

  const handleNewsletter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalisedEmail = email.trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalisedEmail)) {
      setNewsletterStatus('error')
      setNewsletterMessage('Please enter a valid email address.')
      return
    }

    setNewsletterStatus('loading')
    setNewsletterMessage('')

    try {
      await submitInquiry({
        name: 'Newsletter subscriber',
        email: normalisedEmail,
        interest: 'Newsletter',
        source: 'newsletter',
      })
      setNewsletterStatus('success')
      setNewsletterMessage('You are on the list. A quiet note, now and then.')
      setEmail('')
    } catch {
      setNewsletterStatus('error')
      setNewsletterMessage('Something went wrong. Please try again, or email us directly.')
    }
  }

  return (
    <footer className="site-footer-wrap">
      <div className="site-footer">
        <div className="footer-glow" aria-hidden="true" />
        <div className="container">
          <div className="footer-cta">
            <div>
              <p className="eyebrow eyebrow--light">
                <span className="eyebrow-dot" aria-hidden="true" />
                Private viewings · By appointment
              </p>
              <h2>
                Your next chapter starts with a <em>conversation.</em>
              </h2>
            </div>
            <button type="button" className="btn btn--light" onClick={onBook}>
              Book a private viewing
              <span className="btn-icon">
                <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </button>
          </div>

          <div className="footer-grid">
            <div className="footer-brand">
              <a className="brand brand--footer" href="#home">
                <BrandMark className="brand-mark" />
                <span className="brand-type">
                  Hearth <em>&amp;</em> Form
                </span>
              </a>
              <p>
                Design-led property and interiors for people who want a home with a
                point of view. London &amp; the Cotswolds.
              </p>
              <div className="footer-socials">
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                  Instagram
                  <ArrowUpRight size={12} strokeWidth={1.7} aria-hidden="true" />
                </a>
                <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
                  LinkedIn
                  <ArrowUpRight size={12} strokeWidth={1.7} aria-hidden="true" />
                </a>
              </div>
            </div>

            <nav className="footer-nav" aria-label="Footer navigation">
              <p className="footer-label">Explore</p>
              {navLinks.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
              <button type="button" onClick={onBook}>
                Book a viewing
              </button>
            </nav>

            <div className="footer-visit">
              <p className="footer-label">Visit</p>
              <address>
                <strong>London studio</strong>
                24 Ledbury Road
                <br />
                Notting Hill, W11 2AB
              </address>
              <address>
                <strong>Cotswolds studio</strong>
                The Old Dairy, Sheep Street
                <br />
                Stow-on-the-Wold, GL54 1AA
              </address>
              <a href="mailto:hello@hearthandform.studio">
                <Mail size={13} strokeWidth={1.7} aria-hidden="true" />
                hello@hearthandform.studio
              </a>
            </div>

            <div className="footer-newsletter">
              <p className="footer-label">The quarterly note</p>
              <p>
                New homes, studio notes, and the occasional good find. Four times a
                year, no noise.
              </p>
              <form onSubmit={handleNewsletter} noValidate>
                <label className="sr-only" htmlFor="newsletter-email">
                  Email address
                </label>
                <div className="newsletter-field">
                  <input
                    id="newsletter-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      if (newsletterStatus !== 'loading') {
                        setNewsletterStatus('idle')
                        setNewsletterMessage('')
                      }
                    }}
                    placeholder="Your email address"
                    autoComplete="email"
                    aria-invalid={newsletterStatus === 'error'}
                    aria-describedby="newsletter-status"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to the quarterly note"
                    disabled={newsletterStatus === 'loading'}
                  >
                    {newsletterStatus === 'loading' ? (
                      <LoaderCircle className="spin" size={17} strokeWidth={1.7} aria-hidden="true" />
                    ) : (
                      <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
                    )}
                  </button>
                </div>
                <p
                  id="newsletter-status"
                  className={`newsletter-status ${newsletterStatus === 'error' ? 'is-error' : ''}`}
                  aria-live="polite"
                >
                  {newsletterMessage}
                </p>
              </form>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {currentYear} Hearth &amp; Form. All rights reserved.</p>
            <p className="footer-disclaimer">
              A design-led property portfolio. Demo content and imagery.
            </p>
            <p>
              Photography via{' '}
              <a href="https://unsplash.com" target="_blank" rel="noreferrer">
                Unsplash
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
