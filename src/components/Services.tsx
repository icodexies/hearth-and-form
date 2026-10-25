import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { services } from '../lib/data'
import { Reveal } from './Reveal'

interface ServicesProps {
  onInquire: (interest?: string) => void
}

export function Services({ onInquire }: ServicesProps) {
  const [activeService, setActiveService] = useState(0)

  return (
    <section className="section services-section" id="services" aria-labelledby="services-title">
      <div className="container">
        <div className="services-panel">
          <Reveal className="services-head">
            <div>
              <p className="eyebrow">
                Services
              </p>
              <h2 className="section-title" id="services-title">
                More than a move.
              </h2>
            </div>
            <p className="section-aside">
              Our studio stays close after the keys are handed over. Interiors,
              furniture, and a fresh eye for the home you already have.
            </p>
          </Reveal>

          <div className="services-grid" role="group" aria-label="Our services">
            {services.map((service, index) => {
              const isActive = index === activeService
              return (
                <Reveal
                  className="service-reveal"
                  key={service.index}
                  delay={Math.min(index, 2) * 90}
                >
                  <button
                    type="button"
                    className={`service-card ${isActive ? 'is-active' : ''}`}
                    onClick={() => setActiveService(index)}
                    onFocus={() => setActiveService(index)}
                    aria-pressed={isActive}
                  >
                    <span className="service-card-top">
                      <span className="service-label">{isActive ? 'Selected service' : 'Service'}</span>
                    </span>
                    <span className="service-title">{service.title}</span>
                    <span className="service-description">{service.description}</span>
                    <span className="service-detail">{service.detail}</span>
                    <span className="service-tags">
                      {service.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </span>
                    <span className="service-link">
                      Explore the service
                      <span className="service-link-icon" aria-hidden="true">
                        <ArrowUpRight size={15} strokeWidth={1.7} />
                      </span>
                    </span>
                  </button>
                </Reveal>
              )
            })}
          </div>

          <Reveal className="services-footer" delay={260}>
            <p>Every project begins with a conversation — and a cup of something good.</p>
            <button
              type="button"
              className="btn btn--dark"
              onClick={() => onInquire('Interior design')}
            >
              Start a project
              <span className="btn-icon">
                <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
