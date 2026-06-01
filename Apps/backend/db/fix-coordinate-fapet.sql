-- ============================================================
-- QUICK FIX: Update Fapet Coordinates di Live Database
-- ============================================================
-- Jalankan di Supabase SQL Editor untuk mengupdate 
-- koordinat 2 fasilitas Fapet tanpa reset tabel.
-- 
-- Lokasi baru (dari Google Maps):
--   1. Water Station Fapet        lat:-6.5573320  lng:106.7222310
--   2. Halaman Gd. Sarjana Fapet   lat:-6.5570202  lng:106.7221242
-- ============================================================

UPDATE public.facilities
SET 
    latitude  = -6.5573320,
    longitude = 106.7222310
WHERE name = 'Water Station Fapet' AND type = 'refill_air';

UPDATE public.facilities
SET 
    latitude  = -6.5570202,
    longitude = 106.7221242
WHERE name = 'Halaman Gedung Sarjana Fapet' AND type = 'tempat_sampah';

-- Verifikasi
SELECT name, type, latitude, longitude
FROM public.facilities 
WHERE name IN ('Water Station Fapet', 'Halaman Gedung Sarjana Fapet');
