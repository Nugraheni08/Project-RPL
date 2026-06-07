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
      console.error('NOTIFICATIONS_FETCH_ERROR — Token tidak ditemukan di header.');
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    // ── Verify token and get user ────────────────────────────────
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error('NOTIFICATIONS_FETCH_ERROR — Verifikasi token gagal:', userError);
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    // ── Pull notifications via service_role client ────────────────
    const serviceSupabase = getServiceSupabase();
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