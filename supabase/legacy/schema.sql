-- schema.sql

-- 1. profiles
CREATE TABLE public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  avatar_url text,
  level text default 'Level 1 Explorer',
  role text default 'tourist',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. user_settings
CREATE TABLE public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  language text default 'TH',
  safety_mode boolean default true,
  compact_mode boolean default false,
  notification_enabled boolean default true,
  updated_at timestamptz default now()
);

-- 3. saved_places
CREATE TABLE public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  place_id text not null,
  saved_at timestamptz default now(),
  unique(user_id, place_id)
);

-- 4. checkins
CREATE TABLE public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  place_id text not null,
  checkin_method text default 'gps',
  latitude double precision,
  longitude double precision,
  checked_in_at timestamptz default now()
);

-- 5. digital_passport_stamps
CREATE TABLE public.digital_passport_stamps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  place_id text not null,
  stamp_code text not null,
  collected_at timestamptz default now(),
  unique(user_id, place_id)
);

-- 6. user_badges
CREATE TABLE public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  badge_code text not null,
  earned_at timestamptz default now(),
  unique(user_id, badge_code)
);

-- 7. trip_plans
CREATE TABLE public.trip_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  trip_date date,
  created_at timestamptz default now()
);

-- 8. trip_plan_items
CREATE TABLE public.trip_plan_items (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid references public.trip_plans(id) on delete cascade,
  place_id text not null,
  order_index int not null,
  note text
);

-- 9. local_taxi_drivers
CREATE TABLE public.local_taxi_drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  application_id uuid references public.local_taxi_applications(id) on delete set null,
  first_name text not null,
  last_name text not null,
  nickname text,
  age int,
  phone text not null,
  service_area text,
  stand_location text,
  public_contact_address text,
  available_now boolean default false,
  rating numeric default 5.0,
  profile_image text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. local_taxi_vehicles
CREATE TABLE public.local_taxi_vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references public.local_taxi_drivers(id) on delete cascade unique,
  vehicle_plate text not null,
  vehicle_type text not null,
  vehicle_color text,
  vehicle_description text,
  capacity int,
  luggage_note text
);

-- 11. local_taxi_verifications
CREATE TABLE public.local_taxi_verifications (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references public.local_taxi_drivers(id) on delete cascade unique,
  verification_status text default 'pending',
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

-- 12. local_taxi_applications
CREATE TABLE public.local_taxi_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  first_name text not null,
  last_name text not null,
  nickname text,
  age int,
  phone text not null,
  service_area text,
  stand_location text,
  public_contact_address text,
  vehicle_plate text not null,
  vehicle_type text not null,
  vehicle_color text,
  vehicle_description text,
  capacity int,
  luggage_note text,
  application_status text default 'pending', -- pending, revision_required, approved, rejected
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_passport_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_taxi_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_taxi_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_taxi_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_taxi_applications ENABLE ROW LEVEL SECURITY;

-- Rules for private tables
-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);

-- saved_places
CREATE POLICY "Users can view own saved_places" ON public.saved_places FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved_places" ON public.saved_places FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved_places" ON public.saved_places FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved_places" ON public.saved_places FOR DELETE USING (auth.uid() = user_id);

-- checkins
CREATE POLICY "Users can view own checkins" ON public.checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON public.checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkins" ON public.checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checkins" ON public.checkins FOR DELETE USING (auth.uid() = user_id);

-- digital_passport_stamps
CREATE POLICY "Users can view own stamps" ON public.digital_passport_stamps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stamps" ON public.digital_passport_stamps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stamps" ON public.digital_passport_stamps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stamps" ON public.digital_passport_stamps FOR DELETE USING (auth.uid() = user_id);

-- user_badges
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own badges" ON public.user_badges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own badges" ON public.user_badges FOR DELETE USING (auth.uid() = user_id);

-- trip_plans
CREATE POLICY "Users can view own trip plans" ON public.trip_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trip plans" ON public.trip_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trip plans" ON public.trip_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trip plans" ON public.trip_plans FOR DELETE USING (auth.uid() = user_id);

-- trip_plan_items
CREATE POLICY "Users can view own trip plan items" ON public.trip_plan_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trip_plans WHERE id = trip_plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own trip plan items" ON public.trip_plan_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.trip_plans WHERE id = trip_plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own trip plan items" ON public.trip_plan_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.trip_plans WHERE id = trip_plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own trip plan items" ON public.trip_plan_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.trip_plans WHERE id = trip_plan_id AND user_id = auth.uid())
);

-- local_taxi_applications
CREATE POLICY "Users can view own taxi application" ON public.local_taxi_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own taxi application" ON public.local_taxi_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own taxi application" ON public.local_taxi_applications FOR UPDATE USING (auth.uid() = user_id AND application_status IN ('pending', 'revision_required'));

-- Rules for public tables
CREATE POLICY "Public users can read active taxi drivers" ON public.local_taxi_drivers FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Drivers can view own profile" ON public.local_taxi_drivers FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update own profile" ON public.local_taxi_drivers FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Public users can read vehicles of active drivers" ON public.local_taxi_vehicles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.local_taxi_drivers WHERE id = driver_id AND is_active = true));

CREATE POLICY "Drivers can view own vehicles" ON public.local_taxi_vehicles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.local_taxi_drivers WHERE id = driver_id AND user_id = auth.uid()));

CREATE POLICY "Drivers can update own vehicles" ON public.local_taxi_vehicles FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.local_taxi_drivers WHERE id = driver_id AND user_id = auth.uid()));

CREATE POLICY "Public users can read verifications of active drivers" ON public.local_taxi_verifications FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.local_taxi_drivers WHERE id = driver_id AND is_active = true));

CREATE POLICY "Drivers can view own verifications" ON public.local_taxi_verifications FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.local_taxi_drivers WHERE id = driver_id AND user_id = auth.uid()));

-- Seed data for Local Taxi
DO $$ 
DECLARE
  taxi1_id uuid := gen_random_uuid();
  taxi2_id uuid := gen_random_uuid();
  taxi3_id uuid := gen_random_uuid();
  taxi4_id uuid := gen_random_uuid();
BEGIN
  -- Driver 1 (Car)
  INSERT INTO public.local_taxi_drivers (id, first_name, last_name, nickname, age, phone, service_area, stand_location, public_contact_address, available_now, rating, profile_image)
  VALUES (taxi1_id, 'สมชาย', 'ชัยชนะ', 'ลุงสมชาย', 54, '0812345678', 'รอบตัวเมืองพิชัย • วัดหน้าพระธาตุ', 'สถานีรถไฟพิชัย', 'ชมรมรถยนต์บริการท่องเที่ยว', true, 4.9, '👨‍✈️');
  
  INSERT INTO public.local_taxi_vehicles (driver_id, vehicle_plate, vehicle_type, vehicle_color, vehicle_description, capacity, luggage_note)
  VALUES (taxi1_id, 'มค-729 อุตรดิตถ์', 'รถยนต์', 'เขียว-เหลือง', 'รถเก๋งส่วนบุคคล แอร์เย็น สะอาด', 4, 'รับกระเป๋าขนาดใหญ่ได้สูงสุด 3 ใบ');
  
  INSERT INTO public.local_taxi_verifications (driver_id, verification_status, verified_by_agency, verification_ref, verified_at, expires_at, identity_checked, phone_checked, vehicle_plate_checked, vehicle_type_checked, government_record_checked, tourism_training_checked)
  VALUES (taxi1_id, 'verified', 'เทศบาลตำบลพิชัย', 'PHC-TAXI-2026-001', '2026-01-15', '2027-01-14', true, true, true, true, true, true);

  -- Driver 2 (Songthaew)
  INSERT INTO public.local_taxi_drivers (id, first_name, last_name, nickname, age, phone, service_area, stand_location, public_contact_address, available_now, rating, profile_image)
  VALUES (taxi2_id, 'พูนศักดิ์', 'รักดี', 'พี่พูน', 42, '0898765432', 'ตลาดสดพิชัย • รอบตำบลในเมือง', 'หน้าตลาดสดเทศบาลตำบลพิชัย', 'กลุ่มสองแถวไม้โบราณ', true, 4.8, '🧔');
  
  INSERT INTO public.local_taxi_vehicles (driver_id, vehicle_plate, vehicle_type, vehicle_color, vehicle_description, capacity, luggage_note)
  VALUES (taxi2_id, '10-1445 อุตรดิตถ์', 'รถสองแถว', 'ส้มแดง', 'รถสองแถวไม้โบราณ ถ่ายรูปสวย', 12, 'มีตะแกรงด้านหลังสำหรับกระเป๋า');
  
  INSERT INTO public.local_taxi_verifications (driver_id, verification_status, verified_by_agency, verification_ref, verified_at, expires_at, identity_checked, phone_checked, vehicle_plate_checked, vehicle_type_checked, government_record_checked, tourism_training_checked)
  VALUES (taxi2_id, 'verified', 'กองสาธารณสุข เทศบาลตำบลพิชัย', 'PHC-TAXI-2026-003', '2026-02-10', '2027-02-09', true, true, true, true, true, true);

  -- Driver 3 (Motorcycle)
  INSERT INTO public.local_taxi_drivers (id, first_name, last_name, nickname, age, phone, service_area, stand_location, public_contact_address, available_now, rating, profile_image)
  VALUES (taxi3_id, 'วิชัย', 'ดาบพิพัตน์', 'โกวิท', 29, '0855551234', 'บขส. คิวรถพิชัย • ชุมชน OTOP', 'คิวรถจักรยานยนต์ข้าง บขส.', 'คิวจักรยานยนต์รับจ้างเบอร์ 7', false, 4.7, '🛵');
  
  INSERT INTO public.local_taxi_vehicles (driver_id, vehicle_plate, vehicle_type, vehicle_color, vehicle_description, capacity, luggage_note)
  VALUES (taxi3_id, 'กขม-452 อุตรดิตถ์', 'มอเตอร์ไซค์รับจ้าง', 'แดง-ดำ', 'คล่องตัวสูง มีหมวกกันน็อก', 1, 'เหมาะสำหรับเป้ขนาดกลาง');
  
  INSERT INTO public.local_taxi_verifications (driver_id, verification_status, verified_by_agency, verification_ref, verified_at, expires_at, identity_checked, phone_checked, vehicle_plate_checked, vehicle_type_checked, government_record_checked, tourism_training_checked)
  VALUES (taxi3_id, 'verified', 'สภ.พิชัย', 'PHC-TAXI-2026-007', '2025-11-20', '2026-11-19', true, true, true, true, true, false);

  -- Driver 4 (Pickup / Van)
  INSERT INTO public.local_taxi_drivers (id, first_name, last_name, nickname, age, phone, service_area, stand_location, public_contact_address, available_now, rating, profile_image)
  VALUES (taxi4_id, 'สมรรถ', 'แสงทอง', 'น้าเม่น', 45, '0876543210', 'สถานีขนส่ง • รอบอำเภอพิชัย', 'หน้าสถานีขนส่ง', 'สมาคมรถกระบะรับจ้างพิชัย', true, 4.6, '👨‍🏭');
  
  INSERT INTO public.local_taxi_vehicles (driver_id, vehicle_plate, vehicle_type, vehicle_color, vehicle_description, capacity, luggage_note)
  VALUES (taxi4_id, 'บจ-1234 อุตรดิตถ์', 'รถกระบะรับจ้าง', 'นํ้าเงิน', 'รถกระบะหลังคาเหล็ก กว้างขวาง', 8, 'รับขนของหนักและสัมภาระจํานวนมาก');
  
  INSERT INTO public.local_taxi_verifications (driver_id, verification_status, verified_by_agency, verification_ref, verified_at, expires_at, identity_checked, phone_checked, vehicle_plate_checked, vehicle_type_checked, government_record_checked, tourism_training_checked)
  VALUES (taxi4_id, 'verified', 'สถานีขนส่งจังหวัด', 'PHC-TAXI-2026-004', '2026-04-12', '2027-04-11', true, true, true, true, true, true);
END $$;
