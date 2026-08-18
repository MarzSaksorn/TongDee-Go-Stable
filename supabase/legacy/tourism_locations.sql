-- supabase/tourism_locations.sql
-- Migration file to create the tourism_locations table and policies

CREATE TABLE IF NOT EXISTS public.tourism_locations (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  distance_label text,
  location_category text NOT NULL DEFAULT 'วัฒนธรรม',
  rating numeric DEFAULT 4.5,
  history_summary text,
  cultural_highlights text,
  best_time text,
  need_to_know text,
  image_url text,
  video_url text,
  audio_story text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  marker_icon text,
  marker_color text,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE public.tourism_locations ENABLE ROW LEVEL SECURITY;

-- 1. Select policy: public can view active locations, admin can see all
CREATE POLICY "Public select tourism_locations" ON public.tourism_locations
  FOR SELECT USING (
    is_active = true OR public.is_admin()
  );

-- 2. Admin manage policy: admins can insert, update, split, or delete locations
CREATE POLICY "Admin manage tourism_locations" ON public.tourism_locations
  FOR ALL USING (
    public.is_admin()
  );

-- Grants
GRANT SELECT ON public.tourism_locations TO anon, authenticated;
GRANT ALL ON public.tourism_locations TO authenticated;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
