import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Pause, Play, Star } from 'lucide-react'
import { demoProperties, type Property } from '../lib/data'

interface HeroProps {
  onBook: () => void
  onViewProperty: (property: Property) => void
}

const heroPropertySlugs = ['alder-house', 'atelier-one', 'marlow-house', 'kingsley-loft']

const heroProperties = heroPropertySlugs
  .map((slug) => demoProperties.find((property) => property.slug === slug))
  .filter((property): property is Property => Boolean(property))

export function Hero({ onBook, onViewProperty }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [isInteracting, setIsInteracting] = useState(false)
  const [isHeroInView, setIsHeroInView] = useState(true)
  const [isPageVisible, setIsPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  )
  const heroRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const scrollTargetRef = useRef<number | null>(null)
  const targetTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
      if (targetTimerRef.current !== null) window.clearTimeout(targetTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const section = heroRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroInView(entry.isIntersecting),
      { threshold: 0.12 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleVisibility = () => setIsPageVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const showSlide = useCallback((index: number) => {
    setActiveSlide(index)
    scrollTargetRef.current = index

    if (targetTimerRef.current !== null) {
      window.clearTimeout(targetTimerRef.current)
    }

    targetTimerRef.current = window.setTimeout(() => {
      scrollTargetRef.current = null
      targetTimerRef.current = null
    }, 900)

    const track = trackRef.current
    const slide = track?.querySelectorAll<HTMLElement>('.hero-slide')[index]
    if (!track || !slide) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({
      left: slide.offsetLeft,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [])

  useEffect(() => {
    if (isAutoplayPaused || isInteracting || !isHeroInView || !isPageVisible) return

    const timer = window.setTimeout(() => {
      showSlide((activeSlide + 1) % heroProperties.length)
    }, 6000)

    return () => window.clearTimeout(timer)
  }, [activeSlide, isAutoplayPaused, isInteracting, isHeroInView, isPageVisible, showSlide])

  const handleTrackScroll = () => {
    if (frameRef.current !== null) return

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null
      const track = trackRef.current
      if (!track) return

      const slides = Array.from(track.querySelectorAll<HTMLElement>('.hero-slide'))

      if (scrollTargetRef.current !== null) {
        const target = slides[scrollTargetRef.current]
        if (target && Math.abs(target.offsetLeft - track.scrollLeft) < 4) {
          scrollTargetRef.current = null
          if (targetTimerRef.current !== null) {
            window.clearTimeout(targetTimerRef.current)
            targetTimerRef.current = null
          }
        } else {
          return
        }
      }

      let nearest = 0
      let shortestDistance = Number.POSITIVE_INFINITY

      slides.forEach((slide, index) => {
        const distance = Math.abs(slide.offsetLeft - track.scrollLeft)
        if (distance < shortestDistance) {
          shortestDistance = distance
          nearest = index
        }
      })

      setActiveSlide(nearest)
    })
  }

  const selectSlide = (property: Property, index: number) => {
    if (index === activeSlide) {
      onViewProperty(property)
      return
    }

    showSlide(index)
  }

  return (
    <section className="hero-shell" id="home" aria-labelledby="hero-title" ref={heroRef}>
      <div className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <div
              className="hero-rail"
              role="group"
              aria-label="Featured home gallery"
              onMouseEnter={() => setIsInteracting(true)}
              onMouseLeave={() => setIsInteracting(false)}
              onFocusCapture={() => setIsInteracting(true)}
              onBlurCapture={() => setIsInteracting(false)}
            >
              <span className="hero-rail-line" aria-hidden="true" />
              {heroProperties.map((property, index) => (
                <button
                  key={property.slug}
                  type="button"
                  className={`hero-dot ${activeSlide === index ? 'is-active' : ''}`}
                  onClick={() => showSlide(index)}
                  aria-label={`Show ${property.title} in the gallery`}
                  aria-pressed={activeSlide === index}
                />
              ))}
            </div>

            <div className="hero-content">
              <p className="eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                Design-led property · London &amp; the Cotswolds
              </p>

              <h1 id="hero-title">
                <span className="hero-title-desktop">
                  Find your <em>dream home</em> with ease.
                </span>
                <span className="hero-title-mobile">
                  Welcome <em>home.</em>
                </span>
              </h1>

              <p className="hero-lede">
                Homes chosen for how they feel, not just how they look. Considered real
                estate, paired with interiors that make a space unmistakably yours.
              </p>

              <div className="hero-actions">
                <a className="btn btn--dark hero-primary" href="#residences">
                  Explore residences
                  <span className="btn-icon">
                    <ArrowDown size={15} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </a>
                <button type="button" className="hero-secondary" onClick={onBook}>
                  Book a private viewing
                  <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>

              <div className="hero-trust">
                <div className="avatar-stack" aria-hidden="true">
                  <img src="/images/client-amara.webp" alt="" loading="lazy" decoding="async" />
                  <img src="/images/client-adewale.webp" alt="" loading="lazy" decoding="async" />
                  <img src="/images/client-zainab.webp" alt="" loading="lazy" decoding="async" />
                </div>
                <p>
                  <strong>480+ homeowners</strong>
                  <span>have found their place with us</span>
                </p>
                <div className="hero-trust-rating">
                  <span className="rating-stars" role="img" aria-label="Rated 4.9 out of 5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={10} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                    ))}
                  </span>
                  <span>4.9 / 5 · 180+ viewings</span>
                </div>
              </div>

              <div className="hero-mobile-cards" role="group" aria-label="Featured homes">
                {heroProperties.slice(0, 3).map((property) => (
                  <button
                    key={property.slug}
                    type="button"
                    className="hero-mobile-card"
                    onClick={() => onViewProperty(property)}
                  >
                    <span className="hero-mobile-card-media">
                      <img
                        src={property.image}
                        alt=""
                        loading="eager"
                        decoding="async"
                      />
                      <span className="hero-mobile-card-arrow" aria-hidden="true">
                        <ArrowUpRight size={12} strokeWidth={1.7} />
                      </span>
                    </span>
                    <span className="hero-mobile-card-meta">
                      <span className="hero-mobile-card-category">{property.category}</span>
                      <span className="hero-mobile-card-title">{property.title}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-gallery">
            <div
              className="hero-track"
              ref={trackRef}
              onScroll={handleTrackScroll}
              onMouseEnter={() => setIsInteracting(true)}
              onMouseLeave={() => setIsInteracting(false)}
              onFocusCapture={() => setIsInteracting(true)}
              onBlurCapture={() => setIsInteracting(false)}
              role="region"
              aria-label="Signature homes"
            >
              {heroProperties.map((property, index) => {
                const isActive = activeSlide === index
                return (
                  <button
                    type="button"
                    className={`hero-slide ${isActive ? 'is-active' : ''}`}
                    key={property.slug}
                    onClick={() => selectSlide(property, index)}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <img
                      src={property.image}
                      alt=""
                      loading={index < 2 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      decoding="async"
                    />
                    <span className="hero-slide-shade" aria-hidden="true" />
                    <span className="hero-slide-top">
                      <span className="hero-slide-tag">{property.tag ?? property.category}</span>
                      <span className="hero-slide-arrow" aria-hidden="true">
                        <ArrowUpRight size={16} strokeWidth={1.7} />
                      </span>
                    </span>
                    <span className="hero-slide-bottom">
                      <span className="hero-slide-location">{property.location}</span>
                      <span className="hero-slide-title">{property.title}</span>
                      <span className="hero-slide-specs">
                        {property.bedrooms} bed · {property.bathrooms} bath ·{' '}
                        {property.areaSqft.toLocaleString('en-GB')} sq ft
                      </span>
                    </span>
                    <span className="sr-only">
                      {isActive ? 'Open property details' : 'Highlight this home'}
                    </span>
                  </button>
                )
              })}
              <a className="hero-end-card" href="#residences">
                <span className="hero-end-top">
                  <span className="hero-end-label">The full collection</span>
                  <span className="hero-end-arrow" aria-hidden="true">
                    <ArrowUpRight size={16} strokeWidth={1.7} />
                  </span>
                </span>
                <span className="hero-end-copy">
                  <span className="hero-end-title">
                    More homes,
                    <br />
                    <em>one feeling.</em>
                  </span>
                  <span className="hero-end-link">Browse all residences</span>
                </span>
              </a>
            </div>

            <div className="hero-gallery-foot">
              <span>Signature collection</span>
              <span className="hero-gallery-hint">
                Drag to explore
                <ArrowRight size={13} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <button
                type="button"
                className="hero-autoplay"
                onClick={() => setIsAutoplayPaused((paused) => !paused)}
                aria-label={
                  isAutoplayPaused
                    ? 'Play automatic gallery rotation'
                    : 'Pause automatic gallery rotation'
                }
                title="Gallery advances every 6 seconds"
              >
                {isAutoplayPaused ? (
                  <Play size={11} strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <Pause size={11} strokeWidth={1.8} aria-hidden="true" />
                )}
                <span>{isAutoplayPaused ? 'Play' : 'Pause'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
