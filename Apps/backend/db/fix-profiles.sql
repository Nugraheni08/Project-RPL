-- ============================================================
-- PROFILE SAVE FIX (Jalankan di Supabase SQL Editor)
-- Fix untuk error "Gagal menyimpan profil" saat Save Changes
-- ============================================================

-- 1. Tambah kolom phone & location (kalau belum ada)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- 2. Pastikan RLS enable
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Hapus policy lama & buat ulang
DROP POLICY IF EXISTS "Allow user insert own profile" ON public.profiles;
CREATE POLICY "Allow user insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow user update own profile" ON public.profiles;
CREATE POLICY "Allow user update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);

-- 4. Grants untuk profiles
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;