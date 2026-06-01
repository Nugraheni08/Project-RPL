-- ============================================================
-- DEFAULT POINTS & REAL-TIME RANKING SETUP
-- Jalankan di Supabase SQL Editor
-- ============================================================
-- Fitur:
-- 1. Trigger auto-create public.users row saat user register di auth.users
--    dengan total_points = 0 (default eksplisit)
-- 2. View user_rankings — ranking real-time semua user pakai DENSE_RANK()
-- 3. RPC get_user_rank — ambil rank + points user tertentu
-- ============================================================

-- ============================================================
-- BAGIAN 1: DEFAULT POINTS = 0 UNTUK USER BARU
-- ============================================================

-- 1a. Tambah kolom total_points jika belum ada
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;

-- 1b. Pastikan default-nya 0
ALTER TABLE public.users ALTER COLUMN total_points SET DEFAULT 0;

-- 1c. Update semua user existing yang total_points-nya NULL menjadi 0
UPDATE public.users SET total_points = 0 WHERE total_points IS NULL;

-- 1d. Trigger Function: auto-buat row di public.users begitu ada user baru di auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, total_points, role, is_verified)
  VALUES (
    NEW.id,                -- UUID dari auth.users
    NEW.email,             -- email dari auth.users
    0,                     -- DEFAULT: 0 eco points
    'Mahasiswa',           -- default role (bisa di-override nanti)
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1e. Pasang trigger di auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- BAGIAN 2: REAL-TIME RANKING VIEW (DENSE_RANK)
-- ============================================================

-- 2a. View: ranking semua user berdasarkan total_points (desc)
-- DENSE_RANK memastikan user dengan poin sama = rank sama
CREATE OR REPLACE VIEW public.user_rankings AS
SELECT
  u.id,
  u.email,
  u.username,
  u.role,
  u.total_points,
  DENSE_RANK() OVER (ORDER BY u.total_points DESC) AS rank,
  p.avatar_url,
  p.full_name
FROM public.users u
LEFT JOIN public.profiles p ON u.id = p.id;

-- ============================================================
-- BAGIAN 3: RPC FUNCTION — AMBIL RANK USER TERTENTU
-- ============================================================

-- 3a. RPC: ambil rank, points, dan info untuk 1 user (by user_id)
CREATE OR REPLACE FUNCTION public.get_user_rank(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  username VARCHAR,
  role TEXT,
  total_points INTEGER,
  rank BIGINT,
  avatar_url TEXT,
  full_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ur.id,
    ur.email,
    ur.username,
    ur.role,
    ur.total_points,
    ur.rank,
    ur.avatar_url,
    ur.full_name
  FROM public.user_rankings ur
  WHERE ur.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- BAGIAN 4: GRANTS & RLS UNTUK VIEW & FUNCTION
-- ============================================================

-- 4a. Grant akses untuk user yang terautentikasi
GRANT SELECT ON public.user_rankings TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_rank(UUID) TO authenticated, anon, service_role;

-- 4b. RLS Policy: user bisa lihat semua ranking (leaderboard publik)
DROP POLICY IF EXISTS "Allow authenticated read rankings" ON public.users;
CREATE POLICY "Allow authenticated read rankings" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);