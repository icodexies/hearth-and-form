import { ArrowUpRight, Bath, BedDouble, Heart, MapPin, Maximize } from 'lucide-react'
import type { Property } from '../lib/data'
import { formatPrice } from '../lib/format'

interface PropertyCardProps {
  property: Property
  isSaved: boolean
  onToggleSave: () => void
  onView: () => void
}

export function PropertyCard({ property, isSaved, onToggleSave, onView }: PropertyCardProps) {
  return (
    <article className="property-card">
      <div className="property-media">
        <img src={property.image} alt={`${property.title}, ${property.location}`} loading="lazy" decoding="async" />
        <span className="property-tag">{property.tag ?? property.category}</span>
        <button
          type="button"
          className="property-save"
          onClick={onToggleSave}
          aria-label={isSaved ? `Remove ${property.title} from saved homes` : `Save ${property.title}`}
          aria-pressed={isSaved}
        >
          <Heart
            size={16}
            strokeWidth={1.7}
            fill={isSaved ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          className="property-media-hit"
          onClick={onView}
          aria-label={`View ${property.title}`}
        />
      </div>

      <div className="property-body">
        <p className="property-location">
          <MapPin size={12} strokeWidth={1.7} aria-hidden="true" />
          {property.location}
        </p>
        <button type="button" className="property-title" onClick={onView}>
          {property.title}
        </button>

        <div className="property-specs" aria-label="Property details">
          <span>
            <BedDouble size={14} strokeWidth={1.6} aria-hidden="true" />
            {property.bedrooms} bed
          </span>
          <span>
            <Bath size={14} strokeWidth={1.6} aria-hidden="true" />
            {property.bathrooms} bath
          </span>
          <span>
            <Maximize size={14} strokeWidth={1.6} aria-hidden="true" />
            {property.areaSqft.toLocaleString('en-GB')} sq ft
          </span>
        </div>

        <div className="property-footer">
          <p className="property-price">
            {formatPrice(property.price)}
            <span>{property.category}</span>
          </p>
          <button
            type="button"
            className="property-arrow"
            onClick={onView}
            aria-label={`View details for ${property.title}`}
          >
            <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
