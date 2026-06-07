import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('REVIEW_SUBMIT_ERROR: Missing environment variables.');
      return NextResponse.json({ error: 'Konfigurasi server tidak lengkap.' }, { status: 500 });
    }

    // ── Step 1: Extract token from Authorization header ───────────
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.error('REVIEW_SUBMIT_ERROR — Token tidak ditemukan di header.');
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    // ── Step 2: Verify token and get user ─────────────────────────
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error('REVIEW_SUBMIT_ERROR — Verifikasi token gagal:', userError);
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const userId = userData.user.id;

    // ── Step 2: Parse body ─────────────────────────────────────────
    const body = await request.json();
    const { facilityId, rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating (1-5) wajib diisi.' }, { status: 400 });
    }

    // Cek apakah facilityId adalah UUID valid
    var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    var safeFacilityId: string | null = null;
    if (facilityId && uuidRegex.test(facilityId)) {
      safeFacilityId = facilityId;
    }

    // ── Step 3: Insert via service_role client ─────────────────────
    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userRow } = await serviceSupabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    const userName = userRow?.username || userData.user.email?.split('@')[0] || 'User';

    const { data, error } = await serviceSupabase
      .from('reviews')
      .insert({
        user_id: userId,
        facility_id: safeFacilityId,
        stars: rating,
        comment: comment?.trim() || '',
        is_anonymous: false,
        status: 'APPROVED',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(
        'REVIEW_SUBMIT_ERROR — Insert gagal:',
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: `Gagal menyimpan ulasan: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ulasan berhasil dikirim!',
      review: {
        id: data.id,
        user_id: userId,
        user_name: userName,
        facility_id: safeFacilityId,
        stars: rating,
        comment: comment?.trim() || '',
        created_at: data.created_at,
      },
    });
  } catch (error) {
    console.error('REVIEW_SUBMIT_ERROR — Unhandled exception:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat menyimpan ulasan.' },
      { status: 500 }
    );
  }
}