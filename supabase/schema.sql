-- =============================================================================
-- NexEris — complete database schema (current state)
-- =============================================================================
-- USE THIS for a NEW, EMPTY Supabase project (SQL editor -> paste -> run).
-- Your existing project is already set up: apply only the files in
-- supabase/migrations/ that it is missing, never this whole file.
--
-- Part 1 (profiles, allowed_members, profile_likes, avatars/covers storage and their
-- policies) was RECONSTRUCTED from what the app code reads and writes, because the
-- original base schema was created in the dashboard. Compare it with your live
-- database before relying on it:
--     supabase db dump --schema public > live_public_schema.sql
-- Parts 2-5 mirror supabase/migrations/ exactly.
-- =============================================================================


-- =============================================================================
-- PART 1 — Core: profiles, allowed members, likes (reconstructed from the app)
-- =============================================================================

create table if not exists public.profiles (
  id              uuid primary key default gen_random_uuid(),
  auth_user_id    uuid not null unique references auth.users(id) on delete cascade,
  email           text not null,
  username        text not null unique,
  nex_id          text unique,                       -- generated once at sign-up
  full_name       text not null,
  position        text,
  department      text,
  pronouns        text,
  bio             text,
  github_username text,
  portfolio_url   text,
  avatar_url      text,
  cover_url       text,
  cover_position  numeric,
  whatsapp        text,
  facebook        text,
  instagram       text,
  role            text not null default 'member'
                  check (role in ('member', 'admin', 'super_admin')),
  exp_points      integer not null default 0
                  constraint profiles_exp_points_non_negative check (exp_points >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Only emails in this table may sign in and get a profile.
create table if not exists public.allowed_members (
  id    uuid primary key default gen_random_uuid(),
  email text not null unique,
  role  text not null default 'member'
        check (role in ('member', 'admin', 'super_admin'))
);

create table if not exists public.profile_likes (
  id                 uuid primary key default gen_random_uuid(),
  profile_id         uuid not null references public.profiles(id) on delete cascade,
  liker_auth_user_id uuid not null references auth.users(id) on delete cascade,
  created_at         timestamptz not null default now(),
  unique (profile_id, liker_auth_user_id)
);

alter table public.profiles        enable row level security;
alter table public.allowed_members enable row level security;
alter table public.profile_likes   enable row level security;

-- Profiles and like counts are public; writes to profiles / allowed_members happen
-- on the server with the service role after a role check in code.
drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public" on public.profiles for select using (true);

drop policy if exists "profile likes are public" on public.profile_likes;
create policy "profile likes are public" on public.profile_likes for select using (true);

drop policy if exists "members can like as themselves" on public.profile_likes;
create policy "members can like as themselves" on public.profile_likes
  for insert with check (liker_auth_user_id = auth.uid());

drop policy if exists "members can remove their own like" on public.profile_likes;
create policy "members can remove their own like" on public.profile_likes
  for delete using (liker_auth_user_id = auth.uid());

-- allowed_members: no policies on purpose (server / service role only).

-- Avatar and cover uploads (the browser uploads into a folder named after the user's auth id).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "members manage their own avatar and cover files" on storage.objects;
create policy "members manage their own avatar and cover files" on storage.objects
  for all to authenticated
  using (bucket_id in ('avatars', 'covers') and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id in ('avatars', 'covers') and (storage.foldername(name))[1] = auth.uid()::text);


-- =============================================================================
-- PART 2 — Products   (migration 20261021000000_roles_and_products.sql)
-- =============================================================================

create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  product_id     text not null unique,          -- App / Product ID, e.g. NXP-001
  slug           text not null unique,          -- used in /products/<slug>
  name           text not null,
  kind           text,
  description    text,
  logo_url       text,
  repo_url       text,
  production_url text,
  web_url        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.product_developers (
  product_id uuid not null references public.products(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  primary key (product_id, profile_id)
);

alter table public.products           enable row level security;
alter table public.product_developers enable row level security;

drop policy if exists "products are public" on public.products;
create policy "products are public" on public.products for select using (true);

drop policy if exists "product developers are public" on public.product_developers;
create policy "product developers are public" on public.product_developers for select using (true);

-- Logos are uploaded through the server (/api/products/logo), so no storage policy is needed.
insert into storage.buckets (id, name, public)
values ('product-logos', 'product-logos', true)
on conflict (id) do nothing;

-- First Super Admin (edit the username, then uncomment):
-- update public.profiles set role = 'super_admin' where username = 'arabiislam46ar';


-- =============================================================================
-- PART 3 — Product preview snapshots   (migration 20261022000000_product_previews.sql)
-- =============================================================================

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


-- =============================================================================
-- PART 4 — API keys   (migration 20261022000100_api_keys.sql)
-- =============================================================================

create table if not exists public.api_keys (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                         -- e.g. "Mobile app", "Marketing site"
  key           text not null unique,                  -- nxk_live_...
  scopes        text[] not null default '{team,products}',
  is_active     boolean not null default true,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz,
  request_count bigint not null default 0
);

alter table public.api_keys enable row level security;
-- No policies on purpose: keys are never readable with the public anon key.

create or replace function public.increment_api_key_usage(p_key_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.api_keys
  set request_count = request_count + 1, last_used_at = now()
  where id = p_key_id;
$$;

revoke all on function public.increment_api_key_usage(uuid) from public, anon, authenticated;
grant execute on function public.increment_api_key_usage(uuid) to service_role;
