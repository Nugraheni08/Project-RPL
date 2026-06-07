import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // ── Extract token from Authorization header ──────────────────
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.error('USER_REPORTS_FETCH_ERROR — Token tidak ditemukan di header.');
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    // ── Verify token and get user ────────────────────────────────
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error('USER_REPORTS_FETCH_ERROR — Verifikasi token gagal:', userError);
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const userId = userData.user.id;

    // ── Query reports via service_role client ─────────────────────
    const serviceSupabase = getServiceSupabase();
    const { data, error } = await serviceSupabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error(
        'USER_REPORTS_FETCH_ERROR — Query gagal:',
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: `Gagal mengambil data laporan: ${error.message}` },
        { status: 500 }
      );
    }

    // ── Map ke format frontend ────────────────────────────────────────
    const reports = (data || []).map((row: any) => ({
      id: row.id,
      type: row.facility_type || 'Unknown',
      location_ref: row.location_ref || '-',
      description: row.description || '',
      status: row.status || 'PENDING',
      created_at: row.created_at || '',
      bannerIcon: getBannerIcon(row.facility_type),
      bannerStyle: row.facility_type?.toLowerCase().includes('refill') ? 'water-bg' : 'trash-bg',
    }));

    return NextResponse.json({ reports });
  } catch (error) {
    console.error(
      'USER_REPORTS_FETCH_ERROR — Unhandled exception:',
      error
    );
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat mengambil data laporan.' },
      { status: 500 }
    );
  }
}

function getBannerIcon(facilityType: string): string {
  const t = (facilityType || '').toLowerCase();
  if (t.includes('refill') || t.includes('water')) return '💧';
  if (t.includes('waste') || t.includes('sampah') || t.includes('bin')) return '🗑️';
  return '📋';
}