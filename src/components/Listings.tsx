import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { propertyFilters, type Property, type PropertyFilter } from '../lib/data'
import { useProperties } from '../hooks/useProperties'
import { PropertyCard } from './PropertyCard'
import { Reveal } from './Reveal'

interface ListingsProps {
  onViewProperty: (property: Property) => void
  onInquire: () => void
}

const SAVED_STORAGE_KEY = 'hearth-and-form:saved-homes'

function readSavedHomes(): string[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(SAVED_STORAGE_KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function Listings({ onViewProperty, onInquire }: ListingsProps) {
  const { properties, isLive } = useProperties()
  const [activeFilter, setActiveFilter] = useState<PropertyFilter>('All')
  const [savedHomes, setSavedHomes] = useState<string[]>(readSavedHomes)
  const [canScrollBack, setCanScrollBack] = useState(false)
  const [canScrollForward, setCanScrollForward] = useState(true)
  const trackRef = useRef<HTMLDivElement>(null)

  const filteredProperties =
    activeFilter === 'All'
      ? properties
      : properties.filter((property) => property.category === activeFilter)

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedHomes))
    } catch {
      // Saving is a convenience, not a requirement.
    }
  }, [savedHomes])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const updateControls = () => {
      const maxScroll = track.scrollWidth - track.clientWidth
      setCanScrollBack(track.scrollLeft > 8)
      setCanScrollForward(track.scrollLeft < maxScroll - 8)
    }

    updateControls()
    const resizeObserver = new ResizeObserver(updateControls)
    resizeObserver.observe(track)
    track.addEventListener('scroll', updateControls, { passive: true })

    return () => {
      resizeObserver.disconnect()
      track.removeEventListener('scroll', updateControls)
    }
  }, [filteredProperties.length])

  const toggleSaved = (id: string) => {
    setSavedHomes((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    )
  }

  const changeFilter = (filter: PropertyFilter) => {
    setActiveFilter(filter)
    window.requestAnimationFrame(() => {
      trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
    })
  }

  const scrollCarousel = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('.property-card')
    const distance = card ? card.offsetWidth + 20 : track.clientWidth * 0.8
    track.scrollBy({ left: distance * direction, behavior: 'smooth' })
  }

  return (
    <section className="section listings-section" id="residences" aria-labelledby="residences-title">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <div>
              <p className="eyebrow">
                Residences
              </p>
              <h2 className="section-title" id="residences-title">
                A quiet collection of <em>remarkable</em> homes.
              </h2>
            </div>
            <p className="section-aside">
              Each home is visited, considered, and photographed by our team.
              No filler listings, no guesswork — just places worth your time.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="listings-panel">
            <div className="listings-toolbar">
              <div className="filter-tabs" role="group" aria-label="Filter residences">
                {propertyFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    className={`filter-tab ${activeFilter === filter.value ? 'is-active' : ''}`}
                    onClick={() => changeFilter(filter.value)}
                    aria-pressed={activeFilter === filter.value}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="carousel-controls">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => scrollCarousel(-1)}
                  disabled={!canScrollBack}
                  aria-label="Previous homes"
                >
                  <ArrowLeft size={17} strokeWidth={1.7} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => scrollCarousel(1)}
                  disabled={!canScrollForward}
                  aria-label="Next homes"
                >
                  <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="properties-track" ref={trackRef}>
              {filteredProperties.map((property, index) => (
                <Reveal
                  key={property.id}
                  className="property-reveal"
                  delay={Math.min(index, 3) * 70}
                >
                  <PropertyCard
                    property={property}
                    isSaved={savedHomes.includes(property.id)}
                    onToggleSave={() => toggleSaved(property.id)}
                    onView={() => onViewProperty(property)}
                  />
                </Reveal>
              ))}
            </div>

            <div className="listings-footer">
              <span className="collection-status">
                <span className={`status-dot ${isLive ? 'is-live' : ''}`} aria-hidden="true" />
                {isLive ? 'Live collection · Supabase' : 'Curated in-house collection'}
              </span>
              <button type="button" className="text-link" onClick={onInquire}>
                Talk to a property advisor
                <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
