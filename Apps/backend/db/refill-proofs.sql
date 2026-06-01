-- ============================================================
-- REFILL PROOF & ANTI-SPAM MIGRATION (Run in Supabase SQL Editor)
-- Adds: proof_image_url column, storage bucket, RLS, cooldown trigger
-- ============================================================

-- ============================================================
-- PART 1: ALTER refill_activity table
-- ============================================================

-- Add proof_image_url column to store the uploaded photo URL
ALTER TABLE public.refill_activity 
ADD COLUMN IF NOT EXISTS proof_image_url TEXT DEFAULT NULL;

-- ============================================================
-- PART 2: CREATE STORAGE BUCKET
-- ============================================================

-- Insert the bucket into Supabase's internal storage schema
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'refill-proofs',
  'refill-proofs',
  TRUE,                              -- public bucket
  5242880,                           -- 5 MB size limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PART 3: STORAGE RLS POLICIES
-- ============================================================

-- 3a. Allow anyone (public) to READ/download files from this bucket
DROP POLICY IF EXISTS "Public read refill proofs" ON storage.objects;
CREATE POLICY "Public read refill proofs" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'refill-proofs');

-- 3b. Allow authenticated users to INSERT (upload) files
DROP POLICY IF EXISTS "Auth users upload refill proofs" ON storage.objects;
CREATE POLICY "Auth users upload refill proofs" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'refill-proofs'
    AND auth.role() = 'authenticated'
  );

-- 3c. Allow authenticated users to DELETE their own uploads (optional cleanup)
DROP POLICY IF EXISTS "Auth users delete own refill proofs" ON storage.objects;
CREATE POLICY "Auth users delete own refill proofs" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'refill-proofs'
    AND auth.uid() = owner
  );

-- ============================================================
-- PART 4: DATABASE-LEVEL ANTI-SPAM COOLDOWN
--        (prevents same user from logging same facility within 1 hour)
-- ============================================================

-- This trigger function blocks INSERTs that violate cooldown
CREATE OR REPLACE FUNCTION public.enforce_refill_cooldown()
RETURNS TRIGGER AS $$
DECLARE
  last_refill TIMESTAMPTZ;
  cooldown_minutes INTEGER := 60; -- 1 hour cooldown
BEGIN
  -- Find the most recent refill at this facility by this user
  SELECT MAX(created_at)
  INTO last_refill
  FROM public.refill_activity
  WHERE user_id = NEW.user_id
    AND facility_id = NEW.facility_id
    AND activity_type IN ('refill', 'waste_deposit');

  -- If a recent refill exists within the cooldown window, reject
  IF last_refill IS NOT NULL 
     AND last_refill > (NOW() - (cooldown_minutes || ' minutes')::INTERVAL) THEN
    RAISE EXCEPTION 'Cooldown: You can only log a refill at this facility once per hour. Last refill: %', last_refill;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger
DROP TRIGGER IF EXISTS trigger_enforce_refill_cooldown ON public.refill_activity;
CREATE TRIGGER trigger_enforce_refill_cooldown
  BEFORE INSERT ON public.refill_activity
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_refill_cooldown();

-- ============================================================
-- VERIFICATION QUERIES (run after migration to confirm)
-- ============================================================

-- Check the new column exists
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'refill_activity' AND column_name = 'proof_image_url';

-- Check the bucket was created
-- SELECT id, name, public FROM storage.buckets WHERE name = 'refill-proofs';

-- Check storage policies
