# Hearth & Form

A design-led property studio portfolio: a warm, editorial landing page built with React, TypeScript, Vite, and Supabase. The layout follows the supplied wireframe while giving it a more considered, premium art direction.

The demo brand, copy, listings, testimonials, and addresses are fictional. All photography is real, downloaded from Unsplash, and credited in [CREDITS.md](./CREDITS.md). No AI-generated imagery is used.

## What is included

- Full-width, open editorial layout — normal header, no inset section shells, and a gallery that bleeds to the viewport edge
- Full-bleed slider hero with vertical slide rail and a highlight-aware property carousel
- Active hero card at full scale and opacity; inactive cards dimmed and slightly scaled down, promoting on click
- Auto-advancing hero gallery every six seconds, pausing on interaction and via a visible play/pause control
- Full-bleed mobile hero with a welcome statement and three featured property cards
- Scroll-reveal variants, animated statistics, and a slim page scroll-progress line
- Residences carousel showing a partial fourth card as a horizontal-scroll cue
- Compact floating modals on phones, with inset cards and internal scrolling
- Native page and modal scrollbars hidden while preserving keyboard, wheel, and touch scrolling
- Hidden, password-protected visitor and inquiry dashboard
- Excel-compatible CSV export for both visitors and inquiries
- Responsive one-page portfolio for a fictional property and interiors company
- Hero, featured amenities, filterable property carousel, first-timer guide accordion, testimonial slider, statistics, journal grid, services, and footer
- Property detail modals, an article reader, and an enquiry form with validation and success states
- Supabase-powered property collection with a local fallback collection
- Enquiries stored in Supabase, or in `localStorage` in demo mode
- Local variable fonts (Fraunces + Manrope via Fontsource), no runtime font CDN
- Keyboard navigation, focus trapping in modals, reduced-motion support, and responsive layouts
- Real Unsplash photography stored locally in `public/images` as optimised WebP files

## Stack

- React 19 + TypeScript
- Vite 8
- Supabase (`@supabase/supabase-js`)
- Lucide icons
- Fraunces and Manrope variable fonts
- Hand-written CSS design tokens and responsive styles

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

## Connect Supabase

The site works immediately without Supabase by using the demo collection in `src/lib/data.ts`.

To use the live database:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run [`supabase/schema.sql`](./supabase/schema.sql). It creates `properties` and `inquiries`, adds public read/insert policies, and seeds the six demo homes.
3. Create `.env.local` from `.env.example`:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   ```

   Only the **anon public** key belongs in the frontend. Never expose the service-role key.

4. Restart the dev server. The property carousel gets its collection from `properties` and displays "Live collection · Supabase" in the catalogue footer.

If the environment variables are present but the tables have not been created yet, the site logs a helpful message and falls back to the local collection rather than breaking.

### Enquiries

The public viewing/enquiry form is logged in the private owner dashboard. In production it posts to `/api/inquiries`, which writes the entry to the private Vercel Blob store. If that private inbox is unavailable, the form falls back to Supabase when configured, then to localStorage in local demo mode.

The newsletter form continues to use Supabase when configured, or localStorage in demo mode.

The private inbox records:

| Field | Notes |
| --- | --- |
| `name` | Required, 2–120 characters |
| `email` | Required, validated |
| `phone` | Optional |
| `interest` | `Buying a home`, `Selling a home`, `Interior design`, `General enquiry` |
| `message` | Optional, max 4,000 characters |
| `propertySlug` | Optional property reference |
| `source` | `website` or `property` |
| `consent` | Required before submission |

Supabase remains the fallback if you configure it. The `supabase/schema.sql` file still creates a public insert-only `inquiries` table for that fallback.

### Private analytics dashboard

The site includes a hidden dashboard for the owner. It is not linked anywhere on the public website.

- URL: `https://hearth-and-form-eight.vercel.app/#/studio/visits`
- Access is protected by the `ANALYTICS_ADMIN_KEY` secret configured in Vercel.
- Two tabs: **Visitors** and **Inquiries**.
- Data is stored in a **private Vercel Blob store**, not in the public site bundle.
- Visitors are pseudonymous: timestamp, path, referral domain, approximate country/city, device, browser, and a short **Visitor ID** (for example `HF-4F9A2C`) derived from a server-side hash of network and browser details. Repeated visits from the same browser and network share the same ID, and the table marks returning visitors.
- Actual visitor names and emails are **not** known from browsing alone. They appear only when someone submits the inquiry form.
- Inquiries include the contact details the visitor chose to submit: name, email, optional phone, message, interest, property reference, source, approximate location, device, browser, and the same Visitor ID where available.
- The latest 150 entries per tab are shown, with an **Excel export** button for the active tab. Each export downloads a `.csv` file readable by Excel.
- The Visitors table shows the short Visitor ID and a "Returning" count, and the same ID is included in the CSV export. The Inquiries table also shows the Visitor ID so an inquiry can be matched to earlier visits.
- Bots are filtered from the visitor log, and the dashboard/API are marked `noindex`.

Required Vercel environment variables:

| Variable | Purpose |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Injected automatically by the connected Vercel Blob store |
| `ANALYTICS_ADMIN_KEY` | Secret key used to unlock the dashboard and call the private APIs |
| `VISIT_HASH_SALT` | Server-side salt used to create the short pseudonymous Visitor IDs |

The actual values are never committed to this repository. Visit and inquiry data is private to the Vercel project owner.

### Replace seed media

Seed rows use paths such as `/images/home-alder.webp`. You can either keep the bundled photos or upload your own to Supabase Storage and update `image_url` for each property. `image_url` accepts any absolute URL as well.

## Project structure

```text
BusinessPortfolio/
├─ api/
│  ├─ track.ts                 # privacy-preserving page-view recorder
│  ├─ inquiries.ts             # public inquiry intake + private feed
│  └─ visits.ts                # password-protected visit feed
├─ public/
│  ├─ favicon.svg
│  └─ images/                 # downloaded photography
├─ src/
│  ├─ components/
│  │  ├─ AdminVisits.tsx
│  │  ├─ ArticleModal.tsx
│  │  ├─ BrandMark.tsx
│  │  ├─ FeatureStrip.tsx
│  │  ├─ Footer.tsx
│  │  ├─ Guide.tsx
│  │  ├─ Header.tsx
│  │  ├─ Hero.tsx
│  │  ├─ InquiryModal.tsx
│  │  ├─ Journal.tsx
│  │  ├─ Listings.tsx
│  │  ├─ Modal.tsx
│  │  ├─ PropertyCard.tsx
│  │  ├─ PropertyModal.tsx
│  │  ├─ Reveal.tsx
│  │  ├─ ScrollProgress.tsx
│  │  ├─ Services.tsx
│  │  ├─ Stats.tsx
│  │  └─ Testimonials.tsx
│  ├─ hooks/
│  │  ├─ useProperties.ts
│  │  └─ useVisitTracker.ts
│  ├─ lib/
│  │  ├─ data.ts
│  │  ├─ format.ts
│  │  ├─ inquiries.ts
│  │  └─ supabase.ts
│  ├─ App.tsx
│  ├─ admin.css
│  ├─ main.tsx
│  └─ styles.css
├─ supabase/schema.sql
├─ tsconfig.api.json
├─ .env.example
├─ CREDITS.md
└─ README.md
```

## Deploy

Any static host works (Vercel, Netlify, Cloudflare Pages, GitHub Pages). Build command `npm run build`, output directory `dist`. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables for the production deployment.

Before going live, replace the fictional content and set absolute production URLs for the Open Graph image and canonical metadata in `index.html`. The current paths are intentionally host-agnostic.

## Customising

- **Brand and copy:** `src/lib/data.ts`, plus section copy in each component.
- **Hero slides:** edit `heroPropertySlugs` in `src/components/Hero.tsx`; the slides pull from `demoProperties` in `src/lib/data.ts`.
- **Colour and type tokens:** the `:root` block at the top of `src/styles.css`.
- **Photography:** replace files in `public/images` and update the paths in `src/lib/data.ts` / the Supabase seed.
- **Enquiry fields:** update `InquiryModal.tsx` and the matching columns in `supabase/schema.sql`.
- **Social handles and contact details:** `Footer.tsx` and `Header.tsx`.

## Scripts

```bash
npm run dev          # start Vite
npm run build        # type-check app + API, then build
npm run preview      # preview the build
npm run lint         # oxlint
npm run typecheck:api # type-check the Vercel functions
```

## Demo notice

Hearth & Form is a portfolio demonstration. The company, agent, properties, testimonials, figures, and contact details are fictional. Replace them before using the project commercially.
