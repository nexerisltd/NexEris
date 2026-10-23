-- Run this in the Supabase SQL editor for the NexEris project.
-- 1) Adds the "super_admin" role  2) Adds the products tables  3) Adds a logo bucket.
-- The app does all writes through the server (service role) after checking the
-- viewer's role in code, so only public SELECT policies are needed here.

-- ---------------------------------------------------------------------------
-- 1) Roles: member | admin | super_admin
-- ---------------------------------------------------------------------------
-- Drop any existing CHECK constraint that mentions "role" on these two tables.
do $$
declare c record;
begin
  for c in
    select conrelid::regclass as tbl, conname
    from pg_constraint
    where contype = 'c'
      and conrelid in ('public.profiles'::regclass, 'public.allowed_members'::regclass)
      and pg_get_constraintdef(oid) ~ '\mrole\M'
  loop
    execute format('alter table %s drop constraint %I', c.tbl, c.conname);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_role_check check (role in ('member', 'admin', 'super_admin'));
alter table public.allowed_members
  add constraint allowed_members_role_check check (role in ('member', 'admin', 'super_admin'));

-- If "role" is a Postgres enum instead of text, skip the block above and run:
--   alter type <your_role_enum> add value if not exists 'super_admin';

-- Make yourself the first Super Admin (edit the username, then uncomment):
-- update public.profiles set role = 'super_admin' where username = 'arabiislam46ar';

-- ---------------------------------------------------------------------------
-- 2) Products
-- ---------------------------------------------------------------------------
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

alter table public.products enable row level security;
alter table public.product_developers enable row level security;

drop policy if exists "products are public" on public.products;
create policy "products are public" on public.products for select using (true);

drop policy if exists "product developers are public" on public.product_developers;
create policy "product developers are public" on public.product_developers for select using (true);

-- ---------------------------------------------------------------------------
-- 3) Public bucket for product logos (uploads go through the server)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-logos', 'product-logos', true)
on conflict (id) do nothing;
