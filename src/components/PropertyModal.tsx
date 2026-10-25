import { ArrowUpRight, Bath, BedDouble, Check, MapPin, Maximize } from 'lucide-react'
import type { Property } from '../lib/data'
import { formatPrice } from '../lib/format'
import { Modal } from './Modal'

interface PropertyModalProps {
  property: Property
  onClose: () => void
  onInquire: (property: Property) => void
}

export function PropertyModal({ property, onClose, onInquire }: PropertyModalProps) {
  return (
    <Modal onClose={onClose} labelledBy="property-modal-title" className="property-modal">
      <div className="property-modal-grid">
        <div className="property-modal-media">
          <img src={property.image} alt={`${property.title}, ${property.location}`} decoding="async" />
          <div className="property-modal-media-top">
            <span className="property-tag">{property.category}</span>
          </div>
          <div className="property-modal-media-bottom">
            <MapPin size={14} strokeWidth={1.7} aria-hidden="true" />
            {property.location}
          </div>
        </div>

        <div className="property-modal-details">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Available to view
          </p>
          <h2 id="property-modal-title">{property.title}</h2>
          <p className="property-modal-price">
            {formatPrice(property.price)}
            <span>{property.category}</span>
          </p>

          <div className="property-modal-specs">
            <span>
              <BedDouble size={18} strokeWidth={1.5} aria-hidden="true" />
              <strong>{property.bedrooms}</strong> bedrooms
            </span>
            <span>
              <Bath size={18} strokeWidth={1.5} aria-hidden="true" />
              <strong>{property.bathrooms}</strong> bathrooms
            </span>
            <span>
              <Maximize size={18} strokeWidth={1.5} aria-hidden="true" />
              <strong>{property.areaSqft.toLocaleString('en-GB')}</strong> sq ft
            </span>
          </div>

          <div className="property-modal-copy">
            <p>{property.description}</p>
          </div>

          <div className="property-modal-features">
            <p className="property-modal-label">The details</p>
            <ul>
              {property.features.map((feature) => (
                <li key={feature}>
                  <Check size={14} strokeWidth={2} aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="property-agent">
            <span className="agent-monogram" aria-hidden="true">
              MB
            </span>
            <div>
              <strong>Maya Bennett</strong>
              <span>Founder &amp; Head of Residences</span>
            </div>
            <span className="agent-availability">
              <span className="status-dot is-live" aria-hidden="true" />
              Available
            </span>
          </div>

          <div className="property-modal-actions">
            <button type="button" className="btn btn--dark" onClick={() => onInquire(property)}>
              Book a private viewing
              <span className="btn-icon">
                <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => onInquire(property)}>
              Ask a question
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
