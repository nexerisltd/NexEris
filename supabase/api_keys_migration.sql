-- Run in the Supabase SQL editor. Adds API keys for the read-only public API (/api/v1/...).
-- Only the server (service role) can read or write this table.

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
