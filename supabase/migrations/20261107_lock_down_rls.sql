-- BAALANCE: lock down row-level security.
-- Run once in Supabase (SQL Editor). Safe to re-run.
--
-- Before this migration every table allowed anyone holding the public anon key
-- to read and change every row. After it:
--   * a signed-in user can read and write only rows tied to their own email;
--   * anonymous visitors can read nothing;
--   * anonymous visitors can only add an email to the waitlist.

-- 1. Remove the old open policies.
drop policy if exists "Allow anonymous and authenticated read profiles" on public.baalance_profiles;
drop policy if exists "Allow anonymous and authenticated insert/update profiles" on public.baalance_profiles;
drop policy if exists "Allow anonymous and authenticated read biomarkers" on public.baalance_hair_cortisol;
drop policy if exists "Allow anonymous and authenticated insert biomarkers" on public.baalance_hair_cortisol;
drop policy if exists "Allow anonymous and authenticated read telemetry" on public.baalance_telemetry_sync;
drop policy if exists "Allow anonymous and authenticated insert telemetry" on public.baalance_telemetry_sync;

-- 2. Columns used by the new storage API.
alter table public.baalance_profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.baalance_profiles add column if not exists bundle jsonb;

-- 3. Own-row policies (email comes from the verified Supabase session token).
alter table public.baalance_profiles enable row level security;
alter table public.baalance_hair_cortisol enable row level security;
alter table public.baalance_telemetry_sync enable row level security;

drop policy if exists "Own profile" on public.baalance_profiles;
create policy "Own profile" on public.baalance_profiles
  for all to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'))
  with check (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Own hair cortisol results" on public.baalance_hair_cortisol;
create policy "Own hair cortisol results" on public.baalance_hair_cortisol
  for all to authenticated
  using (lower(user_email) = lower(auth.jwt() ->> 'email'))
  with check (lower(user_email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Own telemetry" on public.baalance_telemetry_sync;
create policy "Own telemetry" on public.baalance_telemetry_sync
  for all to authenticated
  using (lower(user_email) = lower(auth.jwt() ->> 'email'))
  with check (lower(user_email) = lower(auth.jwt() ->> 'email'));

-- 4. Waitlist: anyone may add their email; nobody can read the list through the API.
create table if not exists public.baalance_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  created_at timestamptz not null default now()
);
alter table public.baalance_leads add column if not exists full_name text;
alter table public.baalance_leads add column if not exists source text;
alter table public.baalance_leads add column if not exists device_preference text;
alter table public.baalance_leads add column if not exists submitted_at_ist text;
-- If this fails because of duplicate emails already in the table, remove the duplicates first.
create unique index if not exists baalance_leads_email_key on public.baalance_leads (lower(email));
alter table public.baalance_leads enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'baalance_leads' loop
    execute format('drop policy %I on public.baalance_leads', p.policyname);
  end loop;
end $$;

create policy "Anyone can join the waitlist" on public.baalance_leads
  for insert to anon, authenticated
  with check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
-- No select, update or delete policy: read the waitlist from the Supabase dashboard.
