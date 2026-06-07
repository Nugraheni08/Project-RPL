-- ============================================================================
-- ECO REFILL — Supabase Database Schema & Realtime Configuration
-- Copy-paste this entire file into Supabase SQL Editor and run it.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. NOTIFICATIONS TABLE
-- Stores broadcast notifications (admin announcements and AI-generated fun facts)
-- that appear in the Header notification bell across all authenticated users.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  type       TEXT        NOT NULL DEFAULT 'announcement',  -- 'announcement' or 'ai_fun_fact'
  is_read    BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security so only authenticated users can read notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: any authenticated user can read all notifications (broadcast-style)
CREATE POLICY "Authenticated users can read notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (true);

-- Index for fast ordering by creation time
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications (created_at DESC);


-- ----------------------------------------------------------------------------
-- 2. REALTIME REPLICATION
-- Adds our 4 critical shared tables to the supabase_realtime publication so that
-- Postgres CHANGE events (INSERT / UPDATE / DELETE) are streamed to all
-- subscribed Supabase clients via WebSockets.
--
-- Tables covered:
--   • refill_activity — user water refills & waste deposits
--   • reviews         — user facility reviews & star ratings
--   • reports         — user facility issue reports
--   • notifications   — broadcast notifications (bell updates)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  -- Ensure the publication exists (Supabase creates it by default, but safe-guard)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
  END IF;
END $$;

-- Add each table to the publication (idempotent — won't fail if already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.refill_activity;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;