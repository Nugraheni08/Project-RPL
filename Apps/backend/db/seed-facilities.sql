-- ============================================================
-- SEEDER: FACILITIES (Water Station + Tempat Sampah)
-- ============================================================
-- Jalankan script ini di Supabase SQL Editor setelah tabel
-- public.facilities sudah dibuat (lihat db.sql).
--
-- Struktur tabel yang digunakan:
--   id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
--   name          VARCHAR(100) NOT NULL
--   type          VARCHAR(20)  CHECK (type IN ('refill_air','tempat_sampah'))
--   category      VARCHAR(50)
--   latitude      DECIMAL(10,8) NOT NULL
--   longitude     DECIMAL(11,8) NOT NULL
--   status        VARCHAR(20)  DEFAULT 'aktif'
--   address       TEXT
--   full_address  TEXT
--   rating        DECIMAL(2,1) DEFAULT 5.0
--   reviews_count INTEGER DEFAULT 0
--   description   TEXT
--   created_at    TIMESTAMPTZ DEFAULT NOW()
-- ============================================================

-- ── Hapus data lama (hati-hati: hanya jalankan kalau mau reset) ──
-- DELETE FROM public.facilities;

-- ============================================================
-- 1. WATER STATION (refill_air)
-- ============================================================
INSERT INTO public.facilities (name, type, category, latitude, longitude, status, description) VALUES
('Golden Corner',          'refill_air', 'Water Station', -6.5578691, 106.7310589, 'aktif', 'Stasiun isi ulang air minum di area Golden Corner.'),
('CCR 1.09',               'refill_air', 'Water Station', -6.5565914, 106.7312138, 'aktif', 'Stasiun isi ulang di dekat ruang CCR 1.09.'),
('Satari',                 'refill_air', 'Water Station', -6.5553873, 106.7240151, 'aktif', 'Water station di area Satari.'),
('Fahutan',                'refill_air', 'Water Station', -6.5568300, 106.7306300, 'aktif', 'Water station di Fakultas Kehutanan.'),
('Water Station Fapet',    'refill_air', 'Water Station', -6.5553300, 106.7269900, 'aktif', 'Mesin dispenser biru "Wakaf IPB" di samping pintu "RUANG ABSEN", Komplek Parkir Fakultas Peternakan. CPVC+5W7');

-- ============================================================
-- 2. TEMPAT SAMPAH
-- ============================================================
INSERT INTO public.facilities (name, type, category, latitude, longitude, status, description) VALUES
('Dekat Gedung Fisika',          'tempat_sampah', 'Tempat Sampah', -6.5574908, 106.7309288, 'aktif', 'Tempat sampah dekat Gedung Fisika.'),
('CCR 1.10',                     'tempat_sampah', 'Tempat Sampah', -6.5565938, 106.7313097, 'aktif', 'Tempat sampah di dekat CCR 1.10.'),
('Sekret SSMI',                  'tempat_sampah', 'Tempat Sampah', -6.5561871, 106.7310857, 'aktif', 'Tempat sampah di depan Sekretariat SSMI.'),
('CCR 2.14',                     'tempat_sampah', 'Tempat Sampah', -6.5565555, 106.7311893, 'aktif', 'Tempat sampah di dekat CCR 2.14.'),
('Parkir Satari',                'tempat_sampah', 'Tempat Sampah', -6.5551782, 106.7242776, 'aktif', 'Tempat sampah di area parkir Satari.'),
('Student Corner FMIPA',         'tempat_sampah', 'Tempat Sampah', -6.5579000, 106.7310900, 'aktif', 'Tempat sampah di Student Corner FMIPA.'),
('Golden Corner',                'tempat_sampah', 'Tempat Sampah', -6.5578200, 106.7313200, 'aktif', 'Tempat sampah di area Golden Corner.'),
('CCR Belakang',                 'tempat_sampah', 'Tempat Sampah', -6.5566900, 106.7316300, 'aktif', 'Tempat sampah di bagian belakang gedung CCR.'),
('CCR 1.03',                     'tempat_sampah', 'Tempat Sampah', -6.5562000, 106.7309200, 'aktif', 'Tempat sampah di dekat CCR 1.03.'),
('CCR Depan (DPKU)',             'tempat_sampah', 'Tempat Sampah', -6.5563000, 106.7312100, 'aktif', 'Tempat sampah di depan gedung CCR, area DPKU.'),
('CCR Lantai 2 (Titik 1)',       'tempat_sampah', 'Tempat Sampah', -6.5563700, 106.7310700, 'aktif', 'Tempat sampah di lantai 2 CCR titik 1.'),
('CCR Lantai 2 (Titik 2)',       'tempat_sampah', 'Tempat Sampah', -6.5563700, 106.7312900, 'aktif', 'Tempat sampah di lantai 2 CCR titik 2.'),
('Depan Perpus',                 'tempat_sampah', 'Tempat Sampah', -6.5589400, 106.7271000, 'aktif', 'Tempat sampah di depan Perpustakaan IPB.'),
('Depan GPK',                    'tempat_sampah', 'Tempat Sampah', -6.5589500, 106.7268700, 'aktif', 'Tempat sampah di depan GPK (Graha Pertamina Kampus).'),
('Halaman Gedung Sarjana Fapet', 'tempat_sampah', 'Tempat Sampah', -6.5553500, 106.7270100, 'aktif', '3 tempat sampah (kuning, merah, hijau) di samping dinding putih berlantai ubin, Komplek Parkir Fapet. CPVC+5W7'),
('Koridor Semi-Outdoor CCR',     'tempat_sampah', 'Tempat Sampah', -6.5564500, 106.7311200, 'aktif', '3 tempat sampah di koridor terbuka gedung CCR dengan tiang abu-abu dan pagar putih, Jl. Meranti. CPVJ+HVJ'),
('Koridor Dalam CCR',            'tempat_sampah', 'Tempat Sampah', -6.5564800, 106.7312500, 'aktif', '3 tempat sampah di dalam koridor gedung CCR berlantai keramik putih, samping barisan pintu kelas, Jl. Meranti. CPVJ+HVJ');

-- ============================================================
-- VERIFIKASI
-- ============================================================
-- SELECT type, count(*) FROM public.facilities GROUP BY type;
-- Harusnya: refill_air = 5, tempat_sampah = 17