import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const serviceSupabase = getServiceSupabase();

    // ── Verifikasi session ──────────────────────────────────────────
    const { data: sessionData, error: sessionError } = await serviceSupabase.auth.getUser();
    if (sessionError || !sessionData?.user) {
      return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
    }

    const userId = sessionData.user.id;
    const body = await request.json();
    const { facilityId, rating, comment } = body;

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID diperlukan.' }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating (1-5) wajib diisi.' }, { status: 400 });
    }

    // ── Ambil nama user dari profiles/users ────────────────────────
    const { data: userRow } = await serviceSupabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    const userName = userRow?.username || sessionData.user.email?.split('@')[0] || 'User';

    // ── Insert review ──────────────────────────────────────────────
    const { data, error } = await serviceSupabase
      .from('reviews')
      .insert({
        user_id: userId,
        facility_id: facilityId,
        stars: rating,
        comment: comment?.trim() || '',
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
        facility_id: facilityId,
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