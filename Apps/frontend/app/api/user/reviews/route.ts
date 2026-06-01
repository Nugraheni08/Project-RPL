import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Konfigurasi server tidak lengkap.' }, { status: 500 });
    }

    // ── Step 1: Verifikasi user via cookie-based client ────────────
    const cookieStore = cookies();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Cookie: cookieStore.toString() } },
    });

    const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !sessionData?.user) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const userId = sessionData.user.id;

    // ── Step 2: Query reviews via service_role ─────────────────────
    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error, count } = await serviceSupabase
      .from('reviews')
      .select('id, stars, comment, created_at, facilities(name)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('USER_REVIEWS_FETCH_ERROR:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: `Gagal memuat ulasan: ${error.message}` }, { status: 500 });
    }

    const reviews = (data || []).map((row: any) => ({
      id: row.id,
      facility: row.facilities?.name || 'Unknown Facility',
      stars: row.stars || 0,
      time: getRelativeTime(row.created_at),
      text: row.comment || '',
      created_at: row.created_at,
    }));

    return NextResponse.json({
      totalReviews: count || 0,
      reviews,
    });
  } catch (error) {
    console.error('USER_REVIEWS_FETCH_ERROR — Unhandled:', error);
    return NextResponse.json({ error: 'Gagal memuat ulasan pengguna.' }, { status: 500 });
  }
}

function getRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Baru saja';
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari lalu`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 minggu lalu';
  if (weeks < 4) return `${weeks} minggu lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}