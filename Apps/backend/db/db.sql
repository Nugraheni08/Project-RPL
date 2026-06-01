-- ============================================================
-- WMAP DATABASE SCHEMA (For Supabase SQL Editor)
-- Updated: Full dynamic schema with users, profiles, facilities,
--           refill_activity, triggers, and RLS policies.
-- ============================================================

-- Reset (jalankan hanya jika ingin reset total)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- ============================================================
-- 1. TABEL UTAMA: USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    username VARCHAR(30) UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('Mahasiswa', 'Dosen', 'Admin')),
    nim VARCHAR(11) UNIQUE,
    nip VARCHAR(18) UNIQUE,
    total_points INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_role_identifier CHECK (
        (role = 'Mahasiswa' AND nim IS NOT NULL AND nip IS NULL) OR
        (role = 'Dosen' AND nip IS NOT NULL AND nim IS NULL) OR
        (role = 'Admin' AND nim IS NULL AND nip IS NULL)
    )
);

-- ============================================================
-- 2. TABEL PROFILES (Detail Profil + Foto)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    location VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. TABEL EMAIL VERIFICATIONS (OTP)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_verifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    otp_code VARCHAR(4) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TABEL FACILITIES (Water Station & Waste Bin Locations)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('refill_air', 'tempat_sampah')),
    category VARCHAR(50),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'maintenance', 'rusak')),
    address TEXT,
    full_address TEXT,
    rating DECIMAL(2,1) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. TABEL REFILL ACTIVITY (Log Refill & History Poin)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.refill_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    activity_type VARCHAR(20) DEFAULT 'refill' CHECK (activity_type IN ('refill', 'waste_deposit', 'report')),
    points_earned INTEGER NOT NULL DEFAULT 0,
    volume_ml INTEGER DEFAULT 500,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refill_history ON public.refill_activity (user_id, created_at DESC);

-- ============================================================
-- 6. TABEL REVIEWS (Ulasan Fasilitas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. TABEL REPORTS (Laporan Masalah Fasilitas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    facility_type VARCHAR(20),
    location_ref VARCHAR(255),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN PROGRESS', 'RESOLVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTOMATED TRIGGERS
-- ============================================================

-- A. Auto-tambah poin saat refill activity
CREATE OR REPLACE FUNCTION public.handle_refill_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users 
  SET total_points = total_points + NEW.points_earned
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_add_refill_points ON public.refill_activity;
CREATE TRIGGER trigger_add_refill_points
  AFTER INSERT ON public.refill_activity
  FOR EACH ROW EXECUTE FUNCTION public.handle_refill_points();

-- B. Auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_users_updated_at ON public.users;
CREATE TRIGGER tg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS tg_profiles_updated_at ON public.profiles;
CREATE TRIGGER tg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS tg_reports_updated_at ON public.reports;
CREATE TRIGGER tg_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refill_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Users Policies
DROP POLICY IF EXISTS "Allow insert for auth registration" ON public.users;
CREATE POLICY "Allow insert for auth registration" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select own user data" ON public.users;
CREATE POLICY "Allow select own user data" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow update own user data" ON public.users;
CREATE POLICY "Allow update own user data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Profiles Policies
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow user insert own profile" ON public.profiles;
CREATE POLICY "Allow user insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow user update own profile" ON public.profiles;
CREATE POLICY "Allow user update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Refill Activity Policies
DROP POLICY IF EXISTS "Allow user insert own activity" ON public.refill_activity;
CREATE POLICY "Allow user insert own activity" ON public.refill_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow user read own history" ON public.refill_activity;
CREATE POLICY "Allow user read own history" ON public.refill_activity FOR SELECT USING (auth.uid() = user_id);

-- Reviews Policies
DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow user insert own review" ON public.reviews;
CREATE POLICY "Allow user insert own review" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reports Policies
DROP POLICY IF EXISTS "Allow user insert report" ON public.reports;
CREATE POLICY "Allow user insert report" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow user read own reports" ON public.reports;
CREATE POLICY "Allow user read own reports" ON public.reports FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- ADMIN ACCOUNT SETUP — Lihat file admin.sql (pisah)
-- ============================================================
