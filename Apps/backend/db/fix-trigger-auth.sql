-- ============================================================
-- FIX: handle_new_user TRIGGER (Akar Masalah Error 500 Signup)
-- ============================================================
-- Gunakan script ini di Supabase SQL Editor untuk memperbaiki
-- function + trigger yang gagal saat user baru mendaftar.
-- 
-- Error yang muncul:
--   "Database error creating new user" (500 unexpected_failure)
--   pada endpoint /auth/v1/signup
--
-- ============================================================

-- LANGKAH 0: Bersihkan trigger & function lama (jika ada)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- ============================================================
-- LANGKAH 1: Buat ulang function handle_new_user
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER          -- ← Penting: bypass RLS untuk insert ke public.users
SET search_path = ''      -- ← Keamanan: kosongkan search_path
AS $$
DECLARE
    v_role          TEXT;
    v_username      TEXT;
    v_identifier    TEXT;
    v_full_name     TEXT;
    v_avatar_url    TEXT;
BEGIN
    -- ── Ambil data dari raw_user_meta_data (dikirim via signUp options.data) ──
    --     Gunakan ->> untuk mengambil nilai TEXT, bukan JSONB
    v_role       := COALESCE(NEW.raw_user_meta_data ->> 'role', 'Mahasiswa');
    v_username   := COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1));
    v_identifier := COALESCE(NEW.raw_user_meta_data ->> 'identifier_number', '');
    v_full_name  := COALESCE(NEW.raw_user_meta_data ->> 'full_name', v_username);
    v_avatar_url := COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL);

    -- ── Validasi role (hanya izinkan 3 nilai) ────────────────────────────────
    IF v_role NOT IN ('Mahasiswa', 'Dosen', 'Admin') THEN
        v_role := 'Mahasiswa';
    END IF;

    -- ── Step A: INSERT ke public.users ──────────────────────────────────────
    --     Gunakan ON CONFLICT DO NOTHING untuk aman dari duplikasi
    INSERT INTO public.users (
        id,
        email,
        username,
        role,
        nim,
        nip,
        is_verified,
        total_points,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,                              -- UUID dari auth.users
        NEW.email,                           -- email dari auth.users
        v_username,                          -- dari metadata atau fallback
        v_role,                              -- dari metadata atau default 'Mahasiswa'
        CASE WHEN v_role = 'Mahasiswa' AND v_identifier != '' THEN v_identifier ELSE NULL END,
        CASE WHEN v_role = 'Dosen'     AND v_identifier != '' THEN v_identifier ELSE NULL END,
        FALSE,                               -- is_verified: FALSE (belum verifikasi email)
        0,                                   -- total_points: mulai dari 0
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- ── Step B: INSERT ke public.profiles ──────────────────────────────────
    INSERT INTO public.profiles (
        id,
        full_name,
        avatar_url,
        updated_at
    ) VALUES (
        NEW.id,
        v_full_name,
        v_avatar_url,
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- ============================================================
-- LANGKAH 2: Pasang trigger pada auth.users
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- LANGKAH 3: Pastikan grants & RLS sudah benar
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ============================================================
-- VERIFIKASI (jalankan setelah script di atas)
-- ============================================================
-- 1. Cek function ada:
--    SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
--
-- 2. Cek trigger terpasang:
--    SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
--
-- 3. Coba daftar user baru di aplikasi.
--    Kalau berhasil, row di public.users & public.profiles akan terisi otomatis.