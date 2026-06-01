-- ============================================================
-- AVATARS STORAGE BUCKET + RLS POLICIES
-- Jalankan di Supabase SQL Editor
-- ============================================================
-- Fitur:
-- 1. Bucket 'avatars' untuk foto profil user
-- 2. RLS: authenticated user upload avatar sendiri, semua bisa baca
-- 3. Kolom avatar_url sudah ada di public.profiles (no ALTER needed)
-- ============================================================

-- ============================================================
-- BAGIAN 1: CREATE STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,                              -- public bucket (URL bisa diakses semua)
  3145728,                           -- 3 MB size limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BAGIAN 2: STORAGE RLS POLICIES
-- ============================================================

-- 2a. Allow public READ (siapa saja bisa lihat avatar)
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- 2b. Allow authenticated users to INSERT (upload) avatar
--     File path convention: <user_id>.jpg (each user has 1 avatar)
DROP POLICY IF EXISTS "Auth users upload own avatar" ON storage.objects;
CREATE POLICY "Auth users upload own avatar" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2c. Allow authenticated users to UPDATE/DELETE their own avatar
DROP POLICY IF EXISTS "Auth users update own avatar" ON storage.objects;
CREATE POLICY "Auth users update own avatar" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Auth users delete own avatar" ON storage.objects;
CREATE POLICY "Auth users delete own avatar" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- VERIFICATION QUERIES (jalankan setelah migrate untuk cek)
-- ============================================================

-- Check bucket created
-- SELECT id, name, public FROM storage.buckets WHERE name = 'avatars';

-- Check policies
-- SELECT name, command, expression FROM storage.policies WHERE name LIKE '%avatar%';