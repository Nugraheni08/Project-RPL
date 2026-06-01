import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const serviceSupabase = getServiceSupabase();

    // ── Fetch reports dengan join ke users (nama + email) ──────────
    const { data, error } = await serviceSupabase
      .from('reports')
      .select('*, users!reports_user_id_fkey(username, email)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error(
        'REPORTS_FETCH_ERROR:',
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: `Gagal mengambil data laporan: ${error.message}` },
        { status: 500 }
      );
    }

    // ── Map ke format yang dipakai frontend ────────────────────────
    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      user_name: row.users?.username || row.users?.email?.split('@')[0] || 'User',
      user_email: row.users?.email || '',
      facility_type: row.facility_type || 'Unknown',
      location_ref: row.location_ref || '-',
      description: row.description || '',
      status: row.status || 'PENDING',
      created_at: row.created_at || '',
    }));

    return NextResponse.json({ reports: mapped });
  } catch (error) {
    console.error(
      'REPORTS_FETCH_ERROR — Unhandled exception:',
      error
    );
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat mengambil data laporan.' },
      { status: 500 }
    );
  }
}