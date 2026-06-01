import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const serviceSupabase = getServiceSupabase();

    const body = await request.json();
    const { rating, comment, isAnonymous } = body;

    // ── Validasi ──────────────────────────────────────────────────
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating bintang (1-5) wajib diisi.' },
        { status: 400 }
      );
    }

    // ── Ambil user dari session ───────────────────────────────────
    const { data: sessionData, error: sessionError } = await serviceSupabase.auth.getUser();
    const userId = sessionData?.user?.id || null;

    if (sessionError) {
      console.error('FEEDBACK_SUBMIT_ERROR — Gagal ambil session:', sessionError);
    }

    // ── Insert ke public.reviews ──────────────────────────────────
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