-- ============================================================
-- ISSUE REPORT PHOTOS — COMPLETE SQL CONFIGURATION
-- Run this in the Supabase SQL Editor
-- ============================================================
--
-- WHAT THIS SCRIPT DOES:
--   Part A — CREATE the `reports` table if it does not exist
--            (safe fallback; your db.sql already creates it)
--   Part B — ALTER the table to add `photo_url` column
--   Part C — CREATE the `report-proofs` storage bucket
--   Part D — APPLY Row-Level Security (RLS) policies
--            to the storage bucket
--
-- TABLE-LEVEL RLS (INSERT / SELECT on `reports`) is already
-- defined in db.sql lines 205-209. You only need to re-run
-- those if you dropped them by accident.
-- ============================================================

-- ============================================================
-- PART A: CREATE reports TABLE (SAFE — skips if already exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    facility_type VARCHAR(20),
    location_ref VARCHAR(255),
    description TEXT NOT NULL,
    photo_url TEXT DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'IN PROGRESS', 'RESOLVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART B: ADD photo_url column (if table already existed)
-- ============================================================
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT NULL;

-- ============================================================
-- PART C: CREATE STORAGE BUCKET for uploaded proof images
-- ============================================================
INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
VALUES (
    'report-proofs',                                   -- bucket id
    'report-proofs',                                   -- bucket name
    TRUE,                                              -- publicly readable
    5242880,                                           -- 5 MB max per file
    ARRAY[
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/heic',
        'image/heif'
    ]
)
ON CONFLICT (id) DO NOTHING;                           -- safe re-run

-- ============================================================
-- PART D: STORAGE RLS POLICIES
-- ============================================================

-- D1. Anyone can READ (view) photos from this bucket
DROP POLICY IF EXISTS "Public read report photos" ON storage.objects;
CREATE POLICY "Public read report photos" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'report-proofs');

-- D2. Only authenticated users can UPLOAD photos
DROP POLICY IF EXISTS "Auth users upload report photos" ON storage.objects;
CREATE POLICY "Auth users upload report photos" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'report-proofs'
        AND auth.role() = 'authenticated'
    );

-- D3. Users can DELETE their own uploads (cleanup / replace)
DROP POLICY IF EXISTS "Auth users delete own report photos" ON storage.objects;
CREATE POLICY "Auth users delete own report photos" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'report-proofs'
        AND auth.uid() = owner
    );

-- ============================================================
-- PART E: TABLE RLS POLICIES (re-asserted, same as db.sql)
--         Run these only if db.sql has NOT been run yet.
-- ============================================================

-- Enable RLS on the reports table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT their own reports
DROP POLICY IF EXISTS "Allow user insert report" ON public.reports;
CREATE POLICY "Allow user insert report" ON public.reports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to SELECT their own reports
DROP POLICY IF EXISTS "Allow user read own reports" ON public.reports;
CREATE POLICY "Allow user read own reports" ON public.reports
    FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================
-- VERIFICATION QUERIES (uncomment to test)
-- ============================================================

-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'reports';

-- SELECT id, name, public FROM storage.buckets
-- WHERE name = 'report-proofs';

-- SELECT tablename, policyname, cmd FROM pg_policies
-- WHERE tablename = 'reports';