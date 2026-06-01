import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const serviceSupabase = getServiceSupabase();

    // ── Ambil user dari server session ───────────────────────────────
    const { data: sessionData, error: sessionError } = await serviceSupabase.auth.getUser();
    if (sessionError || !sessionData?.user) {
      console.error('USER_REPORTS_FETCH_ERROR — Unauthenticated:', sessionError);
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const userId = sessionData.user.id;

    // ── Query reports milik user ini ──────────────────────────────────
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