import { SlidersHorizontal, Sun, Trees } from 'lucide-react'

const features = [
  {
    icon: SlidersHorizontal,
    title: 'Flexible plans',
    copy: 'Buy, sell, or style at the pace that suits you.',
  },
  {
    icon: Trees,
    title: 'Private gardens',
    copy: 'A little outside space, treated like another room.',
  },
  {
    icon: Sun,
    title: 'Spacious balconies',
    copy: 'Morning light and a place to watch the city wake.',
  },
]

export function FeatureStrip() {
  return (
    <div className="features-shell">
      <div className="features" aria-label="What we look for in every home">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div className="feature" key={feature.title}>
              <span className="feature-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.5} />
              </span>
              <div>
                <p className="feature-title">{feature.title}</p>
                <p className="feature-copy">{feature.copy}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
