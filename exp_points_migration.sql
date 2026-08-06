-- Run this in the Supabase SQL editor for the NexEris project.
-- Adds the EXP points column used by the new EXP system.

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
