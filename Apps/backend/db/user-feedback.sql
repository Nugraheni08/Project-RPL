-- ============================================================
-- TABEL USER FEEDBACK (Submit Review / "We value your input")
-- Menyimpan rating bintang, pesan feedback, dan preferensi anonim
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    message TEXT NOT NULL DEFAULT '',
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeks untuk query histori feedback pengguna
CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON public.user_feedback(user_id, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- POLICY: Semua pengguna terautentikasi boleh insert feedback
-- Jika anonymous, user_id akan NULL (di-handle dari frontend)
DROP POLICY IF EXISTS "Allow authenticated insert feedback" ON public.user_feedback;
CREATE POLICY "Allow authenticated insert feedback" ON public.user_feedback
    FOR INSERT WITH CHECK (
        -- Pastikan user_id = auth.uid() jika tidak anonymous
        -- Jika anonymous (user_id IS NULL), tetap boleh selama user terautentikasi
        auth.role() = 'authenticated'
        AND (
            (user_id IS NULL AND is_anonymous = true)
            OR
            (user_id = auth.uid() AND is_anonymous = false)
        )
    );

-- POLICY: Pengguna bisa melihat feedback mereka sendiri
DROP POLICY IF EXISTS "Allow select own feedback" ON public.user_feedback;
CREATE POLICY "Allow select own feedback" ON public.user_feedback
    FOR SELECT USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role = 'Admin'
        )
    );

-- POLICY: Pengguna bisa menghapus feedback mereka sendiri
DROP POLICY IF EXISTS "Allow delete own feedback" ON public.user_feedback;
CREATE POLICY "Allow delete own feedback" ON public.user_feedback
    FOR DELETE USING (user_id = auth.uid());

-- Grant akses
GRANT ALL ON public.user_feedback TO authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ============================================================
-- SELESAI — Tabel user_feedback siap digunakan!
-- Copy-paste seluruh kode di atas ke Supabase SQL Editor lalu RUN.
-- ============================================================