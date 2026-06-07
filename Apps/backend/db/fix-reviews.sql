-- ============================================================
-- FIX: Tambah kolom is_anonymous & status ke public.reviews
--      + buat facility_id boleh NULL (untuk review umum)
-- ============================================================
-- Jalankan di Supabase SQL Editor.
-- ============================================================

-- 1. Tambah kolom is_anonymous (boolean, default FALSE)
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Tambah kolom status untuk moderasi
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
CHECK (status IN ('PENDING', 'APPROVED', 'HIDDEN', 'FLAGGED'));

-- 3. Facility ID boleh NULL (untuk review umum yang tidak spesifik ke satu fasilitas)
ALTER TABLE public.reviews ALTER COLUMN facility_id DROP NOT NULL;

-- ============================================================
-- Verifikasi
-- ============================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'reviews';