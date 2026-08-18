-- ============================================================================
-- Thong Dee Go — baseline schema snapshot
-- Captured from live project jbafdzoihklmfurywmhs on 2026-08-16.
-- Includes the harden_admin_role fixes (is_admin without user_metadata fallback,
-- protect_admin_role trigger, profiles INSERT policy).
-- Apply with: npx supabase db push   (after `npx supabase link`)
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. profiles
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text default ''::text,
  nickname text default ''::text,
  school text default ''::text,
  program text default ''::text,
  bio text default ''::text,
  skills text[] default '{}'::text[],
  activities text[] default '{}'::text[],
  contact jsonb default '{}'::jsonb,
  profile_image_url text default ''::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  profile_image_path text default ''::text,
  display_name text,
  role text default 'tourist'::text,
  phone text,
  level text default 'Level 1 Explorer'::text,
  avatar_url text
);
alter table public.profiles enable row level security;

-- ----------------------------------------------------------------------------
-- 2. user_settings
-- ----------------------------------------------------------------------------
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  language text default 'TH'::text check (language = any (array['TH'::text, 'EN'::text])),
  safety_mode boolean default true,
  compact_mode boolean default false,
  notification_enabled boolean default true,
  updated_at timestamptz default now(),
  primary_accent text not null default 'blue'::text check (primary_accent = any (array['blue'::text, 'teal'::text, 'emerald'::text, 'orange'::text, 'purple'::text, 'rose'::text, 'custom'::text])),
  custom_primary_color text check (custom_primary_color is null or custom_primary_color ~ '^#[0-9A-Fa-f]{6}$'::text),
  use_custom_primary_color boolean not null default false,
  ui_scale text not null default 'compact'::text check (ui_scale = any (array['compact'::text, 'normal'::text, 'comfortable'::text]))
);
alter table public.user_settings enable row level security;

-- ----------------------------------------------------------------------------
-- 3. saved_places
-- ----------------------------------------------------------------------------
create table public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  place_id text not null,
  saved_at timestamptz default now(),
  unique (user_id, place_id)
);
alter table public.saved_places enable row level security;

-- ----------------------------------------------------------------------------
-- 4. checkins
-- ----------------------------------------------------------------------------
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  place_id text not null,
  checkin_method text default 'gps'::text,
  latitude double precision,
  longitude double precision,
  checked_in_at timestamptz default now()
);
alter table public.checkins enable row level security;

-- ----------------------------------------------------------------------------
-- 5. digital_passport_stamps
-- ----------------------------------------------------------------------------
create table public.digital_passport_stamps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  place_id text not null,
  stamp_code text not null,
  collected_at timestamptz default now(),
  unique (user_id, place_id)
);
alter table public.digital_passport_stamps enable row level security;

-- ----------------------------------------------------------------------------
-- 6. user_badges
-- ----------------------------------------------------------------------------
create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  badge_code text not null,
  earned_at timestamptz default now(),
  unique (user_id, badge_code)
);
alter table public.user_badges enable row level security;

-- ----------------------------------------------------------------------------
-- 7. trip_plans
-- ----------------------------------------------------------------------------
create table public.trip_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  trip_date date,
  created_at timestamptz default now()
);
alter table public.trip_plans enable row level security;

-- ----------------------------------------------------------------------------
-- 8. trip_plan_items
-- ----------------------------------------------------------------------------
create table public.trip_plan_items (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid references public.trip_plans(id) on delete cascade,
  place_id text not null,
  order_index integer not null,
  note text
);
alter table public.trip_plan_items enable row level security;

-- ----------------------------------------------------------------------------
-- 9. tourism_locations
-- ----------------------------------------------------------------------------
create table public.tourism_locations (
  id text primary key,
  name text not null,
  description text,
  distance_label text,
  location_category text not null default 'วัฒนธรรม'::text,
  rating numeric default 4.5,
  history_summary text,
  cultural_highlights text,
  best_time text,
  need_to_know text,
  image_url text,
  audio_story text,
  latitude double precision not null,
  longitude double precision not null,
  marker_icon text,
  marker_color text,
  is_active boolean default true,
  is_featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  video_url text
);
alter table public.tourism_locations enable row level security;

-- ----------------------------------------------------------------------------
-- 10. accommodation_applications
-- ----------------------------------------------------------------------------
create table public.accommodation_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  property_name text not null,
  owner_name text not null,
  phone text not null,
  line_id text,
  property_type text not null default 'hotel'::text check (property_type = any (array['hotel'::text, 'resort'::text, 'homestay'::text, 'guesthouse'::text, 'apartment'::text, 'rental'::text, 'other'::text])),
  address text,
  latitude double precision not null,
  longitude double precision not null,
  price_range text,
  description text,
  website text,
  booking_direct_url text,
  booking_agoda_url text,
  booking_booking_url text,
  amenities text[] default '{}'::text[],
  room_summary text,
  image_url text,
  check_in_time text default '14:00'::text,
  check_out_time text default '12:00'::text,
  cancellation_policy text,
  application_status text default 'pending'::text check (application_status = any (array['pending'::text, 'revision_required'::text, 'approved'::text, 'rejected'::text])),
  admin_note text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.accommodation_applications enable row level security;

-- ----------------------------------------------------------------------------
-- 11. accommodations
-- ----------------------------------------------------------------------------
create table public.accommodations (
  id text primary key,
  name text not null,
  description text,
  property_type text not null default 'hotel'::text,
  price_range text,
  rating numeric default 4.0,
  phone text,
  line_id text,
  website text,
  booking_links jsonb default '{}'::jsonb,
  amenities text[] default '{}'::text[],
  room_types jsonb default '[]'::jsonb,
  images text[] default '{}'::text[],
  check_in_time text default '14:00'::text,
  check_out_time text default '12:00'::text,
  cancellation_policy text,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  marker_icon text default 'พ'::text,
  marker_color text default 'bg-emerald-600'::text,
  is_active boolean default true,
  is_featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  owner_user_id uuid references auth.users(id) on delete set null,
  application_id uuid references public.accommodation_applications(id) on delete set null
);
alter table public.accommodations enable row level security;

-- ----------------------------------------------------------------------------
-- 12. local_taxi_applications
-- ----------------------------------------------------------------------------
create table public.local_taxi_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  nickname text,
  age integer,
  phone text not null,
  service_area text,
  stand_location text,
  public_contact_address text,
  vehicle_plate text not null,
  vehicle_type text not null,
  vehicle_color text,
  vehicle_description text,
  capacity integer,
  luggage_note text,
  application_status text default 'pending'::text check (application_status = any (array['pending'::text, 'revision_required'::text, 'approved'::text, 'rejected'::text])),
  admin_note text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.local_taxi_applications enable row level security;

-- ----------------------------------------------------------------------------
-- 13. local_taxi_drivers
-- ----------------------------------------------------------------------------
create table public.local_taxi_drivers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  nickname text,
  age integer,
  phone text not null,
  service_area text,
  stand_location text,
  public_contact_address text,
  available_now boolean default false,
  rating numeric default 5.0,
  profile_image text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete set null,
  application_id uuid references public.local_taxi_applications(id) on delete set null
);
alter table public.local_taxi_drivers enable row level security;

-- ----------------------------------------------------------------------------
-- 14. local_taxi_vehicles
-- ----------------------------------------------------------------------------
create table public.local_taxi_vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid unique references public.local_taxi_drivers(id) on delete cascade,
  vehicle_plate text not null,
  vehicle_type text not null,
  vehicle_color text,
  vehicle_description text,
  capacity integer,
  luggage_note text
);
alter table public.local_taxi_vehicles enable row level security;

-- ----------------------------------------------------------------------------
-- 15. local_taxi_verifications
-- ----------------------------------------------------------------------------
create table public.local_taxi_verifications (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid unique references public.local_taxi_drivers(id) on delete cascade,
  verification_status text default 'pending'::text,
  verified_by_agency text,
  verification_ref text,
  verified_at date,
  expires_at date,
  identity_checked boolean default false,
  phone_checked boolean default false,
  vehicle_plate_checked boolean default false,
  vehicle_type_checked boolean default false,
  government_record_checked boolean default false,
  tourism_training_checked boolean default false,
  created_at timestamptz default now()
);
alter table public.local_taxi_verifications enable row level security;

-- ----------------------------------------------------------------------------
-- 16. marketplace_seller_applications
-- ----------------------------------------------------------------------------
create table public.marketplace_seller_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  shop_name text not null,
  owner_name text not null,
  phone text not null,
  line_id text,
  service_area text,
  shop_location text,
  public_contact_address text,
  description text,
  seller_type text default 'community'::text check (seller_type = any (array['community'::text, 'sme'::text, 'otop'::text, 'gi'::text, 'other'::text])),
  application_status text default 'pending'::text check (application_status = any (array['pending'::text, 'revision_required'::text, 'approved'::text, 'rejected'::text])),
  admin_note text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.marketplace_seller_applications enable row level security;

-- ----------------------------------------------------------------------------
-- 17. marketplace_sellers
-- ----------------------------------------------------------------------------
create table public.marketplace_sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  shop_name text not null,
  owner_name text,
  phone text,
  line_id text,
  service_area text,
  shop_location text,
  description text,
  seller_type text default 'community'::text,
  verification_status text default 'pending'::text,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  application_id uuid references public.marketplace_seller_applications(id) on delete set null,
  public_contact_address text
);
alter table public.marketplace_sellers enable row level security;

-- ----------------------------------------------------------------------------
-- 18. marketplace_products
-- ----------------------------------------------------------------------------
create table public.marketplace_products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.marketplace_sellers(id) on delete cascade,
  name text not null,
  description text,
  category text,
  product_type text default 'community'::text,
  price numeric,
  unit text,
  stock_status text default 'available'::text check (stock_status = any (array['available'::text, 'low_stock'::text, 'sold_out'::text, 'preorder'::text])),
  image_url text,
  is_gi boolean default false,
  gi_name text,
  is_otop boolean default false,
  is_sme boolean default false,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  approval_status text default 'pending'::text check (approval_status = any (array['draft'::text, 'pending'::text, 'approved'::text, 'rejected'::text]))
);
alter table public.marketplace_products enable row level security;

-- ----------------------------------------------------------------------------
-- 19. activity_log
-- ----------------------------------------------------------------------------
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.activity_log enable row level security;

-- ----------------------------------------------------------------------------
-- 20. portfolio_pages
-- ----------------------------------------------------------------------------
create table public.portfolio_pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  template text not null default 'modern'::text check (template = any (array['modern'::text, 'classic'::text, 'timeline'::text])),
  selected_certificate_ids uuid[] default '{}'::uuid[],
  content_snapshot jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.portfolio_pages enable row level security;

-- ----------------------------------------------------------------------------
-- Row level security policies
-- ----------------------------------------------------------------------------

-- profiles
create policy "owner_all_profiles" on public.profiles for all
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Users can insert own profile" on public.profiles for insert to authenticated
  with check (auth.uid() = owner_id);

-- user_settings
create policy "Users can view own settings" on public.user_settings for select
  using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.user_settings for insert
  with check (auth.uid() = user_id);
create policy "Users can update own settings" on public.user_settings for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own settings" on public.user_settings for delete
  using (auth.uid() = user_id);

-- saved_places
create policy "Users can view own saved_places" on public.saved_places for select
  using (auth.uid() = user_id);
create policy "Users can insert own saved_places" on public.saved_places for insert
  with check (auth.uid() = user_id);
create policy "Users can update own saved_places" on public.saved_places for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own saved_places" on public.saved_places for delete
  using (auth.uid() = user_id);

-- checkins
create policy "Users can view own checkins" on public.checkins for select
  using (auth.uid() = user_id);
create policy "Users can insert own checkins" on public.checkins for insert
  with check (auth.uid() = user_id);
create policy "Users can update own checkins" on public.checkins for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own checkins" on public.checkins for delete
  using (auth.uid() = user_id);

-- digital_passport_stamps
create policy "Users can view own stamps" on public.digital_passport_stamps for select
  using (auth.uid() = user_id);
create policy "Users can insert own stamps" on public.digital_passport_stamps for insert
  with check (auth.uid() = user_id);
create policy "Users can update own stamps" on public.digital_passport_stamps for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own stamps" on public.digital_passport_stamps for delete
  using (auth.uid() = user_id);

-- user_badges
create policy "Users can view own badges" on public.user_badges for select
  using (auth.uid() = user_id);
create policy "Users can insert own badges" on public.user_badges for insert
  with check (auth.uid() = user_id);
create policy "Users can update own badges" on public.user_badges for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own badges" on public.user_badges for delete
  using (auth.uid() = user_id);

-- trip_plans
create policy "Users can view own trip plans" on public.trip_plans for select
  using (auth.uid() = user_id);
create policy "Users can insert own trip plans" on public.trip_plans for insert
  with check (auth.uid() = user_id);
create policy "Users can update own trip plans" on public.trip_plans for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own trip plans" on public.trip_plans for delete
  using (auth.uid() = user_id);

-- trip_plan_items
create policy "Users can view own trip plan items" on public.trip_plan_items for select
  using (exists (select 1 from public.trip_plans where trip_plans.id = trip_plan_items.trip_plan_id and trip_plans.user_id = auth.uid()));
create policy "Users can insert own trip plan items" on public.trip_plan_items for insert
  with check (exists (select 1 from public.trip_plans where trip_plans.id = trip_plan_items.trip_plan_id and trip_plans.user_id = auth.uid()));
create policy "Users can update own trip plan items" on public.trip_plan_items for update
  using (exists (select 1 from public.trip_plans where trip_plans.id = trip_plan_items.trip_plan_id and trip_plans.user_id = auth.uid()))
  with check (exists (select 1 from public.trip_plans where trip_plans.id = trip_plan_items.trip_plan_id and trip_plans.user_id = auth.uid()));
create policy "Users can delete own trip plan items" on public.trip_plan_items for delete
  using (exists (select 1 from public.trip_plans where trip_plans.id = trip_plan_items.trip_plan_id and trip_plans.user_id = auth.uid()));

-- tourism_locations
create policy "Admins can manage tourism locations" on public.tourism_locations for all
  using (is_admin()) with check (is_admin());
create policy "Public can read active tourism locations" on public.tourism_locations for select
  using (is_active = true);

-- accommodation_applications
create policy "Select accommodation applications" on public.accommodation_applications for select
  using (is_admin() or (select auth.uid()) = user_id);
create policy "Users can insert own accommodation application" on public.accommodation_applications for insert
  with check ((select auth.uid()) = user_id);
create policy "Users or admins can update accommodation application" on public.accommodation_applications for update
  using (is_admin() or ((select auth.uid()) = user_id and application_status = any (array['pending'::text, 'revision_required'::text])))
  with check (is_admin() or ((select auth.uid()) = user_id and application_status = 'pending'::text));

-- accommodations
create policy "Admin insert accommodations" on public.accommodations for insert
  with check (is_admin());
create policy "Admin update accommodations" on public.accommodations for update
  using (is_admin()) with check (is_admin());
create policy "Admin delete accommodations" on public.accommodations for delete
  using (is_admin());
create policy "Public select accommodations" on public.accommodations for select
  using (is_active = true or is_admin());

-- local_taxi_applications
create policy "Admins can manage taxi applications" on public.local_taxi_applications for all
  using (is_admin()) with check (is_admin());
create policy "Taxi providers can insert own application" on public.local_taxi_applications for insert
  with check (auth.uid() = user_id and application_status = 'pending'::text);
create policy "Taxi providers can update own pending application" on public.local_taxi_applications for update
  using (auth.uid() = user_id and application_status = any (array['pending'::text, 'revision_required'::text]))
  with check (auth.uid() = user_id and application_status = any (array['pending'::text, 'revision_required'::text]));
create policy "Taxi providers can view own application" on public.local_taxi_applications for select
  using (auth.uid() = user_id);

-- local_taxi_drivers
create policy "Admins can manage taxi drivers" on public.local_taxi_drivers for all
  using (is_admin()) with check (is_admin());
create policy "Public users can read active taxi drivers" on public.local_taxi_drivers for select
  using (is_active = true);
create policy "Taxi providers can read own driver profile" on public.local_taxi_drivers for select
  using (auth.uid() = user_id);
create policy "Taxi providers can update own availability" on public.local_taxi_drivers for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Taxi providers can update own driver profile" on public.local_taxi_drivers for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- local_taxi_vehicles
create policy "Admins can manage taxi vehicles" on public.local_taxi_vehicles for all
  using (is_admin()) with check (is_admin());
create policy "Public users can read vehicles of active drivers" on public.local_taxi_vehicles for select
  using (exists (select 1 from public.local_taxi_drivers d where d.id = local_taxi_vehicles.driver_id and d.is_active = true));
create policy "Taxi providers can read own vehicle" on public.local_taxi_vehicles for select
  using (exists (select 1 from public.local_taxi_drivers d where d.id = local_taxi_vehicles.driver_id and d.user_id = auth.uid()));
create policy "Taxi providers can update own vehicle" on public.local_taxi_vehicles for update
  using (exists (select 1 from public.local_taxi_drivers d where d.id = local_taxi_vehicles.driver_id and d.user_id = auth.uid()))
  with check (exists (select 1 from public.local_taxi_drivers d where d.id = local_taxi_vehicles.driver_id and d.user_id = auth.uid()));

-- local_taxi_verifications
create policy "Admins can manage taxi verifications" on public.local_taxi_verifications for all
  using (is_admin()) with check (is_admin());
create policy "Public users can read verifications of active drivers" on public.local_taxi_verifications for select
  using (exists (select 1 from public.local_taxi_drivers d where d.id = local_taxi_verifications.driver_id and d.is_active = true));
create policy "Taxi providers can read own verification" on public.local_taxi_verifications for select
  using (exists (select 1 from public.local_taxi_drivers d where d.id = local_taxi_verifications.driver_id and d.user_id = auth.uid()));

-- marketplace_seller_applications
create policy "Admins can manage seller applications" on public.marketplace_seller_applications for all
  using (is_admin()) with check (is_admin());
create policy "Sellers can insert own seller application" on public.marketplace_seller_applications for insert
  with check (auth.uid() = user_id and application_status = 'pending'::text);
create policy "Sellers can update own pending seller application" on public.marketplace_seller_applications for update
  using (auth.uid() = user_id and application_status = any (array['pending'::text, 'revision_required'::text]))
  with check (auth.uid() = user_id and application_status = any (array['pending'::text, 'revision_required'::text]));
create policy "Sellers can view own seller application" on public.marketplace_seller_applications for select
  using (auth.uid() = user_id);

-- marketplace_sellers
create policy "Admins can manage marketplace sellers" on public.marketplace_sellers for all
  using (is_admin()) with check (is_admin());
create policy "Public can read active marketplace sellers" on public.marketplace_sellers for select
  using (is_active = true);
create policy "Sellers can read own seller profile" on public.marketplace_sellers for select
  using (auth.uid() = user_id);
create policy "Sellers can update own seller profile" on public.marketplace_sellers for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Sellers can view own seller profile" on public.marketplace_sellers for select
  using (auth.uid() = user_id);

-- marketplace_products
create policy "Admins can manage marketplace products" on public.marketplace_products for all
  using (is_admin()) with check (is_admin());
create policy "Public can read active marketplace products" on public.marketplace_products for select
  using (is_active = true and approval_status = 'approved'::text and exists (select 1 from public.marketplace_sellers s where s.id = marketplace_products.seller_id and s.is_active = true));
create policy "Sellers can insert own products" on public.marketplace_products for insert
  with check (approval_status = any (array['draft'::text, 'pending'::text]) and is_active = false and exists (select 1 from public.marketplace_sellers s where s.id = marketplace_products.seller_id and s.user_id = auth.uid() and s.is_active = true));
create policy "Sellers can manage own products" on public.marketplace_products for all
  using (exists (select 1 from public.marketplace_sellers s where s.id = marketplace_products.seller_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.marketplace_sellers s where s.id = marketplace_products.seller_id and s.user_id = auth.uid()));
create policy "Sellers can update own products" on public.marketplace_products for update
  using (exists (select 1 from public.marketplace_sellers s where s.id = marketplace_products.seller_id and s.user_id = auth.uid()))
  with check (approval_status = any (array['draft'::text, 'pending'::text, 'rejected'::text]) and is_active = false and exists (select 1 from public.marketplace_sellers s where s.id = marketplace_products.seller_id and s.user_id = auth.uid()));
create policy "Sellers can view own products" on public.marketplace_products for select
  using (exists (select 1 from public.marketplace_sellers s where s.id = marketplace_products.seller_id and s.user_id = auth.uid()));

-- activity_log
create policy "Users can view own activity" on public.activity_log for select
  using (auth.uid() = owner_id);
create policy "Users can insert own activity" on public.activity_log for insert
  with check (auth.uid() = owner_id);

-- portfolio_pages
create policy "Users can manage their own portfolio pages" on public.portfolio_pages for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- Functions
-- ----------------------------------------------------------------------------

-- Admin check: app_metadata.role (server-set) OR profiles.role (trigger-protected).
-- NEVER user_metadata.role — GoTrue lets any client set user_metadata, which was
-- a privilege-escalation vector (fixed 2026-08-16).
create or replace function public.is_admin()
returns boolean
language sql
stable
as $function$
  SELECT (current_setting('request.jwt.claims', true)::jsonb #>> '{app_metadata, role}') = 'admin'
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE owner_id = auth.uid() AND role = 'admin'
      );
$function$;

-- Blocks non-admins from inserting/updating the admin role on their own
-- profiles row. Legitimate self-service role changes (e.g. taxi_provider)
-- are unaffected.
create or replace function public.protect_admin_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
BEGIN
  IF (NEW.role = 'admin' OR OLD.role = 'admin') AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can set the admin role';
  END IF;
  RETURN NEW;
END;
$function$;

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
BEGIN
  INSERT INTO public.profiles (owner_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    'tourist'
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$function$;

create or replace function public.approve_accommodation_application(p_application_id uuid)
returns text
language plpgsql
set search_path to 'public'
as $function$
declare
  app_row public.accommodation_applications%rowtype;
  base_id text;
  new_accommodation_id text;
  suffix int := 0;
  existing_accommodation_id text;
begin
  if not public.is_admin() then
    raise exception 'Only admin can approve accommodation applications';
  end if;

  select * into app_row from public.accommodation_applications where id = p_application_id;
  if not found then
    raise exception 'Accommodation application not found: %', p_application_id;
  end if;

  select id into existing_accommodation_id from public.accommodations where application_id = p_application_id;

  if existing_accommodation_id is not null then
    update public.accommodations
    set name = app_row.property_name,
        description = coalesce(app_row.description, ''),
        property_type = app_row.property_type,
        price_range = app_row.price_range,
        phone = app_row.phone,
        line_id = app_row.line_id,
        website = app_row.website,
        booking_links = jsonb_build_object('direct', app_row.booking_direct_url, 'agoda', app_row.booking_agoda_url, 'booking', app_row.booking_booking_url),
        amenities = coalesce(app_row.amenities, '{}'),
        room_types = case when nullif(app_row.room_summary, '') is null then '[]'::jsonb
          else jsonb_build_array(jsonb_build_object('name', 'รายละเอียดห้องพัก', 'price', null, 'description', app_row.room_summary, 'max_guests', 2, 'images', '[]'::jsonb)) end,
        images = case when nullif(app_row.image_url, '') is null then '{}'::text[] else array[app_row.image_url] end,
        check_in_time = coalesce(app_row.check_in_time, '14:00'),
        check_out_time = coalesce(app_row.check_out_time, '12:00'),
        cancellation_policy = app_row.cancellation_policy,
        latitude = app_row.latitude,
        longitude = app_row.longitude,
        address = app_row.address,
        marker_icon = 'พ',
        marker_color = 'bg-emerald-600',
        is_active = true,
        owner_user_id = app_row.user_id,
        updated_at = now()
    where id = existing_accommodation_id;

    update public.accommodation_applications
    set application_status = 'approved', admin_note = 'อนุมัติแล้ว', updated_at = now()
    where id = p_application_id;

    return existing_accommodation_id;
  end if;

  base_id := trim(both '_' from lower(regexp_replace(app_row.property_name, '[^a-zA-Z0-9]+', '_', 'g')));
  if base_id = '' or base_id is null then
    base_id := 'accommodation_' || replace(left(p_application_id::text, 8), '-', '');
  end if;

  new_accommodation_id := base_id;
  while exists (select 1 from public.accommodations where id = new_accommodation_id) loop
    suffix := suffix + 1;
    new_accommodation_id := base_id || '_' || suffix::text;
  end loop;

  insert into public.accommodations (
    id, name, description, property_type, price_range, rating, phone, line_id, website,
    booking_links, amenities, room_types, images, check_in_time, check_out_time,
    cancellation_policy, latitude, longitude, address, marker_icon, marker_color,
    is_active, is_featured, sort_order, owner_user_id, application_id
  ) values (
    new_accommodation_id, app_row.property_name, coalesce(app_row.description, ''),
    app_row.property_type, app_row.price_range, 4.5, app_row.phone, app_row.line_id,
    app_row.website,
    jsonb_build_object('direct', app_row.booking_direct_url, 'agoda', app_row.booking_agoda_url, 'booking', app_row.booking_booking_url),
    coalesce(app_row.amenities, '{}'),
    case when nullif(app_row.room_summary, '') is null then '[]'::jsonb
      else jsonb_build_array(jsonb_build_object('name', 'รายละเอียดห้องพัก', 'price', null, 'description', app_row.room_summary, 'max_guests', 2, 'images', '[]'::jsonb)) end,
    case when nullif(app_row.image_url, '') is null then '{}'::text[] else array[app_row.image_url] end,
    coalesce(app_row.check_in_time, '14:00'), coalesce(app_row.check_out_time, '12:00'),
    app_row.cancellation_policy, app_row.latitude, app_row.longitude, app_row.address,
    'พ', 'bg-emerald-600', true, false, 0, app_row.user_id, app_row.id
  );

  update public.accommodation_applications
  set application_status = 'approved', admin_note = 'อนุมัติแล้ว', updated_at = now()
  where id = p_application_id;

  return new_accommodation_id;
end;
$function$;

create or replace function public.approve_marketplace_product(p_product_id uuid)
returns void
language plpgsql
security definer
as $function$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admin can approve marketplace products';
    END IF;
    UPDATE public.marketplace_products
    SET approval_status = 'approved', is_active = true, updated_at = NOW()
    WHERE id = p_product_id;
END;
$function$;

create or replace function public.reject_marketplace_product(p_product_id uuid)
returns void
language plpgsql
security definer
as $function$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admin can reject marketplace products';
    END IF;
    UPDATE public.marketplace_products
    SET approval_status = 'rejected', is_active = false, updated_at = NOW()
    WHERE id = p_product_id;
END;
$function$;

create or replace function public.approve_seller_application(p_application_id uuid)
returns void
language plpgsql
security definer
as $function$
DECLARE
    v_app public.marketplace_seller_applications%ROWTYPE;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admin can approve seller applications';
    END IF;

    SELECT * INTO v_app FROM public.marketplace_seller_applications WHERE id = p_application_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found';
    END IF;

    UPDATE public.marketplace_seller_applications
    SET application_status = 'approved', updated_at = NOW()
    WHERE id = p_application_id;

    INSERT INTO public.marketplace_sellers (
        user_id, shop_name, owner_name, phone, line_id,
        service_area, shop_location, description, seller_type,
        application_id, public_contact_address, is_active, verification_status
    ) VALUES (
        v_app.user_id, v_app.shop_name, v_app.owner_name, v_app.phone, v_app.line_id,
        v_app.service_area, v_app.shop_location, v_app.description, v_app.seller_type,
        p_application_id, v_app.public_contact_address, true, 'pending'
    );
END;
$function$;

create or replace function public.approve_taxi_application(p_application_id uuid, p_verified_by_agency text default 'ผู้ดูแลระบบ Tongdee Go'::text)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  app_row public.local_taxi_applications%rowtype;
  new_driver_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admin can approve taxi applications';
  end if;

  select * into app_row from public.local_taxi_applications where id = p_application_id;
  if not found then
    raise exception 'Taxi application not found: %', p_application_id;
  end if;

  select id into new_driver_id from public.local_taxi_drivers where application_id = p_application_id;

  if new_driver_id is null then
    insert into public.local_taxi_drivers (
      first_name, last_name, nickname, age, phone, service_area, stand_location,
      public_contact_address, available_now, rating, is_active, user_id, application_id
    )
    values (
      app_row.first_name, app_row.last_name, app_row.nickname, app_row.age, app_row.phone,
      app_row.service_area, app_row.stand_location, app_row.public_contact_address,
      false, 5.0, true, app_row.user_id, app_row.id
    )
    returning id into new_driver_id;
  end if;

  insert into public.local_taxi_vehicles (
    driver_id, vehicle_plate, vehicle_type, vehicle_color, vehicle_description,
    capacity, luggage_note
  )
  values (
    new_driver_id, app_row.vehicle_plate, app_row.vehicle_type, app_row.vehicle_color,
    app_row.vehicle_description, app_row.capacity, app_row.luggage_note
  )
  on conflict (driver_id) do update set
    vehicle_plate = excluded.vehicle_plate,
    vehicle_type = excluded.vehicle_type,
    vehicle_color = excluded.vehicle_color,
    vehicle_description = excluded.vehicle_description,
    capacity = excluded.capacity,
    luggage_note = excluded.luggage_note;

  insert into public.local_taxi_verifications (
    driver_id, verification_status, verified_by_agency, verification_ref,
    verified_at, expires_at, identity_checked, phone_checked, vehicle_plate_checked,
    vehicle_type_checked, government_record_checked, tourism_training_checked
  )
  values (
    new_driver_id, 'verified', p_verified_by_agency,
    'PHC-TAXI-' || to_char(now(), 'YYYYMMDD') || '-' || substring(new_driver_id::text, 1, 4),
    current_date, current_date + 365, true, true, true, true, true, false
  )
  on conflict (driver_id) do update set
    verification_status = excluded.verification_status,
    verified_by_agency = excluded.verified_by_agency,
    verification_ref = excluded.verification_ref,
    verified_at = excluded.verified_at,
    expires_at = excluded.expires_at,
    identity_checked = excluded.identity_checked,
    phone_checked = excluded.phone_checked,
    vehicle_plate_checked = excluded.vehicle_plate_checked,
    vehicle_type_checked = excluded.vehicle_type_checked,
    government_record_checked = excluded.government_record_checked,
    tourism_training_checked = excluded.tourism_training_checked;

  update public.local_taxi_applications
  set application_status = 'approved', admin_note = 'อนุมัติแล้ว', updated_at = now()
  where id = p_application_id;

  return new_driver_id;
end;
$function$;

-- ----------------------------------------------------------------------------
-- Triggers
-- ----------------------------------------------------------------------------

drop trigger if exists protect_admin_role on public.profiles;
create trigger protect_admin_role
  before insert or update of role on public.profiles
  for each row execute function public.protect_admin_role();

-- auth.users trigger (managed by Supabase; included for completeness)
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Standard role grants (Supabase convention)
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
