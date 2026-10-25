import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  children: ReactNode
  onClose: () => void
  labelledBy: string
  className?: string
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ children, onClose, labelledBy, className = '' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const panel = panelRef.current
    const getFocusable = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []).filter(
        (element) => element.offsetParent !== null,
      )

    const focusTimer = window.setTimeout(() => {
      const firstField = panel?.querySelector<HTMLElement>('[data-autofocus]')
      ;(firstField ?? getFocusable()[0])?.focus()
    }, 40)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = getFocusable()
      if (!focusable.length) {
        event.preventDefault()
        panel?.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && (activeElement === first || !panel?.contains(activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (activeElement === last || !panel?.contains(activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [])

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeRef.current()
      }}
    >
      <div
        ref={panelRef}
        className={`modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <button
          type="button"
          className="modal-close"
          onClick={() => closeRef.current()}
          aria-label="Close dialog"
        >
          <X size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  )
}
