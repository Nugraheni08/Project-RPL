import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const serviceSupabase = getServiceSupabase();

    const { data, error } = await serviceSupabase
      .from('facilities')
      .select('id, name, category, type, latitude, longitude, address, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('PUBLIC_FACILITIES_ERROR — GET:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: `Gagal fetch: ${error.message}` }, { status: 500 });
    }

    const facilities = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name || '',
      category: row.category || '',
      type: row.type || '',
      latitude: Number(row.latitude) || 0,
      longitude: Number(row.longitude) || 0,
      addr: row.address || '',
      status: row.status || 'aktif',
      created_at: row.created_at || '',
    }));

    return NextResponse.json({ facilities });
  } catch (error) {
    console.error('PUBLIC_FACILITIES_ERROR — GET unhandled:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}