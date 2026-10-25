import { ArrowUpRight } from 'lucide-react'
import { journalEntries, type JournalEntry } from '../lib/data'
import { Reveal } from './Reveal'

interface JournalProps {
  onRead: (entry: JournalEntry) => void
}

export function Journal({ onRead }: JournalProps) {
  return (
    <section className="section journal-section" id="journal" aria-labelledby="journal-title">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <div>
              <p className="eyebrow">
                The journal
              </p>
              <h2 className="section-title" id="journal-title">
                Notes on living <em>well.</em>
              </h2>
            </div>
            <p className="section-aside">
              Observations from our studio — on light, proportion, and the small
              decisions that make a home feel like yours.
            </p>
          </div>
        </Reveal>

        <div className="journal-grid">
          {journalEntries.map((entry, index) => (
            <Reveal key={entry.slug} delay={index * 70} className="journal-reveal" variant="scale">
              <button type="button" className="journal-card" onClick={() => onRead(entry)}>
                <span className="journal-image">
                  <img src={entry.image} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="journal-meta">
                  <span>{entry.category}</span>
                  <span>{entry.readTime}</span>
                </span>
                <span className="journal-title">{entry.title}</span>
                <span className="journal-excerpt">{entry.excerpt}</span>
                <span className="journal-footer">
                  <span>{entry.date}</span>
                  <span className="journal-arrow" aria-hidden="true">
                    <ArrowUpRight size={16} strokeWidth={1.7} />
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
