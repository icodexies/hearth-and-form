import { useEffect, useRef, useState, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  variant?: 'up' | 'left' | 'right' | 'scale'
}

/**
 * A small, dependency-free intersection reveal.
 * Content remains visible when reduced motion is requested.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  variant = 'up',
}: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element || isVisible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [isVisible])

  const variantClass = variant === 'up' ? '' : `reveal--${variant}`

  return (
    <div
      ref={elementRef}
      className={`reveal ${variantClass} ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
