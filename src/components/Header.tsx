import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { navLinks } from '../lib/data'
import { BrandMark } from './BrandMark'

interface HeaderProps {
  onBook: () => void
}

export function Header({ onBook }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className={`site-header ${isScrolled ? 'is-scrolled' : ''} ${isMenuOpen ? 'is-open' : ''}`}>
      <div className="container header-inner">
        <a className="brand" href="#home" onClick={closeMenu}>
          <BrandMark className="brand-mark" />
          <span className="brand-type">
            Hearth <em>&amp;</em> Form
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a key={link.href} className="nav-link" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="btn btn--dark header-cta" onClick={onBook}>
            Book a viewing
            <span className="btn-icon">
              <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
            </span>
          </button>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X size={22} strokeWidth={1.7} aria-hidden="true" />
            ) : (
              <Menu size={22} strokeWidth={1.7} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`mobile-menu ${isMenuOpen ? 'is-open' : ''}`}
        id="mobile-menu"
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen ? true : undefined}
      >
        <div className="container mobile-menu-inner">
          <p className="eyebrow eyebrow--plain">Menu</p>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navLinks.map((link, index) => (
              <a key={link.href} href={link.href} onClick={closeMenu}>
                <span className="mobile-nav-index">0{index + 1}</span>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mobile-menu-footer">
            <p>
              London &amp; the Cotswolds
              <br />
              <a href="mailto:hello@hearthandform.studio">hello@hearthandform.studio</a>
            </p>
            <button
              type="button"
              className="btn btn--dark"
              onClick={() => {
                closeMenu()
                onBook()
              }}
            >
              Book a private viewing
              <span className="btn-icon">
                <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
