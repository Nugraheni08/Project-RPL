import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

// ── GET: Fetch all reports, joined with users for name/email ────────
export async function GET() {
  try {
    const serviceSupabase = getServiceSupabase();

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

    // ── Map to frontend format ────────────────────────────────────
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

// ── PATCH: Update report status (admin-only, uses service_role) ─────
export async function PATCH(request: NextRequest) {
  try {
    const serviceSupabase = getServiceSupabase();

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID dan status laporan diperlukan.' },
        { status: 400 }
      );
    }

    // Validate allowed statuses
    const validStatuses = ['PENDING', 'IN PROGRESS', 'RESOLVED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status tidak valid. Gunakan: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const { error } = await serviceSupabase
      .from('reports')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('REPORTS_UPDATE_ERROR:', error);
      return NextResponse.json(
        { error: `Gagal memperbarui status: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Status laporan berhasil diubah menjadi ${status}.`,
    });
  } catch (error) {
    console.error('REPORTS_UPDATE_ERROR — Unhandled exception:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat memperbarui status.' },
      { status: 500 }
    );
  }
}
