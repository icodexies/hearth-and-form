import { useCallback, useEffect, useState } from 'react'
import { Header } from './components/Header'
import { ScrollProgress } from './components/ScrollProgress'
import { Hero } from './components/Hero'
import { FeatureStrip } from './components/FeatureStrip'
import { Listings } from './components/Listings'
import { Guide } from './components/Guide'
import { Testimonials } from './components/Testimonials'
import { Stats } from './components/Stats'
import { Journal } from './components/Journal'
import { Services } from './components/Services'
import { Footer } from './components/Footer'
import { PropertyModal } from './components/PropertyModal'
import { InquiryModal } from './components/InquiryModal'
import { ArticleModal } from './components/ArticleModal'
import { AdminVisits } from './components/AdminVisits'
import { useVisitTracker } from './hooks/useVisitTracker'
import type { JournalEntry, Property } from './lib/data'

const ADMIN_HASH = '#/studio/visits'

interface InquiryState {
  property?: Property
  interest?: string
}

export default function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [inquiryState, setInquiryState] = useState<InquiryState | null>(null)
  const [activeArticle, setActiveArticle] = useState<JournalEntry | null>(null)
  const [currentHash, setCurrentHash] = useState(() => window.location.hash)
  const isAdminRoute = currentHash === ADMIN_HASH

  useVisitTracker(!isAdminRoute)

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash)
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const openInquiry = useCallback((property?: Property | null, interest?: string) => {
    setSelectedProperty(null)
    setInquiryState({ property: property ?? undefined, interest })
  }, [])

  const openProperty = useCallback((property: Property) => {
    setSelectedProperty(property)
  }, [])

  if (isAdminRoute) {
    return <AdminVisits />
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <ScrollProgress />
      <Header onBook={() => openInquiry()} />

      <main id="main">
        <Hero onBook={() => openInquiry()} onViewProperty={openProperty} />
        <FeatureStrip />
        <Listings
          onViewProperty={openProperty}
          onInquire={() => openInquiry(undefined, 'Buying a home')}
        />
        <Guide onInquire={() => openInquiry(undefined, 'Buying a home')} />
        <Testimonials />
        <Stats />
        <Journal onRead={setActiveArticle} />
        <Services onInquire={(interest) => openInquiry(undefined, interest)} />
      </main>

      <Footer onBook={() => openInquiry()} />

      {selectedProperty ? (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onInquire={(property) => openInquiry(property)}
        />
      ) : null}

      {inquiryState ? (
        <InquiryModal
          property={inquiryState.property}
          defaultInterest={inquiryState.interest}
          onClose={() => setInquiryState(null)}
        />
      ) : null}

      {activeArticle ? (
        <ArticleModal entry={activeArticle} onClose={() => setActiveArticle(null)} />
      ) : null}
    </>
  )
}
