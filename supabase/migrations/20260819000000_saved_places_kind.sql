-- Saved places now support both attractions and accommodations.
-- kind: 'place' for tourism_locations, 'hotel' for accommodations.
-- Idempotent: the column may already exist in deployments that applied the
-- earlier non-idempotent version of this migration.
alter table public.saved_places
  add column if not exists kind text not null default 'place' check (kind in ('place', 'hotel'));

create index if not exists saved_places_user_kind_idx
  on public.saved_places (user_id, kind);
