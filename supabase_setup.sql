-- ═══════════════════════════════════════════════════════
-- GREAT PROPERTIES GA — SUPABASE SCHEMA
-- Ejecuta este SQL en Supabase → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════

-- 1. PROPIEDADES
create table if not exists properties (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  address text,
  city text,
  state text default 'GA',
  zip text,
  price numeric,
  bedrooms int,
  bathrooms numeric,
  sqft int,
  lot_size text,
  property_type text check (property_type in ('single-family','condo','multi-family','commercial','land','other')),
  status text default 'available' check (status in ('available','pending','sold')),
  description text,
  features text[], -- array de features
  images text[],   -- array de URLs de imagenes
  featured boolean default false,
  sort_order int default 0
);

-- 2. LEADS (formularios del sitio)
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text,
  email text,
  phone text,
  zip text,
  address text,
  subject text,
  message text,
  source text,  -- hero-home, sell-sidebar, contact-page, etc.
  status text default 'new' check (status in ('new','contacted','qualified','closed','dead')),
  notes text
);

-- 3. SITE SETTINGS (logo, textos, videos, imagenes)
create table if not exists site_settings (
  key text primary key,
  value text,
  label text,
  type text default 'text' check (type in ('text','textarea','url','image_url','color')),
  section text,
  updated_at timestamptz default now()
);

-- Valores por defecto de settings
insert into site_settings (key, value, label, type, section) values
  ('site_phone',        '404-590-1613',                             'Teléfono',              'text',      'contact'),
  ('site_email',        'info@greatpropertiesga.com',               'Email',                 'text',      'contact'),
  ('site_address',      'Serving all of Georgia',                   'Dirección / Área',      'text',      'contact'),
  ('logo_url',          '',                                         'URL del Logo',          'image_url', 'branding'),
  ('logo_text',         'Great Properties GA, LLC',                 'Texto del Logo',        'text',      'branding'),
  ('brand_color',       '#c0392b',                                  'Color Principal',       'color',     'branding'),
  ('hero_title',        'Need to sell your home quickly? We can help!', 'Título Hero',       'text',      'homepage'),
  ('hero_subtitle',     'We buy houses, condos, land, commercial properties and multi-family units across all of Georgia — fast, fair, and hassle-free.', 'Subtítulo Hero', 'textarea', 'homepage'),
  ('hero_image_url',    '',                                         'Imagen Hero (URL)',     'image_url', 'homepage'),
  ('hero_video_url',    '',                                         'Video Hero (URL)',      'url',       'homepage'),
  ('about_text',        'Great Properties GA, LLC is a Georgia-based real estate investment and redevelopment company.', 'Texto About', 'textarea', 'about'),
  ('footer_text',       'Georgia''s trusted real estate investment & redevelopment company.', 'Texto Footer', 'textarea', 'footer'),
  ('meta_title',        'Great Properties GA, LLC — Serious About Buying. Serious About Closing.', 'Meta Title SEO', 'text', 'seo'),
  ('meta_description',  'We buy houses in any condition across all of Georgia. Fast cash offers, no fees, no repairs.', 'Meta Description SEO', 'textarea', 'seo')
on conflict (key) do nothing;

-- 4. ROW LEVEL SECURITY — público puede INSERT leads, todo lo demás requiere anon key
alter table leads enable row level security;
alter table properties enable row level security;
alter table site_settings enable row level security;

-- Policies: anon puede leer todo (para el sitio) y crear leads
create policy "Public can read properties" on properties for select using (true);
create policy "Public can read settings"   on site_settings for select using (true);
create policy "Public can insert leads"    on leads for insert with check (true);

-- Admin (anon key desde el panel) puede hacer todo
create policy "Admin full access properties" on properties for all using (true) with check (true);
create policy "Admin full access leads"      on leads      for all using (true) with check (true);
create policy "Admin full access settings"   on site_settings for all using (true) with check (true);

-- ═══════════════════════════════════════════════════════
-- STORAGE BUCKET para imágenes
-- Ve a Storage → New Bucket → nombre: "gpga-media" → Public: ON
-- ═══════════════════════════════════════════════════════
