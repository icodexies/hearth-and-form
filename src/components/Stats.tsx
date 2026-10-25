import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from './Reveal'

const stats = [
  {
    count: 10,
    suffix: '+',
    unit: 'Million',
    label: 'in property value thoughtfully transacted for our clients.',
  },
  {
    count: 8,
    suffix: '×',
    unit: 'More',
    label: 'qualified enquiries on homes styled by our in-house team.',
  },
  {
    count: 1,
    suffix: '+',
    unit: 'Million',
    label: 'square feet of interiors reimagined for living.',
  },
]

interface CountUpProps {
  value: number
  suffix: string
  delay?: number
}

function CountUp({ value, suffix, delay = 0 }: CountUpProps) {
  const countRef = useRef<HTMLSpanElement>(null)
  const hasRun = useRef(false)
  const [display, setDisplay] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? value
      : 0,
  )

  useEffect(() => {
    const element = countRef.current
    if (!element) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let frame = 0
    let timer = 0

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasRun.current) return
        hasRun.current = true
        observer.disconnect()

        timer = window.setTimeout(() => {
          const start = window.performance.now()
          const duration = 1100

          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.round(eased * value))
            if (progress < 1) frame = window.requestAnimationFrame(tick)
          }

          frame = window.requestAnimationFrame(tick)
        }, delay)
      },
      { threshold: 0.55 },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
      window.cancelAnimationFrame(frame)
    }
  }, [delay, value])

  return (
    <>
      <span
        ref={countRef}
        className="stat-count"
        aria-hidden="true"
        style={{ minWidth: `${String(value).length}ch` }}
      >
        {display}
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </>
  )
}

export function Stats() {
  return (
    <section className="section stats-section" aria-labelledby="stats-title">
      <div className="container">
        <div className="stats-panel">
          <Reveal className="stats-copy" variant="left">
            <p className="eyebrow eyebrow--light">
              Our record
            </p>
            <h2 className="section-title section-title--light" id="stats-title">
              A record measured in <em>homes,</em> not headlines.
            </h2>

            <div className="stats-list">
              {stats.map((stat, index) => (
                <div className="stat-row" key={stat.label}>
                  <p className="stat-value">
                    <CountUp
                      value={stat.count}
                      suffix={stat.suffix}
                      delay={index * 140}
                    />{' '}
                    <em>{stat.unit}</em>
                  </p>
                  <p className="stat-label">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="stats-footnote">
              <span className="status-dot status-dot--light" aria-hidden="true" />
              <p>Figures current as of 2026. Every one begins with a conversation.</p>
            </div>
          </Reveal>

          <Reveal className="stats-visual" variant="scale" delay={120}>
            <figure>
              <img
                src="/images/studio-living.webp"
                alt="A bright, layered living room styled with warm woods and natural textiles"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <div>
                  <span>Interior study</span>
                  <strong>The Willow House, Surrey</strong>
                </div>
                <span className="stats-visual-arrow" aria-hidden="true">
                  <ArrowUpRight size={17} strokeWidth={1.7} />
                </span>
              </figcaption>
            </figure>
            <p className="stats-visual-note">
              &ldquo;A home should hold the life you actually live.&rdquo;
              <span>— Maya Bennett, Founder</span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
