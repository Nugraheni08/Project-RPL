import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const serviceSupabase = getServiceSupabase();

    const { data: sessionData, error: sessionError } = await serviceSupabase.auth.getUser();
    if (sessionError || !sessionData?.user) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const { data, error } = await serviceSupabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('NOTIFICATIONS_FETCH_ERROR:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: `Gagal memuat notifikasi: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ notifications: data || [] });
  } catch (error) {
    console.error('NOTIFICATIONS_FETCH_ERROR — Unhandled:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}