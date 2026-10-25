import { useEffect, useRef } from 'react'

/**
 * A quiet progress line for the page now that the native scrollbar is hidden.
 * The DOM is updated directly so scrolling does not re-render the page.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = documentHeight > 0 ? window.scrollY / documentHeight : 0
      const clamped = Math.min(Math.max(progress, 0), 1)

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${clamped})`
      }
    }

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [])

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span ref={barRef} />
    </div>
  )
}
