-- Migration 1/4 — EXP points.
-- Adds the EXP points column used by the EXP system.
-- Apply the files in supabase/migrations/ in filename order (see supabase/README.md).

alter table public.profiles
  add column if not exists exp_points integer not null default 0;

-- Optional: guard against negative values at the DB level too
-- (the app already clamps to 0, this is just extra safety).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_exp_points_non_negative'
  ) then
    alter table public.profiles
      add constraint profiles_exp_points_non_negative check (exp_points >= 0);
  end if;
end $$;
