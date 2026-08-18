-- supabase/accommodations.sql
-- Migration file to create the accommodations table (hotels, resorts, homestays, etc.) and policies

-- Enable pgvector and other extensions as needed
CREATE TABLE IF NOT EXISTS public.accommodations (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  property_type text NOT NULL DEFAULT 'hotel', -- hotel, resort, homestay, guesthouse, apartment
  price_range text, -- human-readable: "500-1,500 บาท/คืน"
  rating numeric DEFAULT 4.0,
  phone text,
  line_id text,
  website text,
  booking_links jsonb DEFAULT '{}', -- { agoda: "...", booking: "...", direct: "..." }
  amenities text[] DEFAULT '{}', -- {WiFi,อาหารเช้า,ที่จอดรถ,เครื่องปรับอากาศ,สระว่ายน้ำ}
  room_types jsonb DEFAULT '[]', -- [{ name, price, description, max_guests, images[] }]
  images text[] DEFAULT '{}', -- gallery photo URLs
  check_in_time text DEFAULT '14:00',
  check_out_time text DEFAULT '12:00',
  cancellation_policy text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text,
  marker_icon text DEFAULT 'พ',
  marker_color text DEFAULT 'bg-emerald-600',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;

-- 1. Select policy: public can view active accommodations, admin can see all
CREATE POLICY "Public select accommodations" ON public.accommodations
  FOR SELECT USING (
    is_active = true OR public.is_admin()
  );

-- 2. Admin manage policies: public select policy already includes admins for reads.
CREATE POLICY "Admin insert accommodations" ON public.accommodations
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin update accommodations" ON public.accommodations
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete accommodations" ON public.accommodations
  FOR DELETE USING (public.is_admin());

-- Grants
GRANT SELECT ON public.accommodations TO anon, authenticated;
GRANT ALL ON public.accommodations TO authenticated;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
