interface BrandMarkProps {
  className?: string
}

export function BrandMark({ className = '' }: BrandMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 29V14.8C5 8.28 9.92 3 16 3s11 5.28 11 11.8V29h-6.2V14.8c0-2.83-2.15-5.05-4.8-5.05s-4.8 2.22-4.8 5.05V29H5Z"
        fill="currentColor"
      />
      <circle cx="16" cy="26" r="1.8" fill="currentColor" opacity=".55" />
    </svg>
  )
}
