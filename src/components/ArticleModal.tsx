import type { JournalEntry } from '../lib/data'
import { Modal } from './Modal'

interface ArticleModalProps {
  entry: JournalEntry
  onClose: () => void
}

export function ArticleModal({ entry, onClose }: ArticleModalProps) {
  return (
    <Modal onClose={onClose} labelledBy="article-modal-title" className="article-modal">
      <div className="article-hero">
        <img src={entry.image} alt="" decoding="async" />
        <div className="article-hero-meta">
          <span>{entry.category}</span>
          <span>{entry.readTime}</span>
        </div>
      </div>
      <div className="article-content">
        <p className="eyebrow">
          Journal · {entry.date}
        </p>
        <h2 id="article-modal-title">{entry.title}</h2>
        <p className="article-lede">{entry.excerpt}</p>
        <div className="article-body">
          {entry.body.map((paragraph) => (
            <p key={paragraph.slice(0, 30)}>{paragraph}</p>
          ))}
        </div>
        <div className="article-byline">
          <span className="agent-monogram" aria-hidden="true">
            MB
          </span>
          <div>
            <strong>Words by Maya Bennett</strong>
            <span>Founder, Hearth &amp; Form</span>
          </div>
        </div>
        <button type="button" className="btn btn--dark" onClick={onClose}>
          Back to the journal
        </button>
      </div>
    </Modal>
  )
}
