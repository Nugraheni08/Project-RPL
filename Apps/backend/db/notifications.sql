-- ============================================================
-- TABEL NOTIFICATIONS — Real-time Notification System
-- ============================================================
-- Jalankan di Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    type VARCHAR(30) NOT NULL CHECK (type IN ('admin_broadcast', 'ai_fun_fact')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk sorting terbaru
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Semua pengguna terautentikasi boleh membaca notifikasi
DROP POLICY IF EXISTS "Allow authenticated read notifications" ON public.notifications;
CREATE POLICY "Allow authenticated read notifications" ON public.notifications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Hanya service_role yang boleh insert (admin broadcast & cron AI)
DROP POLICY IF EXISTS "Allow service_role insert notifications" ON public.notifications;
CREATE POLICY "Allow service_role insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Grants
GRANT ALL ON public.notifications TO authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;