-- supabase/accommodation_applications.sql
-- Creates user-submitted accommodation applications and admin approval flow.

CREATE TABLE IF NOT EXISTS public.accommodation_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  property_name text NOT NULL,
  owner_name text NOT NULL,
  phone text NOT NULL,
  line_id text,
  property_type text NOT NULL DEFAULT 'hotel' CHECK (property_type IN ('hotel', 'resort', 'homestay', 'guesthouse', 'apartment', 'rental', 'other')),
  address text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  price_range text,
  description text,
  website text,
  booking_direct_url text,
  booking_agoda_url text,
  booking_booking_url text,
  amenities text[] DEFAULT '{}',
  room_summary text,
  image_url text,
  check_in_time text DEFAULT '14:00',
  check_out_time text DEFAULT '12:00',
  cancellation_policy text,
  application_status text DEFAULT 'pending' CHECK (application_status IN ('pending', 'revision_required', 'approved', 'rejected')),
  admin_note text,
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.accommodation_applications ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS application_id uuid REFERENCES public.accommodation_applications(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS accommodation_applications_user_id_idx ON public.accommodation_applications(user_id);
CREATE INDEX IF NOT EXISTS accommodation_applications_status_submitted_idx ON public.accommodation_applications(application_status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS accommodations_owner_user_id_idx ON public.accommodations(owner_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS accommodations_application_id_unique_idx ON public.accommodations(application_id) WHERE application_id IS NOT NULL;

CREATE POLICY "Select accommodation applications" ON public.accommodation_applications
  FOR SELECT TO authenticated
  USING ((SELECT public.is_admin()) OR (SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own accommodation application" ON public.accommodation_applications
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users or admins can update accommodation application" ON public.accommodation_applications
  FOR UPDATE TO authenticated
  USING (
    (SELECT public.is_admin())
    OR ((SELECT auth.uid()) = user_id AND application_status IN ('pending', 'revision_required'))
  )
  WITH CHECK (
    (SELECT public.is_admin())
    OR ((SELECT auth.uid()) = user_id AND application_status = 'pending')
  );

GRANT SELECT, INSERT, UPDATE ON TABLE public.accommodation_applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.accommodation_applications TO service_role;

CREATE OR REPLACE FUNCTION public.approve_accommodation_application(p_application_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  app_row public.accommodation_applications%ROWTYPE;
  base_id text;
  new_accommodation_id text;
  suffix int := 0;
  existing_accommodation_id text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admin can approve accommodation applications';
  END IF;

  SELECT * INTO app_row
  FROM public.accommodation_applications
  WHERE id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Accommodation application not found: %', p_application_id;
  END IF;

  SELECT id INTO existing_accommodation_id
  FROM public.accommodations
  WHERE application_id = p_application_id;

  IF existing_accommodation_id IS NOT NULL THEN
    UPDATE public.accommodations
    SET name = app_row.property_name,
        description = COALESCE(app_row.description, ''),
        property_type = app_row.property_type,
        price_range = app_row.price_range,
        phone = app_row.phone,
        line_id = app_row.line_id,
        website = app_row.website,
        booking_links = jsonb_build_object('direct', app_row.booking_direct_url, 'agoda', app_row.booking_agoda_url, 'booking', app_row.booking_booking_url),
        amenities = COALESCE(app_row.amenities, '{}'),
        room_types = CASE
          WHEN NULLIF(app_row.room_summary, '') IS NULL THEN '[]'::jsonb
          ELSE jsonb_build_array(jsonb_build_object('name', 'รายละเอียดห้องพัก', 'price', NULL, 'description', app_row.room_summary, 'max_guests', 2, 'images', '[]'::jsonb))
        END,
        images = CASE WHEN NULLIF(app_row.image_url, '') IS NULL THEN '{}'::text[] ELSE ARRAY[app_row.image_url] END,
        check_in_time = COALESCE(app_row.check_in_time, '14:00'),
        check_out_time = COALESCE(app_row.check_out_time, '12:00'),
        cancellation_policy = app_row.cancellation_policy,
        latitude = app_row.latitude,
        longitude = app_row.longitude,
        address = app_row.address,
        marker_icon = 'พ',
        marker_color = 'bg-emerald-600',
        is_active = true,
        owner_user_id = app_row.user_id,
        updated_at = now()
    WHERE id = existing_accommodation_id;

    UPDATE public.accommodation_applications
    SET application_status = 'approved', admin_note = 'อนุมัติแล้ว', updated_at = now()
    WHERE id = p_application_id;

    RETURN existing_accommodation_id;
  END IF;

  base_id := trim(BOTH '_' FROM lower(regexp_replace(app_row.property_name, '[^a-zA-Z0-9]+', '_', 'g')));
  IF base_id = '' OR base_id IS NULL THEN
    base_id := 'accommodation_' || replace(left(p_application_id::text, 8), '-', '');
  END IF;

  new_accommodation_id := base_id;
  WHILE EXISTS (SELECT 1 FROM public.accommodations WHERE id = new_accommodation_id) LOOP
    suffix := suffix + 1;
    new_accommodation_id := base_id || '_' || suffix::text;
  END LOOP;

  INSERT INTO public.accommodations (
    id, name, description, property_type, price_range, rating, phone, line_id, website,
    booking_links, amenities, room_types, images, check_in_time, check_out_time,
    cancellation_policy, latitude, longitude, address, marker_icon, marker_color,
    is_active, is_featured, sort_order, owner_user_id, application_id
  ) VALUES (
    new_accommodation_id, app_row.property_name, COALESCE(app_row.description, ''),
    app_row.property_type, app_row.price_range, 4.5, app_row.phone, app_row.line_id,
    app_row.website,
    jsonb_build_object('direct', app_row.booking_direct_url, 'agoda', app_row.booking_agoda_url, 'booking', app_row.booking_booking_url),
    COALESCE(app_row.amenities, '{}'),
    CASE
      WHEN NULLIF(app_row.room_summary, '') IS NULL THEN '[]'::jsonb
      ELSE jsonb_build_array(jsonb_build_object('name', 'รายละเอียดห้องพัก', 'price', NULL, 'description', app_row.room_summary, 'max_guests', 2, 'images', '[]'::jsonb))
    END,
    CASE WHEN NULLIF(app_row.image_url, '') IS NULL THEN '{}'::text[] ELSE ARRAY[app_row.image_url] END,
    COALESCE(app_row.check_in_time, '14:00'), COALESCE(app_row.check_out_time, '12:00'),
    app_row.cancellation_policy, app_row.latitude, app_row.longitude, app_row.address,
    'พ', 'bg-emerald-600', true, false, 0, app_row.user_id, app_row.id
  );

  UPDATE public.accommodation_applications
  SET application_status = 'approved', admin_note = 'อนุมัติแล้ว', updated_at = now()
  WHERE id = p_application_id;

  RETURN new_accommodation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_accommodation_application(uuid) FROM public;
REVOKE ALL ON FUNCTION public.approve_accommodation_application(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.approve_accommodation_application(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.approve_accommodation_application(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
