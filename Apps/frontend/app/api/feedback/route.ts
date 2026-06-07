import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const body = await request.json();
    const { rating, comment, isAnonymous } = body;

    // ── Validasi ──────────────────────────────────────────────────
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating bintang (1-5) wajib diisi.' },
        { status: 400 }
      );
    }

    // ── Step 1: Extract token from Authorization header ───────────
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      console.error('FEEDBACK_SUBMIT_ERROR — Token tidak ditemukan di header.');
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    // ── Step 2: Verify token and get user ─────────────────────────
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error('FEEDBACK_SUBMIT_ERROR — Verifikasi token gagal:', userError);
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const userId = userData.user.id;

    // ── Step 3: Insert via service_role client ─────────────────────
    const serviceSupabase = getServiceSupabase();
    const { data, error } = await serviceSupabase
      .from('reviews')
      .insert({
        user_id: isAnonymous ? null : userId,
        facility_id: null,           // feedback umum, tidak spesifik ke fasilitas
        stars: rating,
        comment: comment?.trim() || '',
        is_anonymous: isAnonymous ?? false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(
        'FEEDBACK_SUBMIT_ERROR — Insert ke public.reviews gagal:',
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: `Gagal mengirim feedback: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback berhasil dikirim. Terima kasih!',
      review: data,
    });
  } catch (error) {
    console.error(
      'FEEDBACK_SUBMIT_ERROR — Unhandled exception:',
      error
    );
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat mengirim feedback.' },
      { status: 500 }
    );
  }
}