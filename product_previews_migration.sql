-- Run this in the Supabase SQL editor (after roles_and_products_migration.sql).
-- Stores a saved snapshot (HTML) of each product's production / web link, so the
-- live preview is served from our own database instead of re-fetching the site
-- on every visit. Snapshots are refreshed only when a Super Admin asks for it.

create table if not exists public.product_previews (
  product_id uuid not null references public.products(id) on delete cascade,
  kind       text not null check (kind in ('production', 'web')),
  source_url text not null,
  html       text,
  status     text not null default 'ok' check (status in ('ok', 'error')),
  error      text,
  fetched_at timestamptz not null default now(),
  primary key (product_id, kind)
);

-- No policies on purpose: only the server (service role) reads or writes this table.
alter table public.product_previews enable row level security;
