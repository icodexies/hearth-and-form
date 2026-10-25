export type PropertyCategory = 'Apartment' | 'Villa' | 'Townhouse'

export interface Property {
  id: string
  slug: string
  title: string
  location: string
  category: PropertyCategory
  price: number
  bedrooms: number
  bathrooms: number
  areaSqft: number
  image: string
  tag: string | null
  description: string
  features: string[]
  featured: boolean
  sortOrder: number
}

export type PropertyFilter = 'All' | PropertyCategory

export const propertyFilters: Array<{ label: string; value: PropertyFilter }> = [
  { label: 'All homes', value: 'All' },
  { label: 'Apartments', value: 'Apartment' },
  { label: 'Villas', value: 'Villa' },
  { label: 'Townhouses', value: 'Townhouse' },
]

export const demoProperties: Property[] = [
  {
    id: 'alder-house',
    slug: 'alder-house',
    title: 'The Alder House',
    location: 'Hampstead, London',
    category: 'Villa',
    price: 2850000,
    bedrooms: 5,
    bathrooms: 4,
    areaSqft: 3420,
    image: '/images/home-alder.webp',
    tag: 'Private viewing',
    description:
      'A calm, low-slung villa arranged around a courtyard pool. Clean lines, deep eaves, and wide openings make the garden feel like the largest room in the house.',
    features: ['Courtyard pool', 'Mature private garden', 'Double-height living room', 'Studio annexe', 'Off-street parking for two cars'],
    featured: true,
    sortOrder: 1,
  },
  {
    id: 'marlow-house',
    slug: 'marlow-house',
    title: 'Marlow House',
    location: 'Richmond, London',
    category: 'Villa',
    price: 1975000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqft: 2680,
    image: '/images/home-marlow.webp',
    tag: 'Just listed',
    description:
      'Tucked behind a quiet Richmond lane, Marlow House pairs warm timber, blackened steel, and a generous south-facing garden. It is a home that gets better with the seasons.',
    features: ['South-facing garden', 'Timber-framed kitchen', 'Garden studio', 'Underfloor heating', 'EV charging'],
    featured: true,
    sortOrder: 2,
  },
  {
    id: 'atelier-one',
    slug: 'atelier-one',
    title: 'Atelier One',
    location: 'Shoreditch, London',
    category: 'Apartment',
    price: 895000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1180,
    image: '/images/home-atelier.webp',
    tag: 'Loft living',
    description:
      'A light-filled warehouse conversion with an open-plan living space, a quiet mezzanine, and a private terrace above the rooftops of Shoreditch.',
    features: ['Private roof terrace', 'Warehouse windows', 'Mezzanine study', 'Concierge', 'Secure bike storage'],
    featured: false,
    sortOrder: 3,
  },
  {
    id: 'kingsley-loft',
    slug: 'kingsley-loft',
    title: 'The Kingsley Loft',
    location: 'Notting Hill, London',
    category: 'Apartment',
    price: 1150000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqft: 1540,
    image: '/images/home-kingsley.webp',
    tag: 'New to market',
    description:
      'Set behind a discreet Notting Hill facade, this split-level loft opens to a planted courtyard. A rare mix of privacy, proportion, and true outside space in W11.',
    features: ['Private courtyard', 'Split-level living', 'Bespoke joinery', 'Principal suite', 'Share of freehold'],
    featured: true,
    sortOrder: 4,
  },
  {
    id: 'cedar-house',
    slug: 'cedar-house',
    title: 'Cedar House',
    location: 'Islington, London',
    category: 'Townhouse',
    price: 1450000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqft: 2140,
    image: '/images/home-cedar.webp',
    tag: 'Chain free',
    description:
      'A beautifully reworked Victorian townhouse with a pared-back material palette, a kitchen that opens to the garden, and light at every turn.',
    features: ['South-facing garden', 'Extended kitchen', 'Original cornices', 'Cellar storage', 'Chain free'],
    featured: false,
    sortOrder: 5,
  },
  {
    id: 'rosewood-house',
    slug: 'rosewood-house',
    title: 'Rosewood House',
    location: 'The Cotswolds',
    category: 'Townhouse',
    price: 1680000,
    bedrooms: 5,
    bathrooms: 4,
    areaSqft: 2960,
    image: '/images/home-rosewood.webp',
    tag: 'Country retreat',
    description:
      'A stone-built retreat on the edge of a Cotswold village, with a walled garden, a pool, and enough room for the whole family to disappear into a good book.',
    features: ['Walled garden', 'Heated pool', 'Guest cottage', 'Wood-burning stoves', 'Village location'],
    featured: false,
    sortOrder: 6,
  },
]

export interface Testimonial {
  quote: string
  name: string
  role: string
  location: string
  project: string
  image: string
  room: string
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'Hearth & Form did not just find us a house; they helped us recognise a home. Every room now feels like a decision we made together.',
    name: 'Amara Okafor',
    role: 'Founder, Sable Studio',
    location: 'Notting Hill',
    project: 'The Kingsley Loft',
    image: '/images/client-amara.webp',
    room: '/images/testimonial-interior.webp',
  },
  {
    quote:
      'The team handled the negotiation, the paperwork, and even the final styling. I moved in with two suitcases and a very good feeling.',
    name: 'Adewale Balogun',
    role: 'Strategy Director',
    location: 'Hampstead',
    project: 'The Alder House',
    image: '/images/client-adewale.webp',
    room: '/images/testimonial-interior-two.webp',
  },
  {
    quote:
      'Their eye for light and proportion changed the way I saw the whole search. We ended up in a home I would have walked past.',
    name: 'Zainab Yusuf',
    role: 'Art Director',
    location: 'Richmond',
    project: 'Marlow House',
    image: '/images/client-zainab.webp',
    room: '/images/testimonial-interior.webp',
  },
  {
    quote:
      'They listened for the details I did not know how to say. That is the difference between a purchase and a place of your own.',
    name: 'Tomi Adeyemi',
    role: 'Author',
    location: 'The Cotswolds',
    project: 'Rosewood House',
    image: '/images/client-tomi.webp',
    room: '/images/testimonial-interior-two.webp',
  },
]

export interface GuideStep {
  title: string
  description: string
}

export const guideSteps: GuideStep[] = [
  {
    title: 'Start with a feeling',
    description:
      'Tell us how you want your days to feel. We translate the practical brief and the emotional one into a shortlist worth leaving the house for.',
  },
  {
    title: 'See it in person',
    description:
      'We arrange private viewings and come with questions — about light, noise, neighbours, and the things a floor plan cannot tell you.',
  },
  {
    title: 'Know every number',
    description:
      'From offer to survey, mortgage to legal, we make the costs and the trade-offs clear before you commit to a single one of them.',
  },
  {
    title: 'Move in, beautifully',
    description:
      'Our interiors team can stay on to handle the pieces that make a house yours — or simply hand over the keys and leave you to it.',
  },
]

export interface JournalEntry {
  slug: string
  category: string
  date: string
  readTime: string
  title: string
  excerpt: string
  image: string
  body: string[]
}

export const journalEntries: JournalEntry[] = [
  {
    slug: 'geometry-of-an-entryway',
    category: 'Design',
    date: '12 Sep 2026',
    readTime: '6 min read',
    title: 'The quiet geometry of a good entryway',
    excerpt: 'The first three metres of a home do more work than any other. A note on arrival, pace, and the art of putting things down.',
    image: '/images/journal-entryway.webp',
    body: [
      'An entryway is not really a room. It is a transition — a place where the weather, the day, and the version of yourself you present to the world are left at the door. When it works, you barely notice it. When it does not, you feel it every single day.',
      'We look for three things: a clear line to the light, a place to pause, and somewhere to put the things you are carrying. A bench, a slim console, a hook at the right height. None of these are extravagant. Together, they change how the rest of the house feels.',
      'The best entrance halls are also a little generous. They give you room to turn around, to greet someone, to close the door behind you without negotiating with a coat rack. It is a small piece of choreography, and it is worth designing for.',
    ],
  },
  {
    slug: 'read-a-floor-plan',
    category: 'Guides',
    date: '28 Aug 2026',
    readTime: '8 min read',
    title: 'How to read a floor plan like an architect',
    excerpt: 'Ignore the furniture drawings. Look for light, circulation, and the spaces nobody has labelled.',
    image: '/images/journal-dining.webp',
    body: [
      'The first thing to ignore on a floor plan is the furniture. It is there to make the room feel possible, not to tell you how you would live in it. The second thing to ignore is the colour of the walls. What matters is what cannot be changed easily.',
      'Start with the path from the front door. How many steps before you can put down a bag? How does the morning light arrive? Where does the kitchen connect to the garden, and is that connection a door, a window, or a walk around the outside?',
      'Then look for the rooms nobody has named. The awkward corner, the deep alcove, the hall wide enough for a desk. These are often the places where a house becomes personal. A good floor plan leaves room for that discovery.',
    ],
  },
  {
    slug: 'slower-furnishing',
    category: 'Interiors',
    date: '14 Aug 2026',
    readTime: '5 min read',
    title: 'A slower approach to furnishing a first home',
    excerpt: 'You do not need to finish a home in a weekend. Leave a little room for the table you have not found yet.',
    image: '/images/journal-bedroom.webp',
    body: [
      'There is a particular pressure in a first home: to make it look finished. To have the sofa, the rug, the prints, and the good lamp all at once. But the rooms we remember tend to be the ones that were allowed to take their time.',
      'Begin with the pieces you use every day — the bed, the table, the chair by the window. Choose them for comfort and proportion before colour. Then live in the room for a while. You will learn where the light falls, where people gather, and where you want nothing at all.',
      'A home is not a styling exercise. It is a record of how you spend your time. Leave space for the objects and rituals that have not arrived yet.',
    ],
  },
  {
    slug: 'the-first-thing-we-look-for',
    category: 'Notes',
    date: '30 Jul 2026',
    readTime: '4 min read',
    title: 'Why light is the first thing we look for',
    excerpt: 'Before the number of bedrooms, before the postcode, there is the question of how the light lands.',
    image: '/images/journal-pool.webp',
    body: [
      'Light is the one thing you cannot renovate into a house. You can rewire it, refinish it, rethink it. You cannot move the sun. So it is the first thing we check on any viewing, ideally at more than one time of day.',
      'We look for orientation, certainly, but also for bounce. A north-facing room with tall windows and pale walls can be more alive than a south-facing room with a low ceiling. We look for the way a hallway borrows light from the kitchen, and for the places the afternoon gets stuck.',
      'When a home has good light, everything else becomes easier. Furniture settles. Colours behave. The house has a mood before you have added a single thing. That is the kind of home worth waiting for.',
    ],
  },
]

export interface Service {
  index: string
  title: string
  description: string
  detail: string
  tags: string[]
}

export const services: Service[] = [
  {
    index: '01',
    title: 'Furniture design',
    description: 'A home should fit the people in it.',
    detail:
      'We source, commission, and place pieces that earn their space — from a single reading chair to the table everyone will gather around.',
    tags: ['Sourcing', 'Bespoke commissions', 'Placement'],
  },
  {
    index: '02',
    title: 'Interior details',
    description: 'The small decisions make the room.',
    detail:
      'Lighting plans, joinery, hardware, and finishes. The quiet, technical work that lets a space feel effortless long after the photos are taken.',
    tags: ['Lighting', 'Joinery', 'Finishes'],
  },
  {
    index: '03',
    title: 'Home revamping',
    description: 'Fall back in love with what you own.',
    detail:
      'A considered refresh of the spaces you already have, from a single room to a whole-floor rethink — less waste, more belonging.',
    tags: ['Room refresh', 'Styling', 'Project delivery'],
  },
]

export const navLinks = [
  { label: 'Residences', href: '#residences' },
  { label: 'First-timer guide', href: '#guide' },
  { label: 'Journal', href: '#journal' },
  { label: 'Services', href: '#services' },
]
