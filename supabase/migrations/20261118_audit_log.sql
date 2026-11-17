-- BAALANCE: activity log (approvals, declines, calendar changes, safety events,
-- data exports). Run once in Supabase (SQL Editor). Safe to re-run.
--
-- Each signed-in user can add rows for themselves, read their own rows, and
-- delete their own rows (needed for "Delete my data"). Nobody can edit a row,
-- and anonymous visitors can do nothing.
-- Calendar event titles are not stored: only the event id and the new time.

create table if not exists public.baalance_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  action text not null,
  provider text,
  event_ref text,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index if not exists baalance_audit_log_user_time
  on public.baalance_audit_log (user_id, created_at desc);

alter table public.baalance_audit_log enable row level security;

drop policy if exists "Read own activity" on public.baalance_audit_log;
create policy "Read own activity" on public.baalance_audit_log
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Add own activity" on public.baalance_audit_log;
create policy "Add own activity" on public.baalance_audit_log
  for insert to authenticated
  with check (user_id = auth.uid() and lower(user_email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Delete own activity" on public.baalance_audit_log;
create policy "Delete own activity" on public.baalance_audit_log
  for delete to authenticated
  using (user_id = auth.uid());
-- No update policy: rows cannot be edited after they are written.
