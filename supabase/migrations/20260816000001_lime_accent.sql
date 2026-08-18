-- Extend the primary_accent CHECK to include the new 'lime' preset
-- (and 'linear', which exists in the app's accent list but was missing
-- from the DB constraint — selecting it previously failed to persist).
alter table public.user_settings
  drop constraint user_settings_primary_accent_check;

alter table public.user_settings
  add constraint user_settings_primary_accent_check
  check (primary_accent = any (array[
    'blue'::text, 'teal'::text, 'emerald'::text, 'orange'::text,
    'purple'::text, 'rose'::text, 'linear'::text, 'lime'::text, 'custom'::text
  ]));
