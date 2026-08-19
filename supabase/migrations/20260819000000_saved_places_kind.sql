-- Saved places now support both attractions and accommodations.
-- kind: 'place' for tourism_locations, 'hotel' for accommodations.
alter table public.saved_places
  add column kind text not null default 'place' check (kind in ('place', 'hotel'));

create index if not exists saved_places_user_kind_idx
  on public.saved_places (user_id, kind);
