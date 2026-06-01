-- ============================================================
-- FIX: Tambah kolom is_anonymous & status ke public.reviews
-- ============================================================
-- Jalankan di Supabase SQL Editor agar tabel reviews support
-- fitur feedback anonim + status moderasi.
-- ============================================================

-- 1. Tambah kolom is_anonymous (boolean, default FALSE)
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Tambah kolom status untuk moderasi (PENDING / APPROVED / HIDDEN / FLAGGED)
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
CHECK (status IN ('PENDING', 'APPROVED', 'HIDDEN', 'FLAGGED'));

-- 3. Facility ID boleh NULL (untuk feedback umum yang tidak spesifik ke fasilitas)
--    (Kolom facility_id sudah ada dari db.sql, tapi constraint NOT NULL mungkin perlu diubah)
--    Jika facility_id sudah NOT NULL, jalankan baris ini:
-- ALTER TABLE public.reviews ALTER COLUMN facility_id DROP NOT NULL;

-- ============================================================
-- Verifikasi
-- ============================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'reviews' AND column_name IN ('is_anonymous', 'status', 'facility_id');