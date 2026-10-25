-- =========================================================
-- Hearth & Form — Supabase schema
-- Run this in the Supabase SQL editor for a new project.
-- =========================================================

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  location text not null,
  category text not null check (category in ('Apartment', 'Villa', 'Townhouse')),
  price integer not null check (price >= 0),
  bedrooms smallint not null check (bedrooms >= 0),
  bathrooms smallint not null check (bathrooms >= 0),
  area_sqft integer not null check (area_sqft > 0),
  image_url text not null,
  tag text,
  description text not null,
  features text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  email text not null check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text,
  interest text not null default 'General enquiry',
  message text,
  property_slug text references public.properties(slug) on delete set null,
  source text not null default 'website'
);

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

create index if not exists properties_published_order_idx
  on public.properties (published, sort_order);

-- ---------------------------------------------------------
-- Access rules
-- ---------------------------------------------------------

alter table public.properties enable row level security;
alter table public.inquiries enable row level security;

revoke all on public.properties from anon, authenticated;
revoke all on public.inquiries from anon, authenticated;

grant select on public.properties to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;

drop policy if exists "Published properties are publicly readable" on public.properties;
create policy "Published properties are publicly readable"
  on public.properties
  for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Visitors can submit an inquiry" on public.inquiries;
create policy "Visitors can submit an inquiry"
  on public.inquiries
  for insert
  to anon, authenticated
  with check (
    char_length(trim(name)) between 2 and 120
    and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    and char_length(coalesce(message, '')) <= 4000
  );

-- ---------------------------------------------------------
-- Seed collection
-- Image paths point to /public/images in this repository.
-- Replace image_url with Supabase Storage URLs if preferred.
-- ---------------------------------------------------------

insert into public.properties (
  slug, title, location, category, price, bedrooms, bathrooms, area_sqft,
  image_url, tag, description, features, featured, published, sort_order
) values
  (
    'alder-house',
    'The Alder House',
    'Hampstead, London',
    'Villa',
    2850000,
    5,
    4,
    3420,
    '/images/home-alder.webp',
    'Private viewing',
    'A calm, low-slung villa arranged around a courtyard pool. Clean lines, deep eaves, and wide openings make the garden feel like the largest room in the house.',
    array['Courtyard pool', 'Mature private garden', 'Double-height living room', 'Studio annexe', 'Off-street parking for two cars'],
    true,
    true,
    1
  ),
  (
    'marlow-house',
    'Marlow House',
    'Richmond, London',
    'Villa',
    1975000,
    4,
    3,
    2680,
    '/images/home-marlow.webp',
    'Just listed',
    'Tucked behind a quiet Richmond lane, Marlow House pairs warm timber, blackened steel, and a generous south-facing garden. It is a home that gets better with the seasons.',
    array['South-facing garden', 'Timber-framed kitchen', 'Garden studio', 'Underfloor heating', 'EV charging'],
    true,
    true,
    2
  ),
  (
    'atelier-one',
    'Atelier One',
    'Shoreditch, London',
    'Apartment',
    895000,
    2,
    2,
    1180,
    '/images/home-atelier.webp',
    'Loft living',
    'A light-filled warehouse conversion with an open-plan living space, a quiet mezzanine, and a private terrace above the rooftops of Shoreditch.',
    array['Private roof terrace', 'Warehouse windows', 'Mezzanine study', 'Concierge', 'Secure bike storage'],
    false,
    true,
    3
  ),
  (
    'kingsley-loft',
    'The Kingsley Loft',
    'Notting Hill, London',
    'Apartment',
    1150000,
    3,
    2,
    1540,
    '/images/home-kingsley.webp',
    'New to market',
    'Set behind a discreet Notting Hill facade, this split-level loft opens to a planted courtyard. A rare mix of privacy, proportion, and true outside space in W11.',
    array['Private courtyard', 'Split-level living', 'Bespoke joinery', 'Principal suite', 'Share of freehold'],
    true,
    true,
    4
  ),
  (
    'cedar-house',
    'Cedar House',
    'Islington, London',
    'Townhouse',
    1450000,
    4,
    3,
    2140,
    '/images/home-cedar.webp',
    'Chain free',
    'A beautifully reworked Victorian townhouse with a pared-back material palette, a kitchen that opens to the garden, and light at every turn.',
    array['South-facing garden', 'Extended kitchen', 'Original cornices', 'Cellar storage', 'Chain free'],
    false,
    true,
    5
  ),
  (
    'rosewood-house',
    'Rosewood House',
    'The Cotswolds',
    'Townhouse',
    1680000,
    5,
    4,
    2960,
    '/images/home-rosewood.webp',
    'Country retreat',
    'A stone-built retreat on the edge of a Cotswold village, with a walled garden, a pool, and enough room for the whole family to disappear into a good book.',
    array['Walled garden', 'Heated pool', 'Guest cottage', 'Wood-burning stoves', 'Village location'],
    false,
    true,
    6
  )
on conflict (slug) do nothing;
