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

The viewing form and newsletter form insert into `public.inquiries`:

| Column | Notes |
| --- | --- |
| `name` | Required, 2–120 characters |
| `email` | Required, validated |
| `phone` | Optional |
| `interest` | `Buying a home`, `Selling a home`, `Interior design`, `General enquiry`, or `Newsletter` |
| `message` | Optional, max 4,000 characters |
| `property_slug` | Optional foreign key to `properties.slug` |
| `source` | `website`, `property`, or `newsletter` |

The insert policy allows anonymous submissions but provides no anonymous read access. View submissions in the Supabase Table Editor or add a private dashboard with authenticated access.

Without environment variables, submissions are stored locally under `hearth-and-form:inquiries` so the demo can still be reviewed end to end. The confirmation screen notes this demo state.

### Replace seed media

Seed rows use paths such as `/images/home-alder.webp`. You can either keep the bundled photos or upload your own to Supabase Storage and update `image_url` for each property. `image_url` accepts any absolute URL as well.

## Project structure

```text
BusinessPortfolio/
├─ public/
│  ├─ favicon.svg
│  └─ images/                 # downloaded photography
├─ src/
│  ├─ components/
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
│  │  ├─ Services.tsx
│  │  ├─ Stats.tsx
│  │  └─ Testimonials.tsx
│  ├─ hooks/
│  │  └─ useProperties.ts
│  ├─ lib/
│  │  ├─ data.ts
│  │  ├─ format.ts
│  │  ├─ inquiries.ts
│  │  └─ supabase.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ styles.css
├─ supabase/schema.sql
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
npm run dev      # start Vite
npm run build    # type-check and build
npm run preview  # preview the build
npm run lint     # oxlint
```

## Demo notice

Hearth & Form is a portfolio demonstration. The company, agent, properties, testimonials, figures, and contact details are fictional. Replace them before using the project commercially.
