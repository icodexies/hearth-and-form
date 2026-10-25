import { useState } from 'react'
import { ArrowLeft, ArrowRight, Star } from 'lucide-react'
import { testimonials } from '../lib/data'
import { Reveal } from './Reveal'

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const testimonial = testimonials[activeIndex]

  const showPrevious = () => {
    setActiveIndex((index) => (index - 1 + testimonials.length) % testimonials.length)
  }

  const showNext = () => {
    setActiveIndex((index) => (index + 1) % testimonials.length)
  }

  return (
    <section className="section testimonials-section" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="testimonials-panel">
          <Reveal className="testimonials-head">
            <div>
              <p className="eyebrow">
                Client stories
              </p>
              <h2 className="section-title" id="testimonials-title">
                Satisfied clients, <em>in their own words.</em>
              </h2>
            </div>
            <p className="testimonials-rating">
              <span className="rating-stars" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={13} fill="currentColor" strokeWidth={0} />
                ))}
              </span>
              <span>4.9 average from 180+ viewings</span>
            </p>
          </Reveal>

          <div className="testimonials-grid">
            <Reveal className="testimonial-collage" variant="left">
              <figure className="testimonial-room" key={`${testimonial.name}-room`}>
                <img
                  src={testimonial.room}
                  alt={`Interior of ${testimonial.project}`}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  <span>Client story</span>
                </figcaption>
              </figure>
              <figure className="testimonial-portrait" key={`${testimonial.name}-portrait`}>
                <img
                  src={testimonial.image}
                  alt={`Portrait of ${testimonial.name}`}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
              <span className="testimonial-badge">A home, considered.</span>
            </Reveal>

            <Reveal className="testimonial-card" variant="right" delay={100}>
              <span className="testimonial-card-mark" aria-hidden="true">
                &ldquo;
              </span>
              <div className="testimonial-quote" key={testimonial.name} aria-live="polite">
                <div className="rating-stars rating-stars--clay" role="img" aria-label="Rated 5 out of 5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                  ))}
                </div>
                <blockquote>{testimonial.quote}</blockquote>
                <footer>
                  <img src={testimonial.image} alt="" loading="lazy" decoding="async" />
                  <div>
                    <p className="testimonial-name">{testimonial.name}</p>
                    <p className="testimonial-meta">
                      {testimonial.role} · {testimonial.location}
                    </p>
                  </div>
                </footer>
                <p className="testimonial-project">Project — {testimonial.project}</p>
              </div>

              <div className="testimonial-controls">
                <div className="testimonial-dots">
                  {testimonials.map((item, index) => (
                    <button
                      key={item.name}
                      type="button"
                      className={index === activeIndex ? 'is-active' : ''}
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Show testimonial from ${item.name}`}
                      aria-pressed={index === activeIndex}
                    />
                  ))}
                </div>
                <div className="testimonial-arrows">
                  <button
                    type="button"
                    className="icon-button icon-button--light"
                    onClick={showPrevious}
                    aria-label="Previous testimonial"
                  >
                    <ArrowLeft size={17} strokeWidth={1.7} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="icon-button icon-button--light"
                    onClick={showNext}
                    aria-label="Next testimonial"
                  >
                    <ArrowRight size={17} strokeWidth={1.7} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
