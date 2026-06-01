-- ============================================================
-- ADMIN ACCOUNT SETUP (Jalankan di Supabase SQL Editor)
-- ============================================================
-- File ini memperbaiki SEMUA constraint lama + insert admin.

-- LANGKAH 1: Tambah kolom username (kalau schema lama belum punya)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username VARCHAR(30) UNIQUE;

-- LANGKAH 2: HAPUS SEMUA constraint CHECK di kolom role
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS chk_role_identifier;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- LANGKAH 3: BUAT ulang constraint dengan 'Admin' diizinkan
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (
    role IN ('Mahasiswa', 'Dosen', 'Admin')
);

-- LANGKAH 4: Tambah constraint role + nim/nip (sama seperti db.sql)
--    (Skip kalau sudah ada dari DROP di atas, ini opsional)
ALTER TABLE public.users ADD CONSTRAINT chk_role_identifier CHECK (
    (role = 'Mahasiswa' AND nim IS NOT NULL AND nip IS NULL) OR
    (role = 'Dosen' AND nip IS NOT NULL AND nim IS NULL) OR
    (role = 'Admin' AND nim IS NULL AND nip IS NULL)
) NOT VALID;
-- NOT VALID dipakai supaya kalau ada data existing yang tidak comply,
-- constraint tetap bisa dibuat tanpa error.

-- LANGKAH 5: Insert admin
INSERT INTO public.users (id, email, username, role, is_verified)
VALUES ('7aebd446-1fe5-4cfd-a62c-746d16f4e5c7', 'admin@wmap.com', 'admin_wmap', 'Admin', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name)
VALUES ('7aebd446-1fe5-4cfd-a62c-746d16f4e5c7', 'WMap Administrator')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VERIFIKASI
-- ============================================================
-- SELECT u.id, u.email, u.role, p.full_name
-- FROM public.users u
-- JOIN public.profiles p ON p.id = u.id
-- WHERE u.role = 'Admin';