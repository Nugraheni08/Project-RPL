import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
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

    // ── Step 2: Parse body ─────────────────────────────────────────
    const body = await request.json();
    const { facilityType, locationRef, description } = body;

    if (!facilityType) {
      return NextResponse.json({ error: 'Tipe fasilitas wajib dipilih.' }, { status: 400 });
    }
    if (!locationRef) {
      return NextResponse.json({ error: 'Lokasi fasilitas wajib dipilih.' }, { status: 400 });
    }
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Deskripsi masalah wajib diisi.' }, { status: 400 });
    }

    // ── Step 3: Insert via service_role client ─────────────────────
    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await serviceSupabase
      .from('reports')
      .insert({
        user_id: userId,
        facility_type: facilityType,
        location_ref: locationRef,
        description: description.trim(),
        status: 'PENDING',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(
        'REPORT_SUBMIT_ERROR:',
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: `Gagal menyimpan laporan: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Laporan berhasil dikirim!',
      report: data,
    });
  } catch (error) {
    console.error('REPORT_SUBMIT_ERROR — Unhandled:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat menyimpan laporan.' },
      { status: 500 }
    );
  }
}