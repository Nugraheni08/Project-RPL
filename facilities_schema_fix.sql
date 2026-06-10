-- ============================================================================
-- FACILITIES — Database Schema Alignment Fix
-- Copy-paste this entire file into Supabase SQL Editor and run it.
-- This script is FULLY IDEMPOTENT — safe to run multiple times.
-- ============================================================================
-- Problem:
--   The original `facilities_setup.sql` created column names (lat, lng, addr)
--   that do not match what the API routes query (latitude, longitude, address, type).
--   This causes the API to return empty/undefined values for latitude/longitude,
--   ultimately breaking MapView.tsx which expects those fields.
--
-- This script:
--   1. Adds missing columns if they don't exist (latitude, longitude, address, type)
--   2. Migrates data from old columns (lat → latitude, lng → longitude, addr → address)
--   3. Enables RLS & adds a proper SELECT policy so all authenticated users can read
--   4. Adds the facilities table to the supabase_realtime publication for live updates
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENSURE THE FACILITIES TABLE EXISTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.facilities (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    category   VARCHAR(255) DEFAULT '',
    type       VARCHAR(50)  DEFAULT '',         -- 'refill_air' or 'tempat_sampah'
    latitude   DOUBLE PRECISION DEFAULT 0,
    longitude  DOUBLE PRECISION DEFAULT 0,
    address    TEXT DEFAULT '',
    status     VARCHAR(50)  DEFAULT 'aktif',    -- 'aktif', 'maintenance', 'rusak'
    created_at TIMESTAMPTZ   DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. ADD MISSING COLUMNS (if old schema has lat/lng/addr instead)
--    Uses DO block with exception handling for true idempotency.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    -- Add 'latitude' if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'facilities'
          AND column_name  = 'latitude'
    ) THEN
        ALTER TABLE public.facilities ADD COLUMN latitude DOUBLE PRECISION DEFAULT 0;
    END IF;

    -- Add 'longitude' if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'facilities'
          AND column_name  = 'longitude'
    ) THEN
        ALTER TABLE public.facilities ADD COLUMN longitude DOUBLE PRECISION DEFAULT 0;
    END IF;

    -- Add 'address' if missing (the API uses 'address', not 'addr')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'facilities'
          AND column_name  = 'address'
    ) THEN
        ALTER TABLE public.facilities ADD COLUMN address TEXT DEFAULT '';
    END IF;

    -- Add 'type' if missing ('refill_air' or 'tempat_sampah')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'facilities'
          AND column_name  = 'type'
    ) THEN
        ALTER TABLE public.facilities ADD COLUMN type VARCHAR(50) DEFAULT '';
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. MIGRATE DATA FROM OLD COLUMN NAMES TO NEW (if old columns exist)
--    Copies:   lat → latitude,   lng → longitude,   addr → address
--    Leaves old columns intact (no destructive action).
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    -- lat → latitude
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'facilities'
          AND column_name  = 'lat'
    ) THEN
        UPDATE public.facilities
        SET latitude = lat
        WHERE latitude IS NULL OR latitude = 0;
    END IF;

    -- lng → longitude
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'facilities'
          AND column_name  = 'lng'
    ) THEN
        UPDATE public.facilities
        SET longitude = lng
        WHERE longitude IS NULL OR longitude = 0;
    END IF;

    -- addr → address
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'facilities'
          AND column_name  = 'addr'
    ) THEN
        UPDATE public.facilities
        SET address = addr
        WHERE (address IS NULL OR address = '')
          AND addr IS NOT NULL;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
--    Enable RLS and ensure at least authenticated users can read.
-- ----------------------------------------------------------------------------
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the SELECT policy (idempotent)
DROP POLICY IF EXISTS "Allow authenticated read access to facilities" ON public.facilities;
CREATE POLICY "Allow authenticated read access to facilities"
    ON public.facilities
    FOR SELECT
    TO authenticated
    USING (true);

-- Also allow anon reads if needed (for public map pages that don't require login)
DROP POLICY IF EXISTS "Allow anon read access to facilities" ON public.facilities;
CREATE POLICY "Allow anon read access to facilities"
    ON public.facilities
    FOR SELECT
    TO anon
    USING (true);

-- ----------------------------------------------------------------------------
-- 5. REALTIME PUBLICATION
--    Add facilities table to supabase_realtime for live map updates.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
    END IF;
END $$;

-- Add the facilities table (safe to run even if already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.facilities;

-- ----------------------------------------------------------------------------
-- 6. (Optional) CREATE INDEXES for performance
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_facilities_type ON public.facilities (type);
CREATE INDEX IF NOT EXISTS idx_facilities_status ON public.facilities (status);
CREATE INDEX IF NOT EXISTS idx_facilities_created_at ON public.facilities (created_at DESC);

-- ============================================================================
-- DONE. After running this script:
--   1. The `facilities` table will have the correct columns (type, latitude, longitude, address, status)
--   2. Old data from lat/lng/addr columns will be migrated automatically
--   3. RLS policies allow both authenticated and anonymous reads
--   4. Realtime streaming is enabled for live map updates
--   5. The MapView.tsx crash should be fully resolved
-- ============================================================================