import { useState } from 'react'
import { ArrowUpRight, Minus, Plus, Quote } from 'lucide-react'
import { guideSteps } from '../lib/data'
import { Reveal } from './Reveal'

interface GuideProps {
  onInquire: () => void
}

export function Guide({ onInquire }: GuideProps) {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="section guide-section" id="guide" aria-labelledby="guide-title">
      <div className="container">
        <div className="guide-panel">
          <Reveal className="guide-intro" variant="left">
            <span className="guide-quote-mark" aria-hidden="true">
              <Quote size={48} strokeWidth={1} fill="currentColor" />
            </span>
            <p className="eyebrow">
              The first-timer&apos;s guide
            </p>
            <h2 className="section-title section-title--large" id="guide-title">
              A simple path to your <em>first home.</em>
            </h2>
            <p className="guide-copy">
              Buying for the first time should feel like a beginning, not a test.
              Here is how we keep the process human — and the decisions clear.
            </p>
            <button type="button" className="text-link text-link--dark" onClick={onInquire}>
              Speak to a first-home advisor
              <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </Reveal>

          <Reveal className="guide-steps" variant="right" delay={90}>
            {guideSteps.map((step, index) => {
              const isActive = activeStep === index
              return (
                <div className={`guide-step ${isActive ? 'is-active' : ''}`} key={step.title}>
                  <button
                    type="button"
                    className="guide-step-trigger"
                    onClick={() => setActiveStep(isActive ? -1 : index)}
                    aria-expanded={isActive}
                    aria-controls={`guide-step-${index}`}
                  >
                    <span className="guide-step-title">{step.title}</span>
                    <span className="guide-step-toggle" aria-hidden="true">
                      {isActive ? (
                        <Minus size={17} strokeWidth={1.6} />
                      ) : (
                        <Plus size={17} strokeWidth={1.6} />
                      )}
                    </span>
                  </button>
                  <div className="guide-step-body" id={`guide-step-${index}`}>
                    <div>
                      <p>{step.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
